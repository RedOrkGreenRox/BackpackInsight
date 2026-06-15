# [Docker Compose — продакшн (docker-compose.server.yml)](../docker-compose.server.yml)

## Назначение
Прод-оркестрация на сервере: те же сервисы, но с лимитами памяти, без открытых наружу портов БД и с передачей секретов через env_file.

## Отличия от [локального](docker-compose.md)
*   `db`: порт 5432 НЕ публикуется; `deploy.resources.limits.memory: 300M`.
*   Секрет `API_SECRET` передаётся только через env_file (не в открытом виде).
*   Ориентирован на запуск из CI ([deploy.yml](.github/workflows/deploy.md)).

## AI-контекст
*   Используется в CD-пайплайне (`docker compose -f docker-compose.server.yml ...`). Лимит памяти БД оставляет ресурсы бэкенду на小 VPS.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
