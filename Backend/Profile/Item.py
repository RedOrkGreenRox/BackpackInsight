from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from data import ITEM_LEVELING_CARDS, ITEM_LEVELING_EXP, ALL_CRAFTABLE_IDS

if TYPE_CHECKING:
    from Profile import Profile

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

    # -- Proxy Properties (Access Definition Data transparently) --
    @property
    def name(self) -> str: return self.definition.name if self.definition else "Unknown"
    @property
    def rarity(self) -> str: return self.definition.rarity if self.definition else "Common"
    @property
    def item_id(self) -> str: return self.definition_id
    @property
    def combat_stats(self) -> CombatStats: return self.definition.combat_stats if self.definition else CombatStats()
    @property
    def all_stats(self) -> Dict[str, Any]: return self.definition.all_stats_data if self.definition else {}
    @property
    def description(self) -> Optional[str]: 
        return self.definition.tooltips[0] if self.definition and self.definition.tooltips else None

    # -- Computed Properties --
    @property
    def cards_need(self) -> int:
        if not self.definition: return -1
        if (self.level >= 14) or (self.rarity == "Relic" and self.level >= 10): return -1
        if self.rarity == "Boon": return -1
        
        try:
            return int(ITEM_LEVELING_CARDS[self.rarity][self.level - 1])
        except (KeyError, IndexError):
            return -1

    @property
    def total_xp(self) -> int:
        if not self.definition: return 0
        if self.rarity == "Boon": return 0
        try:
            return sum(ITEM_LEVELING_EXP[self.rarity][:self.level])
        except (KeyError, TypeError):
            return 0

    @property
    def tags(self) -> ItemTags:
        is_craftable = self.definition_id in ALL_CRAFTABLE_IDS
        return ItemTags(
            Favourites=None,
            Upgradable=self.cards >= self.cards_need if self.cards_need != -1 else False,
            Purchasable=self.definition.purchasable if self.definition else False,
            Craftable=is_craftable,
            Fishing=None,
            Generators=None,
            Gold=None
        )

    # -- Compatibility Aliases --
    @property
    def id(self) -> str: return self.definition_id
    @property
    def group(self) -> Optional[str]: return self.definition.connected_hero if self.definition else None
    @property
    def types(self) -> List[str]: return self.definition.item_types if self.definition else []
    @property
    def stats(self) -> Dict[str, Any]: return self.all_stats

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
