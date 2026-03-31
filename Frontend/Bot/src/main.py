import asyncio
import logging
import os
import signal
import sys
from pathlib import Path

# Добавляем src в Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from monitor import StreamMonitor
from telegram_bot import TelegramBot

# Загрузка переменных окружения
load_dotenv('/app/config/.env')

class StreamMonitorApp:
    def __init__(self):
        self.setup_logging()
        self.monitor = None
        self.telegram_bot = None
        self.running = False
    
    def setup_logging(self):
        """Настройка логирования"""
        log_level = os.getenv('LOG_LEVEL', 'INFO')
        
        logging.basicConfig(
            level=getattr(logging, log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('/app/logs/monitor.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        # Создание директории логов
        Path('/app/logs').mkdir(parents=True, exist_ok=True)
    
    def setup_signal_handlers(self):
        """Настройка обработчиков сигналов"""
        def signal_handler(signum, frame):
            logging.info(f"Получен сигнал {signum}, остановка...")
            self.running = False
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    async def cleanup(self):
        """Очистка ресурсов"""
        if self.telegram_bot:
            # Остановка Telegram бота
            self.telegram_bot.stop()
            logging.info("🤖 Telegram бот остановлен")
        
        if self.monitor:
            # Остановка Twitch монитора
            logging.info("📡 Twitch монитор остановлен")
    
    async def run(self):
        """Основной цикл приложения"""
        self.setup_signal_handlers()
        
        # Проверка переменных окружения
        client_id = os.getenv('TWITCH_CLIENT_ID')
        client_secret = os.getenv('TWITCH_CLIENT_SECRET')
        db_path = os.getenv('DB_PATH', '/app/data/streams.db')
        channels_file = '/app/config/channels.txt'
        
        if not client_id or not client_secret:
            logging.error("TWITCH_CLIENT_ID и TWITCH_CLIENT_SECRET должны быть установлены")
            return False
        
        # Инициализация Telegram бота
        telegram_token = os.getenv('TELEGRAM_BOT_TOKEN')
        if telegram_token:
            self.telegram_bot = TelegramBot(telegram_token, channels_file)
            logging.info("🤖 Telegram бот инициализирован")
        else:
            logging.warning("⚠️ TELEGRAM_BOT_TOKEN не указан, уведомления будут отключены")
        
        # Инициализация монитора
        self.monitor = StreamMonitor(client_id, client_secret, db_path)
        
        # Передаем Telegram бот в монитор для уведомлений
        if self.telegram_bot:
            self.monitor.telegram_bot = self.telegram_bot
            # Запускаем polling в отдельном потоке
            self.telegram_bot.start_polling()
        
        self.running = True
        
        try:
            # Запуск мониторинга
            logging.info("🚀 Запуск мониторинга Twitch стримов...")
            await self.monitor.start_monitoring(channels_file)
            
        except Exception as e:
            logging.error(f"Критическая ошибка: {e}")
            return False
        
        return True

async def main():
    """Точка входа"""
    app = StreamMonitorApp()
    
    try:
        success = await app.run()
        if not success:
            sys.exit(1)
    except KeyboardInterrupt:
        logging.info("Получен KeyboardInterrupt, остановка...")
    except Exception as e:
        logging.error(f"Непредвиденная ошибка: {e}")
        sys.exit(1)
    finally:
        await app.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
