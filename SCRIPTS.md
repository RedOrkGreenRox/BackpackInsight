# Скрипты проекта BackpackInsight

Все скрипты перенесены в корневую директорию проекта для удобного доступа.

## Доступные скрипты

### 🐳 `run_docker.py`
Запускает Docker контейнеры проекта с поддержкой двух режимов конфигурации.

**Способ 1: Аргументы командной строки**
```bash
python run_docker.py                    # Локальный режим (по умолчанию)
python run_docker.py --server          # Серверный режим
python run_docker.py --web-only        # Только веб-сервер (локальный)
python run_docker.py --server --web-only # Только бэкенд (серверный)
python run_docker.py --paranoid        # Пересобрать с нуля
python run_docker.py --verbose         # Подробный вывод
```

**Способ 2: Флаги в коде (приоритет над аргументами)**
Откройте `run_docker.py` и измените переменные в секции "Code Flags":
```python
# --- Code Flags (приоритет над аргументами командной строки) ---
FORCE_SERVER_MODE = True   # Принудительно серверный режим
FORCE_VERBOSE = False      # Принудительно тихий режим
FORCE_PARANOID = True     # Принудительно пересобрать с нуля
FORCE_WEB_ONLY = True     # Принудительно только веб/бэкенд
```

**Режимы:**
- **Локальный режим:** Запускает web (порт 5080) + backend (порт 8000) + БД
- **Серверный режим:** Запускает только backend (порт 8000) + БД (без веб-интерфейса)

**Приоритет:** Флаги в коде → Аргументы командной строки → Значения по умолчанию

### 🧪 `run_tests.py`
Запускает тесты проекта.
```bash
python run_tests.py
```

### 🌳 `generate_structure.py`
Генерирует структуру проекта в файл `docs/structure.txt`.
```bash
python generate_structure.py
```

### 📸 `rename_images.py`
Переименовывает изображения в нижний регистр с заменой пробелов на дефисы.
```bash
python rename_images.py
```

### 🔍 `verify_indexes.py`
Проверяет индексы PostgreSQL базы данных.
```bash
python verify_indexes.py
```

### 🚀 `git_push.py`
Автоматический git push с нормализацией окончаний строк.
```bash
python git_push.py
```

## Конфигурация

- `docker-compose.yml` - конфигурация Docker для **локального** режима
- `docker-compose.server.yml` - конфигурация Docker для **серверного** режима
- `pytest.ini` - конфигурация pytest для тестов
- `.env.example` - пример переменных окружения

## Примечание

Скрипты были перенесены из директории `scripts/` в корень проекта для упрощения запуска. Все пути в скриптах обновлены для работы из корневой директории.
