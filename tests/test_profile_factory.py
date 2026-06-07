"""
Тесты на ProfileFactory: парсинг, валидация, кеш определений.
"""
from __future__ import annotations

import pytest

from Backend.PlayerData.models import Hero, Item, ItemDefinition, Profile
from Backend.PlayerData.services.ProfileFactory import ProfileFactory


class TestValidation:
    def test_rejects_non_dict(self):
        with pytest.raises(ValueError, match="Root must be an object"):
            ProfileFactory._validate_json("not a dict")

    def test_rejects_missing_data_section(self):
        with pytest.raises(ValueError, match="Missing 'Data'"):
            ProfileFactory._validate_json({"Name": "x", "UID": "1", "Item": {}})

    def test_rejects_no_hero_no_item(self):
        with pytest.raises(ValueError, match="does not contain"):
            ProfileFactory._validate_json({"Data": {}, "UID": "1", "Name": "x"})

    def test_rejects_no_uid(self):
        with pytest.raises(ValueError, match="UID not found"):
            ProfileFactory._validate_json({"Data": {}, "Name": "x", "Item": {}})

    def test_rejects_no_nickname(self):
        with pytest.raises(ValueError, match="Nickname not found"):
            ProfileFactory._validate_json({"Data": {"UID": "1"}, "Item": {}})

    def test_accepts_valid_minimal(self, profile_json_minimal):
        # Не должно бросать
        ProfileFactory._validate_json(profile_json_minimal)

<<<<<<< HEAD
=======
    def test_rejects_empty_nickname(self):
        with pytest.raises(ValueError, match="Nickname not found"):
            ProfileFactory._validate_json({"Data": {"UID": "1"}, "Name": "", "Item": {}})


>>>>>>> 6478df2

class TestCreateProfile:
    def test_smoke(self, session, profile_json_minimal):
        profile = ProfileFactory.create_profile(profile_json_minimal)
        assert profile.nickname == "TestPlayer"
        assert len(profile.heroes) == 2

    def test_currency_extracted(self, session, profile_json_full):
        profile = ProfileFactory.create_profile(profile_json_full)
        assert profile.coins == 99999
        assert profile.gems == 500

    def test_trophies_include_bonus(self, session, profile_json_full):
        profile = ProfileFactory.create_profile(profile_json_full)
        # 5000 Trophy + 250 BonusTrophy
        assert profile.trophies == 5250

    def test_app_version(self, session, profile_json_full):
        profile = ProfileFactory.create_profile(profile_json_full)
        assert profile.app_version == "5.0.0"


class TestCache:
    def test_clear_resets_stats(self):
        ProfileFactory._cache_hits = 50
        ProfileFactory._cache_misses = 10
        ProfileFactory.clear_cache()

        stats = ProfileFactory.get_cache_statistics()
        assert stats["cache_hits"] == 0
        assert stats["cache_misses"] == 0
        assert stats["cache_size"] == 0

    def test_statistics_hit_rate(self):
        ProfileFactory.clear_cache()
        ProfileFactory._cache_hits = 80
        ProfileFactory._cache_misses = 20
        stats = ProfileFactory.get_cache_statistics()
        assert stats["hit_rate_percent"] == 80.0

    def test_preload_populates_cache(self, session):
        ProfileFactory.clear_cache()
        ProfileFactory.preload_definitions(session)
        assert len(ProfileFactory.get_cached_definitions()) > 0


class TestUnlockableParsing:
    def test_skin_pattern(self):
        game_data = {"Skins": {}}
        ProfileFactory._parse_skins(["WarriorSkinGold", "BarbSkinFire"], game_data)
        assert game_data["Skins"]["Warrior"] == ["Gold"]
        assert game_data["Skins"]["Barb"] == ["Fire"]

    def test_skin_ignores_garbage(self):
        game_data = {"Skins": {}}
        ProfileFactory._parse_skins(
            ["NotASkin", 123, None, "WarriorSkinGold"],
            game_data,
        )
        assert "Warrior" in game_data["Skins"]
        assert len(game_data["Skins"]) == 1

    def test_banner_pattern(self):
        game_data = {"Banners": []}
        ProfileFactory._parse_banners(["Season01Banner01", "WinterBannerSpecial"], game_data)
        assert "Season01" in game_data["Banners"]
        assert "Winter" in game_data["Banners"]

    def test_combined_unlockables(self, profile_json_full):
        game_data = {"Skins": {}, "Banners": []}
        ProfileFactory._parse_unlockables(profile_json_full["UL"], game_data)
        assert len(game_data["Skins"]) > 0
        assert len(game_data["Banners"]) > 0
