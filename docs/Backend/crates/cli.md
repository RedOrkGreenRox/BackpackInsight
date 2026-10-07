# Обзор крейта cli (crates/cli/)

Crate `cli` — консольная утилита, которая вызывает сервисы crate [core](core.md) по одному и печатает результат. Нужна для ручной сверки правил (слаги, ключи картинок, уровни, арены, герои, предметы, разблокировки, проверка профиля) с поведением игры и старого бэкенда. Зависимости — только core и serde_json; сервер её не использует.

## Примеры
```bash
cargo run -p cli -- slug "Robo Rat 2.0"
cargo run -p cli -- image-key --rarity Special --tooltip "Step IV: ..." "Any Plan"
cargo run -p cli -- level --xp 123456
cargo run -p cli -- area --trophy 30000 --bonus 6394
cargo run -p cli -- hero --name Warrior --level-raw 25 --xp 0 --rating 5000
cargo run -p cli -- item-level --rarity Common --level 10 --cards 500
cargo run -p cli -- profile-check --file tests/fixtures/profiles/Sky.json
cargo run -p cli -- check-images
```

Все 14 команд и их флаги — [src/main](cli/src/main.md).

## Планируется
Команды `validate`, `dump`, `explain`, `diff` и `budget` упоминались в ранних планах; в коде их нет и срок не назначен.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
