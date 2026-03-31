import sqlite3
import asyncio
from datetime import datetime, timezone
import logging
from typing import Dict, Any, List, Optional

class DatabaseManager:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Инициализация базы данных"""
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS streams (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    channel TEXT NOT NULL,
                    title TEXT,
                    game TEXT,
                    viewers INTEGER,
                    started_at TEXT,
                    ended_at TEXT,
                    duration_minutes INTEGER,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_channel ON streams(channel)
            ''')
            
            conn.commit()
    
    async def add_stream_start(self, stream_info: Dict[str, Any]):
        """Добавление начала стрима"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO streams (channel, title, game, viewers, started_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                stream_info['channel'],
                stream_info['title'],
                stream_info['game'],
                stream_info['viewers'],
                stream_info['started_at']
            ))
            conn.commit()
    
    async def add_stream_end(self, channel: str):
        """Добавление окончания стрима"""
        with sqlite3.connect(self.db_path) as conn:
            # Находим последний стрим канала
            cursor = conn.execute('''
                SELECT id, started_at FROM streams 
                WHERE channel = ? AND ended_at IS NULL 
                ORDER BY id DESC LIMIT 1
            ''', (channel,))
            
            result = cursor.fetchone()
            if result:
                stream_id, started_at = result
                ended_at = datetime.now(timezone.utc).isoformat()
                
                # Безопасный расчет длительности с timezone
                try:
                    # Парсим с учетом timezone
                    if started_at.endswith('Z'):
                        start = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
                    else:
                        start = datetime.fromisoformat(started_at)
                    
                    if ended_at.endswith('Z'):
                        end = datetime.fromisoformat(ended_at.replace('Z', '+00:00'))
                    else:
                        end = datetime.fromisoformat(ended_at)
                    
                    # Убеждаемся что оба datetime имеют timezone
                    if start.tzinfo is None:
                        start = start.replace(tzinfo=timezone.utc)
                    if end.tzinfo is None:
                        end = end.replace(tzinfo=timezone.utc)
                    
                    duration = int((end - start).total_seconds() / 60)
                except Exception as time_error:
                    logging.warning(f"Ошибка расчета длительности: {time_error}")
                    duration = 0
                
                conn.execute('''
                    UPDATE streams 
                    SET ended_at = ?, duration_minutes = ?
                    WHERE id = ?
                ''', (ended_at, duration, stream_id))
                
                conn.commit()
    
    async def get_stream_stats(self, channel: str = None, days: int = 7) -> List[Dict]:
        """Получение статистики стримов"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = '''
                SELECT channel, COUNT(*) as stream_count,
                       AVG(duration_minutes) as avg_duration,
                       MAX(viewers) as max_viewers
                FROM streams 
                WHERE started_at >= datetime('now', '-{} days')
            '''.format(days)
            
            if channel:
                query += f" AND channel = '{channel}'"
            
            query += " GROUP BY channel ORDER BY stream_count DESC"
            
            return [dict(row) for row in conn.execute(query)]
