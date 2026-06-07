"""
Интеграционные тесты FastAPI через TestClient.
"""
from __future__ import annotations

import json
import os

import pytest

from Backend.PlayerData import api as api_module


# --- Public endpoints ------------------------------------------------------


class TestPublicRoutes:
    def test_root(self, client):
        r = client.get("/")
        assert r.status_code == 200
        assert "running" in r.json()["message"].lower()


# --- /api/items ------------------------------------------------------------


class TestItemsEndpoint:
    def test_returns_list(self, client):
        r = client.get("/api/items")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) > 0

    def test_has_cache_header(self, client):
        r = client.get("/api/items")
        assert "cache-control" in r.headers
        assert "max-age" in r.headers["cache-control"]

    def test_item_structure(self, client):
        r = client.get("/api/items")
        items = r.json()
        sample = items[0]
        # FastAPI сериализует SQLModel с alias-ами → "id" вместо "item_id"
        assert "id" in sample or "item_id" in sample
        assert "name" in sample
        assert "rarity" in sample


# --- /api/profile ----------------------------------------------------------


class TestProfileEndpoint:
    def test_accepts_minimal(self, client, profile_json_minimal):
        r = client.post("/api/profile", json=profile_json_minimal)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["nickname"] == "TestPlayer"

    def test_accepts_full(self, client, profile_json_full):
        r = client.post("/api/profile", json=profile_json_full)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["coins"] == 99999
        assert body["heroes_count"] == 3

    def test_rejects_empty_body(self, client):
        r = client.post("/api/profile", json={})
        assert r.status_code == 400
        assert "Failed to process profile" in r.json()["detail"]

    def test_rejects_no_uid(self, client):
        r = client.post("/api/profile", json={"Data": {}, "Name": "X", "Item": {}})
        assert r.status_code == 400

    def test_rejects_too_large_payload(self, client):
        # Заголовок Content-Length > 1MB
        big = {"Data": {}, "Name": "X", "UID": "1", "Item": {"X" * 1000: "0:0"}}
        # Имитируем большой заголовок
        body = json.dumps(big).encode()
        r = client.post(
            "/api/profile",
            content=body,
            headers={
                "Content-Type": "application/json",
                "Content-Length": str(2 * 1024 * 1024),
            },
        )
        assert r.status_code == 413


# --- Secret verification ---------------------------------------------------


class TestSecretAuth:
    def test_no_secret_required_when_not_configured(self, client):
        """В тестах API_SECRET не задан — должно работать без заголовка."""
        assert api_module.API_SECRET is None
        r = client.get("/api/items")
        assert r.status_code == 200

    def test_403_when_secret_configured_and_missing(self, monkeypatch, client):
        monkeypatch.setattr(api_module, "API_SECRET", "test-secret-value")
        r = client.get("/api/items")
        assert r.status_code == 403

    def test_403_when_secret_wrong(self, monkeypatch, client):
        monkeypatch.setattr(api_module, "API_SECRET", "test-secret-value")
        r = client.get("/api/items", headers={"X-Internal-Secret": "wrong"})
        assert r.status_code == 403

    def test_200_when_secret_correct(self, monkeypatch, client):
        monkeypatch.setattr(api_module, "API_SECRET", "test-secret-value")
        r = client.get("/api/items", headers={"X-Internal-Secret": "test-secret-value"})
        assert r.status_code == 200

    def test_constant_time_compare(self, monkeypatch, client):
        """Регрессия: используется hmac.compare_digest, а не ==."""
        import hmac
        called = {"count": 0}
        original = hmac.compare_digest

        def spy(a, b):
            called["count"] += 1
            return original(a, b)

        monkeypatch.setattr("hmac.compare_digest", spy)
        monkeypatch.setattr(api_module, "API_SECRET", "s")
        client.get("/api/items", headers={"X-Internal-Secret": "s"})
        assert called["count"] >= 1


# --- Static data sync ------------------------------------------------------


class TestStaticSync:
    def test_sync_runs_idempotently(self, engine, monkeypatch):
        """Повторный вызов _sync_static_data не должен ломаться."""
        monkeypatch.setattr(api_module, "engine", engine)
        api_module._sync_static_data()
        api_module._sync_static_data()  # повтор не должен бросать
