"""
Тесты на data.py: загрузка items_*.json, версионирование.
"""
from __future__ import annotations

from Backend.PlayerData import data


class TestItemsLoader:
    def test_get_items_non_empty(self):
        items = data.get_items()
        assert isinstance(items, dict)
        assert len(items) > 100, "items_*.json должен содержать сотни предметов"

    def test_known_items_present(self):
        items = data.get_items()
        assert "Wooden Sword" in items
        assert "Apple" in items

    def test_get_craftable_ids(self):
        ids = data.get_all_craftable_ids()
        assert isinstance(ids, (list, set))

    def test_profile_exp_need_is_tuple(self):
        # Может использоваться для расчётов уровня
        assert isinstance(data.PROFILE_EXP_NEED, tuple)
        assert len(data.PROFILE_EXP_NEED) > 50


class TestVersionDetection:
    def test_latest_items_file_exists(self):
        path = data.get_latest_items_file()
        # Должен быть либо None, либо валидный путь к items_*.json
        if path is not None:
            assert "items_" in str(path)
            assert str(path).endswith(".json")
