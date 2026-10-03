# [docs_lint/__init__.py](/scripts/docs_lint/__init__.py)

## Назначение
Пакет проверок сетевой документации. Сам ничего не делает: точка входа — [check_docs.py](../check_docs.md), которая импортирует модули пакета.

## Модули
| Модуль | Отвечает за |
| :--- | :--- |
| [files.py](files.md) | список документов и исходников, ссылки, разрешение путей, H1 |
| [graph.py](graph.md) | `LINKS`, `TREE`, `FRESH` |
| [mirror.py](mirror.md) | `MIRROR`, `STRUCT` |
| [symbols.py](symbols.md) | символы исходников по языкам |
| [truth.py](truth.md) | `COMPLETE`, `TRUTH` |

---

> 📌 **Подпись документации:** по исходнику · 2026-10-03
