import asyncio
import logging
from typing import Dict, List, Set
from datetime import datetime
import sqlite3
from pathlib import Path

import twitchio
from twitchio.ext import commands

try:
    from .database import DatabaseManager
except ImportError:
    # Для локального запуска
    from database import DatabaseManager

class StreamMonitor(twitchio.Client):
    def __init__(self, client_id: str, client_secret: str, db_path: str):
        # Правильная инициализация Client с автоматическим получением токена
        super().__init__(client_id=client_id, client_secret=client_secret)
        self.db = DatabaseManager(db_path)
        self.telegram_bot = None  # Будет установлен из main.py
        self.channels_to_monitor: Set[str] = set()
        self.active_streams: Dict[str, dict] = {}
        self._setup_complete = False
        self._monitoring_task = None
    
    async def load_channels_from_file(self, file_path: str):
        """Загрузка списка каналов из файла"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            channels = []
            for line in lines:
                line = line.strip()
                if line and not line.startswith('#'):
                    channels.append(line.lower())
            
            self.channels_to_monitor = set(channels)
            logging.info(f"Загружено {len(channels)} каналов для мониторинга")
            return channels
            
        except Exception as e:
            logging.error(f"Ошибка загрузки каналов: {e}")
            return []
    
    async def setup_monitoring(self, channels_file: str):
        """Настройка мониторинга стримов"""
        try:
            # Загрузка каналов из файла
            await self.load_channels_from_file(channels_file)
            
            if not self.channels_to_monitor:
                logging.warning("⚠️ Нет каналов для мониторинга")
                return False
            
            logging.info(f"📋 Загружено {len(self.channels_to_monitor)} каналов для мониторинга")
            
            self._setup_complete = True
            return True
            
        except Exception as e:
            logging.error(f"❌ Ошибка настройки мониторинга: {e}")
            return False
    
    async def _check_stream_status(self, channel_name: str) -> dict:
        """Проверка статуса стрима через API"""
        try:
            # Используем правильный метод согласно документации
            streams = await self.fetch_streams(user_logins=[channel_name])
            
            if streams and len(streams) > 0:
                stream = streams[0]
                return {
                    'online': True,
                    'channel': stream.user.name,
                    'game': stream.game_name if stream.game_name else 'Unknown',
                    'title': stream.title if stream.title else 'No Title',
                    'viewers': stream.viewer_count,
                    'started_at': stream.started_at.isoformat(),
                    'thumbnail_url': getattr(stream, 'thumbnail_url', ''),
                    'tags': getattr(stream, 'tags', [])
                }
            else:
                return {'online': False, 'channel': channel_name}
                
        except Exception as e:
            logging.error(f"Ошибка проверки статуса {channel_name}: {e}")
            return {'online': False, 'channel': channel_name}
    
    def _get_optimal_interval(self, channels_count: int) -> int:
        """Расчет оптимального интервала проверки в секундах"""
        # Twitch API лимит с токеном: 800 запросов в минуту
        # Используем 70% от лимита для безопасности
        api_limit_per_minute = 800 * 0.7  # 560 запросов/минуту
        
        # Минимальный интервал 2 секунды (максимальная скорость)
        min_interval = 2
        
        # Максимальный интервал 30 секунд (минимальная скорость)
        max_interval = 30
        
        if channels_count == 0:
            return max_interval
        
        # Расчет интервала
        requests_per_second = api_limit_per_minute / 60
        optimal_interval = channels_count / requests_per_second
        
        # Ограничиваем диапазон
        interval = max(min_interval, min(max_interval, int(optimal_interval)))
        
        logging.info(f"📊 Интервал проверки: {interval}сек ({channels_count} каналов, ~{60/interval:.1f} проверок/минуту)")
        return interval
    
    async def _monitor_streams(self):
        """Основной цикл мониторинга стримов"""
        while self._setup_complete:
            try:
                # Расчет оптимального интервала
                channels_count = len(self.channels_to_monitor)
                interval = self._get_optimal_interval(channels_count)
                
                for channel_name in list(self.channels_to_monitor):
                    current_status = await self._check_stream_status(channel_name)
                    
                    if current_status['online']:
                        # Стрим онлайн
                        if channel_name not in self.active_streams:
                            # Новый стрим начался
                            self.active_streams[channel_name] = current_status
                            
                            # Сохранение в базу данных
                            await self.db.add_stream_start(current_status)
                            
                            # Отправка уведомления
                            if self.telegram_bot:
                                self.telegram_bot.send_notification('stream_online', current_status)
                            
                            logging.info(f"🔴 {channel_name} начал стрим: {current_status['title']}")
                    else:
                        # Проверяем, был ли стрим активен
                        if channel_name in self.active_streams:
                            # Стрим закончился
                            stream_info = self.active_streams[channel_name]
                            
                            # Обновление в базе данных
                            await self.db.add_stream_end(channel_name)
                            
                            # Удаление из активных
                            del self.active_streams[channel_name]
                            
                            # Отправка уведомления через Telegram бот
                            if self.telegram_bot:
                                self.telegram_bot.send_notification('stream_offline', stream_info)
                            
                            logging.info(f"⚫ {channel_name} закончил стрим")
                
                # Пауза с динамическим интервалом
                await asyncio.sleep(interval)
                
            except Exception as e:
                logging.error(f"Ошибка в цикле мониторинга: {e}")
                await asyncio.sleep(60)  # Ждем дольше при ошибке
    
    async def _get_users_batch(self, channels: List[str]) -> List[twitchio.User]:
        """Получение информации о пользователях через HTTP API"""
        users = []
        
        # Обрабатываем по 100 пользователей за раз (лимит Twitch API)
        batch_size = 100
        for i in range(0, len(channels), batch_size):
            batch = channels[i:i + batch_size]
            try:
                # Используем правильный метод с именованными параметрами
                response = await self.fetch_users(logins=batch)
                
                if response:
                    for user in response:
                        users.append(user)
                        logging.info(f"✅ Найден пользователь: {user.name}")
                        
            except Exception as e:
                logging.error(f"Ошибка получения пользователей для batch {batch}: {e}")
                # Если ошибка с токеном, ждем когда он будет сгенерирован автоматически
                if "401" in str(e) or "Unauthorized" in str(e):
                    logging.info("⏳ Ожидание генерации токена...")
                    await asyncio.sleep(2)  # Даем время на генерацию токена
                    try:
                        # Повторная попытка после генерации токена
                        response = await self.fetch_users(logins=batch)
                        if response:
                            for user in response:
                                users.append(user)
                                logging.info(f"✅ Найден пользователь: {user.name}")
                    except Exception as retry_e:
                        logging.error(f"Повторная попытка не удалась: {retry_e}")
                continue
        
        return users
    
    async def _subscribe_to_channel_events(self, user: twitchio.User):
        """Подписка на события канала через EventSub"""
        try:
            # Подписка на начало стрима
            await self.subscribe_websocket(
                eventsub.StreamOnlineSubscription(broadcaster_user_id=user.id)
            )
            
            # Подписка на конец стрима  
            await self.subscribe_websocket(
                eventsub.StreamOfflineSubscription(broadcaster_user_id=user.id)
            )
            
            logging.info(f"✅ Подписка создана: {user.name}")
            
        except Exception as e:
            logging.error(f"❌ Ошибка подписки на {user.name}: {e}")
    
    # Методы событий (без декораторов)
    async def event_ready(self):
        """Событие готовности клиента"""
        logging.info("🚀 Twitch клиент готов к работе")
        
        if not self._setup_complete:
            logging.warning("⚠️ Мониторинг не настроен")
            return
        
        try:
            # Запуск задачи мониторинга
            self._monitoring_task = asyncio.create_task(self._monitor_streams())
            logging.info("� Запущен цикл мониторинга стримов")
            logging.info(f"� Мониторинг {len(self.channels_to_monitor)} каналов")
                
        except Exception as e:
            logging.error(f"❌ Ошибка запуска мониторинга: {e}")
    
    async def event_pubsub_message(self, message):
        """Обработка PubSub сообщений о стримах (legacy)"""
        pass  # Отключено в пользу API мониторинга
    
    async def event_stream_online(self, data):
        """Обработка начала стрима (legacy для EventSub)"""
        pass  # Отключено в пользу API мониторинга
    
    async def event_stream_offline(self, data):
        """Обработка окончания стрима (legacy для EventSub)"""
        pass  # Отключено в пользу API мониторинга
    
    async def event_error(self, error):
        """Обработка ошибок"""
        logging.error(f"❌ Ошибка Twitch клиента: {error}")
    
    async def get_active_streams_count(self):
        """Получение количества активных стримов"""
        return len(self.active_streams)
    
    async def start_monitoring(self, channels_file: str):
        """Запуск мониторинга"""
        # Настройка мониторинга
        if not await self.setup_monitoring(channels_file):
            return False
        
        # Запуск клиента (без asyncio.run так как уже в event loop)
        try:
            # Запускаем основной цикл клиента
            await self.start()
        except KeyboardInterrupt:
            logging.info("Остановка мониторинга...")
        except Exception as e:
            logging.error(f"Критическая ошибка: {e}")
        
        return True
