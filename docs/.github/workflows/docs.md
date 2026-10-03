# [CI документации (docs.yml)](/.github/workflows/docs.yml)

## Назначение
GitHub Actions: проверка сетевой документации на каждый `push` в `main` и `Rustified` и на каждый pull request. Запускает [check_docs.py](../../scripts/check_docs.md) без `--strict`: ошибки (битые ссылки, сироты, устаревшая карта, исходник без зеркала, оформление) валят проверку, предупреждения только печатаются.

## Ключевое
- `ubuntu-latest`, `actions/checkout@v4`, Python 3.12 через `actions/setup-python@v5`.
- Зависимостей нет: линтер использует только стандартную библиотеку и `git ls-files`.

## Связи
- Развёртывание: [deploy.yml](deploy.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-03
