from typing import Optional, List, Dict, Any, Union, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON

if TYPE_CHECKING:
    # Absolute imports to avoid double loading
    from Backend.PlayerData.models.Item import Item
    from Backend.PlayerData.models.Hero import Hero

# -- Nested Models (Schemas for JSON validation/access) --

class TechnicalInfo(SQLModel):
    Data: Dict[str, Any] = Field(default={})
    AV: Optional[str] = None
    BN: Optional[str] = None
    GR: Optional[str] = None
    BT: Optional[str] = None
    UID: Optional[str] = None
    DUID: Optional[str] = None
    FBID: Optional[str] = None
    SafeArea: Optional[str] = None
    Screen: Optional[str] = None
    Device: Optional[str] = None
    SMS: Optional[str] = None
    SSMS: Optional[str] = None
    Mem: Optional[Union[str, Dict[str, Any]]] = None 
    OS: Optional[str] = None
    NTP1: Optional[str] = None
    NTP2: Optional[str] = None
    NTPA: Optional[str] = None
    DTU: Optional[str] = None
    DT: Optional[str] = None
    AS: Optional[str] = None
    ELUID: Optional[str] = None
    EPUID: Optional[str] = None
    IV: Optional[str] = None
    LV: Optional[str] = None
    VH: Optional[str] = None
    IBA: Optional[str] = None
    AB: Optional[str] = None
    CS: Optional[str] = None
    RSM: Optional[str] = None

class GameInfo(SQLModel):
    Nickname: Optional[str] = None
    PH: List[str] = Field(default=[])
    Currency: Dict[str, int] = Field(default={})
    UL: List[str] = Field(default=[])
    Trophy: int = 0
    BonusTrophy: int = 0
    Area: Optional[str] = None
    
    # Computed Stats
    ItemStats: Dict[str, int] = Field(default={})
    PlayerLevel: int = 1
    PlayerExperienceTotal: int = 0
    PlayerExperienceCurrent: int = 0
    PlayerExperienceNeed: int = 0
    Skins: Dict[str, List[str]] = Field(default={})
    Banners: List[str] = Field(default=[])

class Profile(SQLModel, table=True):
    # -- Database Primary Key --
    pk: Optional[int] = Field(default=None, primary_key=True)

    # -- Analytics Columns (Extracted from JSON for SQL queries) --
    nickname: Optional[str] = Field(default=None, index=True)
    trophies: int = Field(default=0, index=True)
    level: int = Field(default=1, index=True)
    total_xp: int = Field(default=0)
    coins: int = Field(default=0)
    gems: int = Field(default=0)
    
    # Technical Analytics
    device_model: Optional[str] = Field(default=None)
    os_version: Optional[str] = Field(default=None)
    app_version: Optional[str] = Field(default=None)
    user_id: Optional[str] = Field(default=None, index=True) # UID

    # -- Relationships --
    heroes: List["Hero"] = Relationship(back_populates="profile")
    items: List["Item"] = Relationship(back_populates="profile")

    # -- Raw Data Columns (JSON Blobs) --
    technical_info_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSON), alias="technical_information")
    game_info_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSON), alias="game_information")

    @classmethod
    def from_json(cls, json_data: Dict[str, Any]) -> "Profile":
        """
        Factory method to create a Profile from raw JSON data.
        Delegates to ProfileFactory to avoid circular imports and keep model clean.
        """
        # Import inside method to avoid circular dependency
        # Note: ProfileFactory will also move to 'services'
        from Backend.PlayerData.services.ProfileFactory import ProfileFactory
        return ProfileFactory.create_profile(json_data)

    @property
    def technical_information(self) -> TechnicalInfo:
        # Create on the fly to avoid Pydantic/SQLAlchemy state conflicts
        return TechnicalInfo(**self.technical_info_data)

    @property
    def game_information(self) -> GameInfo:
        # Create on the fly to avoid Pydantic/SQLAlchemy state conflicts
        return GameInfo(**self.game_info_data)

    def to_frontend_view(self) -> Dict[str, Any]:
        """
        Returns a dictionary representation of the Profile for the frontend.
        Aggregates data from nested models and calculated properties.
        """
        game_data = self.game_info_data
        
        return {
            "nickname": self.nickname,
            "level": self.level,
            "trophy": game_data.get("Trophy", 0),
            "bonus_trophy": game_data.get("BonusTrophy", 0),
            "gems": self.gems,
            "coins": self.coins,
            "xp_current": game_data.get("PlayerExperienceCurrent", 0),
            "xp_need": game_data.get("PlayerExperienceNeed", 0),
            "area": game_data.get("Area", "01"),
            "item_stats": game_data.get("ItemStats", {}),

            # Serialize heroes using their own method
            "heroes": [hero.to_frontend_view() for hero in self.heroes],
            "heroes_count": len(self.heroes),

            # Serialize items using their own method
            "items": [item.to_frontend_view() for item in self.items],
            "items_count": len(self.items),

            "actual_version": self.app_version,
            "install_version": self.app_version,
            "profile_skins": game_data.get("Skins", {})
        }

    def __str__(self):
        # Use properties to access data
        game_info = self.game_information
        return f"""
        👤 Nickname: {self.nickname}
        🏆 Trophies: {self.trophies} | Area: {game_info.Area}
        ⭐ Level: {self.level} ({game_info.PlayerExperienceCurrent}/{game_info.PlayerExperienceNeed})
        ✨ Total XP: {self.total_xp}
        💰 Coins: {self.coins} | 💎 Gems: {self.gems}
        📱 Device: {self.device_model} | OS: {self.os_version} | v{self.app_version}
        """
