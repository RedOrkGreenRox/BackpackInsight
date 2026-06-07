"""
Тесты целостности данных и отношений в БД.
"""
from __future__ import annotations

import pytest
from sqlmodel import Session, select
from Backend.PlayerData.models import Profile, Item, ItemDefinition, Hero
from Backend.PlayerData.services.ProfileFactory import ProfileFactory

def test_profile_item_relationship(session, profile_json_minimal):
    """Проверка того, что предметы правильно привязаны к профилю в БД."""
    profile = ProfileFactory.create_profile(profile_json_minimal)
    session.add(profile)
    session.commit()
    session.refresh(profile)

    # Проверяем через отдельный запрос
    stmt = select(Profile).where(Profile.pk == profile.pk)
    db_profile = session.exec(stmt).one()
    
    assert len(db_profile.items) > 0
    for item in db_profile.items:
        assert item.profile_id == db_profile.pk
        assert item.definition is not None

def test_item_definition_sharing(session, profile_json_minimal):
    """Проверка того, что разные профили используют одну и ту же ItemDefinition."""
    p1 = ProfileFactory.create_profile(profile_json_minimal)
    p2 = ProfileFactory.create_profile(profile_json_minimal)
    
    session.add(p1)
    session.add(p2)
    session.commit()

    # Берем один и тот же предмет из разных профилей
    item1 = p1.items[0]
    item2 = p2.items[0]
    
    assert item1.definition_id == item2.definition_id
    # Проверяем, что в базе это одна и та же запись
    assert item1.definition.item_id == item2.definition.item_id

def test_hero_profile_link(session, profile_json_minimal):
    """Проверка связи профиля и его героев."""
    profile = ProfileFactory.create_profile(profile_json_minimal)
    session.add(profile)
    session.commit()
    
    hero = profile.heroes[0]
    assert hero.profile_id == profile.pk
    
    # Проверка обратной связи
    stmt = select(Hero).where(Hero.pk == hero.pk)
    db_hero = session.exec(stmt).one()
    assert db_hero.profile.pk == profile.pk
