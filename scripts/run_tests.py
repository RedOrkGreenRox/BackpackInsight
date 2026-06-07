"""
Запуск тестов из любого места проекта.

Usage:
    python scripts/run_tests.py            # все тесты
    python scripts/run_tests.py -k models  # фильтр по имени
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parent.parent
    os.chdir(project_root)
    sys.path.insert(0, str(project_root))

    extra = sys.argv[1:]
    exit_code = pytest.main(["-v", "tests/", *extra])
    sys.exit(exit_code)
