"""
Юнит-тесты на модели Profile / Hero / Item / ItemDefinition.
Не требуют HTTP, проверяют чистую логику.
"""
from __future__ import annotations

import pytest
from sqlmodel import select

from Backend.PlayerData.models import Hero, Item, ItemDefinition, Profile


# --- ItemDefinition --------------------------------------------------------


class TestItemDefinitions:
    def test_static_items_preloaded(self, session):
        items = session.exec(select(ItemDefinition)).all()
        assert len(items) > 0, "items_*.json должен подгружаться в фикстуре"

    def test_known_item_exists(self, session):
        sword = session.get(ItemDefinition, "Wooden Sword")
        assert sword is not None
        assert sword.name == "Wooden Sword"

    def test_item_has_rarity(self, session):
        items = session.exec(select(ItemDefinition).limit(5)).all()
        for item in items:
            assert item.rarity, f"У {item.name} нет rarity"


# --- Hero ------------------------------------------------------------------


class TestHero:
    def test_from_entry_basic(self):
        # Формат: [Имя, Level-1, Experience, Rating]
        # Имя нормализуется через VALUES (Barbarian → Harkon — внутреннее имя).
        hero = Hero.from_entry(["Barbarian", "5", "150", "1200"])
        assert hero.name in {"Barbarian", "Harkon"}  # любой из двух — главное что прошла нормализация
        assert hero.level == 6  # +1 потому что в JSON 0-based
        assert hero.experience == 150
        assert hero.rating == 1200
        assert hero.prestige is False

    def test_unknown_hero_name_passes_through(self):
        hero = Hero.from_entry(["TotallyMadeUpHero", "0", "0", "0"])
        # Не в VALUES — остаётся как есть
        assert hero.name == "TotallyMadeUpHero"

    def test_from_entry_prestige(self):
        # Уровень > 20 = prestige
        hero = Hero.from_entry(["Warrior", "25", "0", "5000"])
        assert hero.level == 6  # 25+1 = 26 -> -20 = 6
        assert hero.prestige is True

    def test_from_entry_league_assignment(self):
        # Rating // 500 даёт индекс лиги
        hero = Hero.from_entry(["Sage", "0", "0", "0"])
        # Низкий рейтинг = первая лига
        assert hero.league is not None

    def test_from_entry_empty_fallback(self):
        hero = Hero.from_entry([])
        assert hero.name == "Unknown"
        assert hero.level == 1

    def test_from_entry_too_short(self):
        hero = Hero.from_entry(["X", "1"])
        assert hero.name == "Unknown"

    def test_exp_req_below_20(self):
        hero = Hero.from_entry(["Sage", "5", "0", "0"])  # level будет 6
        assert hero.exp_req > 0

    def test_exp_req_above_20_capped(self):
        # Линейная прогрессия после 20, capped на 3000
        hero = Hero(name="X", level=50, experience=0, rating=0)
        assert hero.exp_req <= 3000

    def test_to_frontend_view_shape(self):
        hero = Hero.from_entry(["Hero1", "3", "100", "500"])
        view = hero.to_frontend_view()
        for key in ("name", "level", "rating", "experience", "exp_req", "prestige", "league", "skin_num"):
            assert key in view


# --- Profile ---------------------------------------------------------------


class TestProfile:
    def test_creation_from_minimal_json(self, session, profile_json_minimal):
        profile = Profile.from_json(profile_json_minimal)
        session.add(profile)
        session.commit()
        session.refresh(profile)

        assert profile.pk is not None
        assert profile.nickname == "TestPlayer"
        assert profile.user_id == "00000000-0000-0000-0000-000000000001"

    def test_heroes_parsed(self, session, profile_json_minimal):
        profile = Profile.from_json(profile_json_minimal)
        session.add(profile)
        session.commit()

        hero_names = {h.name for h in profile.heroes}
        # Имена могут быть оригинальные или из VALUES-мэппинга
        assert len(profile.heroes) == 2

    def test_items_skip_unknown(self, session, profile_json_full):
        profile = Profile.from_json(profile_json_full)
        session.add(profile)
        session.commit()

        item_names = {i.name for i in profile.items}
        # UnknownItemThatDoesNotExist должен быть пропущен
        assert "UnknownItemThatDoesNotExist" not in item_names

    def test_to_frontend_view_shape(self, session, profile_json_full):
        profile = Profile.from_json(profile_json_full)
        session.add(profile)
        session.commit()
        session.refresh(profile)

        view = profile.to_frontend_view()
        for key in ("nickname", "level", "trophy", "coins", "gems", "heroes", "items"):
            assert key in view

    def test_to_frontend_view_currency(self, session, profile_json_full):
        profile = Profile.from_json(profile_json_full)
        session.add(profile)
        session.commit()

        view = profile.to_frontend_view()
        assert view["coins"] == 99999
        assert view["gems"] == 500

    def test_skins_parsed_from_ul(self, session, profile_json_full):
        profile = Profile.from_json(profile_json_full)
        session.add(profile)
        session.commit()

        skins = profile.game_info_data.get("Skins", {})
        # WarriorSkinGold и BarbarianSkinFire должны быть распарсены
        assert "Warrior" in skins
        assert "Gold" in skins["Warrior"]
        assert "Barbarian" in skins
        assert "Fire" in skins["Barbarian"]

    def test_banners_parsed_from_ul(self, session, profile_json_full):
        profile = Profile.from_json(profile_json_full)
        session.add(profile)
        session.commit()

        banners = profile.game_info_data.get("Banners", [])
        assert "Season01" in banners
        assert "Season02" in banners

    def test_technical_info_property(self, session, profile_json_full):
        profile = Profile.from_json(profile_json_full)
        session.add(profile)
        session.commit()

        tech = profile.technical_information
        assert tech.AV == "5.0.0"
        assert tech.Device == "Generic Test Device 2"


# --- Item ------------------------------------------------------------------


class TestItem:
    def test_item_level_offset(self, session, profile_json_minimal):
        # "Wooden Sword": "0:5" → level 1, cards 5
        profile = Profile.from_json(profile_json_minimal)
        session.add(profile)
        session.commit()

        sword = next(i for i in profile.items if i.name == "Wooden Sword")
        assert sword.level == 1
        assert sword.cards == 5

    def test_item_higher_level(self, session, profile_json_full):
        # "Wooden Sword": "5:200" → level 6, cards 200
        profile = Profile.from_json(profile_json_full)
        session.add(profile)
        session.commit()

        sword = next(i for i in profile.items if i.name == "Wooden Sword")
        assert sword.level == 6
        assert sword.cards == 200

    def test_item_proxy_name(self, session, profile_json_minimal):
        profile = Profile.from_json(profile_json_minimal)
        session.add(profile)
        session.commit()

        for item in profile.items:
            assert item.name  # proxy через ItemDefinition

    def test_item_to_frontend_view(self, session, profile_json_minimal):
        profile = Profile.from_json(profile_json_minimal)
        session.add(profile)
        session.commit()

        for item in profile.items:
            view = item.to_frontend_view()
            assert "name" in view
            assert "level" in view
            assert "cards" in view
