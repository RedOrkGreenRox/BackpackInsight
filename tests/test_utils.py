"""
Тесты на хелперы Backend/PlayerData/utils.py.
"""
from __future__ import annotations

import pytest

from Backend.PlayerData.utils import (
    create_item_definition_safe,
    safe_get_nested,
)


class TestSafeGetNested:
    def test_simple(self):
        assert safe_get_nested({"a": 1}, ["a"]) == 1

    def test_nested(self):
        d = {"a": {"b": {"c": 42}}}
        assert safe_get_nested(d, ["a", "b", "c"]) == 42

    def test_missing_returns_default(self):
        assert safe_get_nested({"a": 1}, ["b"], default="X") == "X"

    def test_partial_path_missing(self):
        assert safe_get_nested({"a": 1}, ["a", "b"], default=None) is None

    def test_non_dict_in_middle(self):
        assert safe_get_nested({"a": "string"}, ["a", "b"], default="fb") == "fb"

    def test_empty_keys_returns_data(self):
        assert safe_get_nested({"x": 1}, []) == {"x": 1}


class TestCreateItemDefinitionSafe:
    def test_basic(self):
        d = create_item_definition_safe("id1", "Name 1", "Rare")
        assert d.item_id == "id1"
        assert d.name == "Name 1"
        assert d.rarity == "Rare"

    def test_default_rarity(self):
        d = create_item_definition_safe("id1", "Name 1")
        assert d.rarity == "Common"

    def test_strips_whitespace(self):
        d = create_item_definition_safe("  id  ", "  Name  ", "  Rare  ")
        assert d.item_id == "id"
        assert d.name == "Name"
        assert d.rarity == "Rare"

    def test_rejects_empty_id(self):
        with pytest.raises(ValueError, match="Item ID"):
            create_item_definition_safe("", "Name")

    def test_rejects_whitespace_id(self):
        with pytest.raises(ValueError, match="Item ID"):
            create_item_definition_safe("   ", "Name")

    def test_rejects_empty_name(self):
        with pytest.raises(ValueError, match="Item name"):
            create_item_definition_safe("id1", "")
