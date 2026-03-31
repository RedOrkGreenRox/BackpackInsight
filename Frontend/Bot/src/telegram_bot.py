import asyncio
import logging
import json
import os
from typing import Dict, List, Set, Optional
import telebot
from telebot import types
import threading

class TelegramBot:
    def __init__(self, token: str, channels_file: str):
        self.token = token
        self.channels_file = channels_file
        self.enabled = bool(token)
        self.bot = None
        self.whitelist_file = '/app/config/whitelist.json'
        
        if self.enabled:
            self.bot = telebot.TeleBot(token)
            self.setup_handlers()
            logging.info("🤖 Telegram бот инициализирован")
    
    def load_whitelist(self) -> Dict:
        """Загрузка белого списка"""
        try:
            if os.path.exists(self.whitelist_file):
                with open(self.whitelist_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                # Создаем пустой whitelist
                default_whitelist = {"users": [], "groups": []}
                with open(self.whitelist_file, 'w', encoding='utf-8') as f:
                    json.dump(default_whitelist, f, indent=2)
                return default_whitelist
        except Exception as e:
            logging.error(f"Ошибка загрузки whitelist: {e}")
            return {"users": [], "groups": []}
    
    def is_whitelisted(self, user_id: int, chat_id: int) -> bool:
        """Проверка доступа к боту"""
        whitelist = self.load_whitelist()
        
        # Проверка пользователя
        if user_id in whitelist.get("users", []):
            return True
        
        # Проверка чата
        if chat_id in whitelist.get("groups", []):
            return True
        
        return False
    
    def is_admin(self, bot: telebot.TeleBot, user_id: int, chat_id: int) -> bool:
        """Проверка прав администратора"""
        try:
            chat_member = bot.get_chat_member(chat_id, user_id)
            return chat_member.status in ['administrator', 'creator']
        except Exception:
            return False
    
    def load_channels(self) -> Set[str]:
        """Загрузка списка каналов"""
        try:
            with open(self.channels_file, 'r', encoding='utf-8') as f:
                channels = set()
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        channels.add(line.lstrip('@').lower())
                return channels
        except Exception as e:
            logging.error(f"Ошибка загрузки каналов: {e}")
            return set()
    
    def save_channels(self, channels: Set[str]):
        """Сохранение списка каналов"""
        try:
            with open(self.channels_file, 'w', encoding='utf-8') as f:
                for channel in sorted(channels):
                    f.write(f"{channel}\n")
        except Exception as e:
            logging.error(f"Ошибка сохранения каналов: {e}")
    
    def handle_start(self, message: types.Message):
        """Команда /start"""
        user_id = message.from_user.id
        chat_id = message.chat.id
        
        # Проверка доступа
        if not self.is_whitelisted(user_id, chat_id):
            self.bot.reply_to(message, "🚫 У вас нет доступа к этому боту")
            return
        
        help_text = """🤖 **Twitch Stream Monitor Bot**

📋 **Доступные команды:**
/start - это сообщение
/list - показать все каналы в мониторинге
/add @имя_стримера - добавить стримера
/remove @имя_стримера - удалить стримера

**Примечание:**
- В группах команды доступны только администраторам
- В личных сообщениях - только пользователям из белого списка"""
        
        self.bot.reply_to(message, help_text, parse_mode='Markdown')
    
    def handle_list(self, message: types.Message):
        """Команда /list"""
        user_id = message.from_user.id
        chat_id = message.chat.id
        
        # Проверка доступа
        if not self.is_whitelisted(user_id, chat_id):
            self.bot.reply_to(message, "🚫 У вас нет доступа к этой команде")
            return
        
        channels = self.load_channels()
        
        if not channels:
            self.bot.reply_to(message, "📋 Список каналов пуст")
            return
        
        response = "📋 **Каналы в мониторинге:**\n\n"
        for channel in sorted(channels):
            response += f"• @{channel}\n"
        
        self.bot.reply_to(message, response, parse_mode='Markdown')
    
    def handle_add(self, message: types.Message):
        """Команда /add"""
        user_id = message.from_user.id
        chat_id = message.chat.id
        
        # Проверка доступа
        if not self.is_whitelisted(user_id, chat_id):
            self.bot.reply_to(message, "🚫 У вас нет доступа к этой команде")
            return
        
        # В группах проверяем админа
        if message.chat.type in ['group', 'supergroup']:
            if not self.is_admin(self.bot, user_id, chat_id):
                self.bot.reply_to(message, "🚫 Только администраторы могут добавлять стримеров")
                return
        
        # Парсим аргументы
        args = message.text.split()[1:] if len(message.text.split()) > 1 else []
        if not args or len(args) != 1:
            self.bot.reply_to(message, "❌ Использование: /add @имя_стримера")
            return
        
        channel = args[0].lstrip('@').lower()
        
        # Загружаем текущие каналы
        channels = self.load_channels()
        
        # Проверяем дубликат
        if channel in channels:
            self.bot.reply_to(message, f"⚠️ Стример @{channel} уже в списке")
            return
        
        # Добавляем канал
        channels.add(channel)
        self.save_channels(channels)
        
        self.bot.reply_to(message, f"✅ Стример @{channel} добавлен в список")
        logging.info(f"Пользователь {user_id} добавил стримера {channel}")
    
    def handle_remove(self, message: types.Message):
        """Команда /remove"""
        user_id = message.from_user.id
        chat_id = message.chat.id
        
        # Проверка доступа
        if not self.is_whitelisted(user_id, chat_id):
            self.bot.reply_to(message, "🚫 У вас нет доступа к этой команде")
            return
        
        # В группах проверяем админа
        if message.chat.type in ['group', 'supergroup']:
            if not self.is_admin(self.bot, user_id, chat_id):
                self.bot.reply_to(message, "🚫 Только администраторы могут удалять стримеров")
                return
        
        # Парсим аргументы
        args = message.text.split()[1:] if len(message.text.split()) > 1 else []
        if not args or len(args) != 1:
            self.bot.reply_to(message, "❌ Использование: /remove @имя_стримера")
            return
        
        channel = args[0].lstrip('@').lower()
        
        # Загружаем текущие каналы
        channels = self.load_channels()
        
        # Проверяем наличие
        if channel not in channels:
            self.bot.reply_to(message, f"⚠️ Стример @{channel} не найден в списке")
            return
        
        # Удаляем канал
        channels.remove(channel)
        self.save_channels(channels)
        
        self.bot.reply_to(message, f"✅ Стример @{channel} удален из списка")
        logging.info(f"Пользователь {user_id} удалил стримера {channel}")
    
    def handle_message(self, message: types.Message):
        """Обработчик обычных сообщений - работает для всех"""
        user_id = message.from_user.id
        chat_id = message.chat.id
        username = message.from_user.username or "N/A"
        first_name = message.from_user.first_name or "N/A"
        message_text = message.text
        
        # В группах не отвечаем на сообщения
        if message.chat.type in ['group', 'supergroup']:
            return
        
        # В личных сообщениях отвечаем с ID для настройки whitelist
        response_text = f"""🆔 **Ваши ID для настройки:**

👤 **User ID:** `{user_id}`
💬 **Chat ID:** `{chat_id}`

📋 **Информация:**
   • Username: @{username}
   • Имя: {first_name}
   • Тип чата: {message.chat.type}

⚙️ **Что делать с этими ID:**
   1. Добавьте `{user_id}` в `config/whitelist.json` в секцию `"users"`
   2. Если нужно добавить групповой чат, добавьте `{chat_id}` в секцию `"groups"`
   3. Перезапустите бота: `docker-compose restart twitch-monitor`

📝 **Ваше сообщение:** {message_text}

💡 **Используйте /start для списка команд после добавления в whitelist."""
        
        self.bot.reply_to(message, response_text, parse_mode='Markdown')
        logging.info(f"Сообщение от пользователя {user_id} в чате {chat_id}: {message_text}")
    
    def setup_handlers(self):
        """Настройка обработчиков команд"""
        self.bot.message_handler(commands=['start'])(self.handle_start)
        self.bot.message_handler(commands=['list'])(self.handle_list)
        self.bot.message_handler(commands=['add'])(self.handle_add)
        self.bot.message_handler(commands=['remove'])(self.handle_remove)
        
        # Обработчик для обычных сообщений (не команд)
        self.bot.message_handler(func=lambda message: True)(self.handle_message)
    
    def start_polling(self):
        """Запуск polling в отдельном потоке"""
        if not self.enabled:
            logging.warning("Telegram бот не настроен (отсутствует токен)")
            return
        
        def run_polling():
            try:
                logging.info("🤖 Telegram бот запущен")
                self.bot.polling(none_stop=True)
            except Exception as e:
                logging.error(f"Ошибка polling Telegram бота: {e}")
        
        # Запускаем в отдельном потоке
        polling_thread = threading.Thread(target=run_polling, daemon=True)
        polling_thread.start()
    
    def stop(self):
        """Остановка Telegram бота"""
        if self.bot:
            self.bot.stop_polling()
            logging.info("🤖 Telegram бот остановлен")
    
    def send_notification(self, event_type: str, data: Dict):
        """Отправка уведомления о стриме"""
        if not self.enabled:
            return
        
        try:
            whitelist = self.load_whitelist()
            
            # Дебаг: логируем полученные данные
            logging.info(f"🔍 Дебаг: получены данные для {event_type}: {data}")
            
            if event_type == 'stream_online':
                # Очистка данных от HTML-небезопасных символов
                channel = data.get('channel', 'Unknown').replace('<', '&lt;').replace('>', '&gt;')
                game = data.get('game', 'Unknown').replace('<', '&lt;').replace('>', '&gt;')
                title = data.get('title', 'No Title').replace('<', '&lt;').replace('>', '&gt;')
                viewers = str(data.get('viewers', 0))
                started_at = data.get('started_at', 'Unknown').replace('<', '&lt;').replace('>', '&gt;')
                
                message = f"""🔴 <b>{channel}</b> НАЧАЛ СТРИМ!

🎮 <b>Игра:</b> {game}
📝 <b>Название:</b> {title}
👥 <b>Зрители:</b> {viewers}
🕐 <b>Начало:</b> {started_at}

🔗 <a href="https://twitch.tv/{channel}">Открыть стрим</a>"""
                
                # Дебаг: логируем итоговое сообщение
                logging.info(f"🔍 Дебаг: итоговое сообщение: {message}")
                
                # Отправка всем пользователям в whitelist
                for user_id in whitelist.get("users", []):
                    try:
                        self.bot.send_message(user_id, message, parse_mode='HTML')
                        logging.info(f"✅ Уведомление отправлено пользователю {user_id}")
                    except Exception as e:
                        logging.error(f"❌ Ошибка отправки пользователю {user_id}: {e}")
                        logging.error(f"🔍 Дебаг: сообщение вызвавшее ошибку: {message}")
                
                # Отправка всем группам в whitelist
                for chat_id in whitelist.get("groups", []):
                    try:
                        self.bot.send_message(chat_id, message, parse_mode='HTML')
                        logging.info(f"✅ Уведомление отправлено в группу {chat_id}")
                    except Exception as e:
                        logging.error(f"❌ Ошибка отправки в группу {chat_id}: {e}")
                        logging.error(f"🔍 Дебаг: сообщение вызвавшее ошибку: {message}")
                
                logging.info(f"📢 Уведомление о начале стрима {data.get('channel', 'Unknown')} отправлено")
            
            elif event_type == 'stream_offline':
                channel = data.get('channel', 'Unknown').replace('<', '&lt;').replace('>', '&gt;')
                message = f"⚫ <b>{channel}</b> ЗАКОНЧИЛ СТРИМ"
                
                # Дебаг: логируем итоговое сообщение
                logging.info(f"🔍 Дебуг: итоговое сообщение offline: {message}")
                
                # Отправка всем пользователям в whitelist
                for user_id in whitelist.get("users", []):
                    try:
                        self.bot.send_message(user_id, message, parse_mode='HTML')
                        logging.info(f"✅ Уведомление offline отправлено пользователю {user_id}")
                    except Exception as e:
                        logging.error(f"❌ Ошибка отправки пользователю {user_id}: {e}")
                        logging.error(f"🔍 Дебаг: сообщение вызвавшее ошибку: {message}")
                
                # Отправка всем группам в whitelist
                for chat_id in whitelist.get("groups", []):
                    try:
                        self.bot.send_message(chat_id, message, parse_mode='HTML')
                        logging.info(f"✅ Уведомление offline отправлено в группу {chat_id}")
                    except Exception as e:
                        logging.error(f"❌ Ошибка отправки в группу {chat_id}: {e}")
                        logging.error(f"🔍 Дебаг: сообщение вызвавшее ошибку: {message}")
                
                logging.info(f"📢 Уведомление о конце стрима {data.get('channel', 'Unknown')} отправлено")
            
        except Exception as e:
            logging.error(f"❌ Ошибка отправки уведомления: {e}")
            logging.error(f"🔍 Дебаг: исходные данные: {data}")
            import traceback
            logging.error(f"🔍 Дебаг: traceback: {traceback.format_exc()}")
