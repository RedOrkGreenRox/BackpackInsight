# cli — CLI-доступ к корневому oracle

`cli` — первый прототип будущей команды `bi` / oracle CLI.

На текущей контрольной точке реализовано:

```bash
cargo run -p cli -- slug "Robo Rat 2.0"
cargo run -p cli -- image-key "Suspicious Sausage"
cargo run -p cli -- image-key --rarity Special --tooltip "Step IV: ..." "Any Plan"
cargo run -p cli -- level --xp 123456
cargo run -p cli -- area --trophy 30000 --bonus 6394
cargo run -p cli -- hero --name Warrior --level-raw 25 --xp 0 --rating 5000
cargo run -p cli -- item-level --rarity Common --level 10 --cards 500
cargo run -p cli -- check-images
```

Команды используют `core`:

```text
SlugService
ItemIconService
LevelService
AreaService
HeroService
ItemLevelService
```

`check-images` пока проверяет текущий plain JSON-каталог `Backend/DB/items_*.json` и наличие картинок в:

```text
Frontend/Web/static/images/items/webp
Frontend/Web/static/images/items/avif
```

В будущем здесь появятся:

```text
validate
dump
explain
diff
budget
```

---
> 📌 **Подпись документации:** описание CLI-прототипа пятой контрольной точки, 2026-07-06.
