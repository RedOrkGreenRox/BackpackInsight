# [Линтер документации (check_docs.py)](/scripts/check_docs.py)

## Назначение
Точка входа линтера сетевой документации: запускает проверки из пакета [docs_lint](docs_lint/__init__.md), печатает отчёт и возвращает код 1, если есть ошибки. Правила, которые он проверяет, записаны в `ARENA.MD` §1–2. В CI запускается workflow [docs.yml](../.github/workflows/docs.md).

```bash
python3 scripts/check_docs.py           # ошибки валят запуск, предупреждения печатаются
python3 scripts/check_docs.py --strict  # предупреждения тоже валят запуск
```

## Проверки
| Раздел | Уровень | Что ловит | Модуль |
| :--- | :--- | :--- | :--- |
| `LINKS` | ошибка | ссылка на несуществующий файл или якорь `#…` в `.md` | [graph.py](docs_lint/graph.md) |
| `TREE` | ошибка | документ, недостижимый по ссылкам от `README.md` и `docs/structure.md` | [graph.py](docs_lint/graph.md) |
| `FRESH` | ошибка | `docs/structure.md` отличается от того, что выдаёт [generate_structure.py](generate_structure.md) | [graph.py](docs_lint/graph.md) |
| `MIRROR` | ошибка | исходник под git без документа, чей H1 ведёт на него | [mirror.py](docs_lint/mirror.md) |
| `MIRROR` | предупреждение | несколько документов с H1 на один исходник | [mirror.py](docs_lint/mirror.md) |
| `STRUCT` | ошибка | у файлового документа нет «Назначения»; нет подписи или она не в конце; больше 250 строк | [mirror.py](docs_lint/mirror.md) |
| `STRUCT` | предупреждение | больше 150 строк; обещания (`будем`, `скоро`, `todo`…) вне раздела «Планируется» | [mirror.py](docs_lint/mirror.md) |
| `COMPLETE` | предупреждение | документ упоминает меньше половины символов своего исходника | [truth.py](docs_lint/truth.md) |
| `TRUTH` | предупреждение | документ показывает как код имя, которого нет ни в связанных исходниках, ни где-либо в коде | [truth.py](docs_lint/truth.md) |

`COMPLETE` и `TRUTH` остаются предупреждениями, потому что сверка по регулярным выражениям даёт ложные срабатывания: внешние типы (`DocumentFragment`), имена из CSS-префиксов, переменные окружения.

## Связи
- Файлы, ссылки и исходники: [files.py](docs_lint/files.md). Символы по языкам: [symbols.py](docs_lint/symbols.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-03
