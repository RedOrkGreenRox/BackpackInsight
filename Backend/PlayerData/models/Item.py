from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from Backend.PlayerData.data import ITEM_LEVELING_CARDS, ITEM_LEVELING_EXP, ALL_CRAFTABLE_IDS

if TYPE_CHECKING:
    from Backend.PlayerData.models.Profile import Profile

# -- Nested Models for Type Safety --

class CombatStats(SQLModel):
    """Model representing combat statistics of an item."""
    damageMin: Optional[float] = None
    damageMax: Optional[float] = None
    accuracy: Optional[float] = None
    staminaCost: Optional[float] = None
    cooldown: Optional[float] = None
    criticalChance: Optional[float] = None
    criticalDamage: Optional[float] = None

class ItemTags(SQLModel):
    """Model representing various tags associated with an item."""
    Favourites: Optional[bool] = None
    Upgradable: Optional[bool] = None
    Purchasable: Optional[bool] = None
    Craftable: Optional[bool] = None
    Fishing: Optional[bool] = None
    Generators: Optional[bool] = None
    Gold: Optional[bool] = None

# -- 1. Item Definition (Metadata / Dictionary) --
class ItemDefinition(SQLModel, table=True):
    """
    Static metadata for an item. Shared across all players.
    Corresponds to an entry in items.json.
    """
    item_id: str = Field(primary_key=True, alias="id") # String ID from JSON is the PK
    name: str
    rarity: str = Field(default="Common", index=True)
    coin_value: Optional[int] = Field(default=None, alias="coinValue")
    item_types: List[str] = Field(default=[], sa_column=Column(JSON), alias="itemTypes")
    connected_hero: Optional[str] = Field(default=None, alias="connectedHero", index=True)
    unlock_source: Optional[str] = Field(default=None, alias="unlockSource")
    
    # Geometry & Meta
    item_shape: List[Dict[str, int]] = Field(default=[], sa_column=Column(JSON), alias="itemShape")
    item_stars: List[Dict[str, int]] = Field(default=[], sa_column=Column(JSON), alias="itemStars")
    purchasable: bool = Field(default=False)
    recipes: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    
    # Stats
    combat_stats_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSON), alias="combatStats")
    all_stats_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSON), alias="allStats")
    tooltips: List[str] = Field(default=[], sa_column=Column(JSON))
    levels_info: Dict[str, Any] = Field(default={}, sa_column=Column(JSON), alias="levels")

    # Relationship to player items
    items: List["Item"] = Relationship(back_populates="definition")

    @property
    def combat_stats(self) -> CombatStats:
        return CombatStats(**self.combat_stats_data)

# -- 2. Player Item (Inventory Instance) --
class Item(SQLModel, table=True):
    """
    A specific instance of an item owned by a player.
    Links to ItemDefinition for static data.
    """
    # -- Database Primary Key --
    pk: Optional[int] = Field(default=None, primary_key=True)

    # -- Foreign Keys --
    profile_id: Optional[int] = Field(default=None, foreign_key="profile.pk")
    definition_id: str = Field(foreign_key="itemdefinition.item_id")
    
    # -- Relationships --
    profile: Optional["Profile"] = Relationship(back_populates="items")
    definition: Optional[ItemDefinition] = Relationship(back_populates="items")

    # -- Dynamic Data (Player Progress) --
    level: int
    cards: int

    # -- Helper to safely get definition (ORM or Cache) --
    def _get_definition(self) -> Optional[ItemDefinition]:
        if self.definition:
            return self.definition
        
        # Fallback to Factory Cache if ORM relation is missing/detached
        # Import inside method to avoid circular import
        from Backend.PlayerData.services.ProfileFactory import ProfileFactory
        return ProfileFactory._definition_cache.get(self.definition_id)

    # -- Proxy Properties (Access Definition Data transparently) --
    @property
    def name(self) -> str: 
        d = self._get_definition()
        return d.name if d else "Unknown"
    
    @property
    def rarity(self) -> str: 
        d = self._get_definition()
        return d.rarity if d else "Common"
    
    @property
    def item_id(self) -> str: return self.definition_id
    
    @property
    def combat_stats(self) -> CombatStats: 
        d = self._get_definition()
        return d.combat_stats if d else CombatStats()
    
    @property
    def all_stats(self) -> Dict[str, Any]: 
        d = self._get_definition()
        return d.all_stats_data if d else {}
    
    @property
    def description(self) -> Optional[str]: 
        d = self._get_definition()
        return d.tooltips[0] if d and d.tooltips else None

    # -- Computed Properties --
    @property
    def cards_need(self) -> int:
        # Use self.rarity property which now handles fallback
        rarity = self.rarity
        if (self.level >= 15) or (rarity == "Relic" and self.level >= 10): return -1
        if rarity == "Boon": return -1
        
        try:
            return int(ITEM_LEVELING_CARDS[rarity][self.level - 1])
        except (KeyError, IndexError):
            return -1

    @property
    def total_xp(self) -> int:
        rarity = self.rarity
        if rarity == "Boon": return 0
        try:
            return sum(ITEM_LEVELING_EXP[rarity][:self.level])
        except (KeyError, TypeError):
            return 0

    @property
    def tags(self) -> ItemTags:
        is_craftable = self.definition_id in ALL_CRAFTABLE_IDS
        d = self._get_definition()
        return ItemTags(
            Favourites=None,
            Upgradable=self.cards >= self.cards_need if self.cards_need != -1 else False,
            Purchasable=d.purchasable if d else False,
            Craftable=is_craftable,
            Fishing=None,
            Generators=None,
            Gold=None
        )

    # -- Compatibility Aliases --
    @property
    def id(self) -> str: return self.definition_id
    @property
    def group(self) -> Optional[str]: 
        d = self._get_definition()
        return d.connected_hero if d else None
    
    @property
    def types(self) -> List[str]: 
        d = self._get_definition()
        return d.item_types if d else []

    @property
    def stats(self) -> Dict[str, Any]: return self.all_stats

    def to_frontend_view(self) -> Dict[str, Any]:
        """
        Returns a dictionary representation of the Item for the frontend.
        """
        return {
            "name": self.name,
            "rarity": self.rarity,
            "level": self.level,
            "cards": self.cards,
            "cards_need": self.cards_need
        }

    def __str__(self):
        def fmt_dict(d, indent=6):
            if not d: return "None"
            items = d.items() if isinstance(d, dict) else d.model_dump(exclude_none=True).items()
            return "\n".join([f"{' ' * indent}- {k}: {v}" for k, v in items])

        return (
            f"📦 ITEM: {self.name}\n"
            f"   🆔 ID: {self.item_id} | ⭐ {self.rarity}\n"
            f"   🏷️  Types: {', '.join(self.types)}\n"
            f"   🦸 Hero: {self.group or 'Shared'}\n"
            f"   📈 Lv. {self.level} | Cards: {self.cards}/{self.cards_need} | XP: {self.total_xp}\n"
            f"   ⚔️ Combat:\n{fmt_dict(self.combat_stats)}\n"
            f"   📝 {self.description or ''}\n"
            f"   " + "-"*40
        )
