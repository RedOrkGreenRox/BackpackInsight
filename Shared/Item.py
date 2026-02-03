from data import ITEMS, ITEM_LEVELING_CARDS, ITEM_LEVELING_EXP, DEFAULT_ITEM_TYPES, ALL_CRAFTABLE_IDS

class Item:
    def __init__(self, item):
        self.name = item[0]
        self.id = ITEMS.get(self.name, {}).get("id", None)
        self.level = int(item[1]) + 1
        self.cards = int(item[2])
        self.rarity = ITEMS.get(self.name, {}).get("rarity", None)
        self.group = ITEMS.get(self.name, {}).get("connectedHero", None)
        self.coin_value = ITEMS.get(self.name, {}).get("coinValue", None)
        self.cards_need = self.get_cards_need()
        self.description = None
        self.types = ITEMS.get(self.name, {}).get("itemTypes", DEFAULT_ITEM_TYPES)
        self.tags = {
            "Favourites": None,
            "Upgradable": self.cards >= self.cards_need if self.cards_need else None,
            "Purchasable": ITEMS.get(self.name, {}).get("purchasable", None),
            "Craftable": self.id == self.id in ALL_CRAFTABLE_IDS,
            "Fishing": None,
            "Generators": None,
            "Gold": None,
        }
        self.buffs = {
            "Empower": None,
            "Haste": None,
            "Lifesteal": None,
            "Luck": None,
            "Mana": None,
            "Regeneration": None,
            "Thorns": None,
        }
        self.debuffs = {
            "Poison": None,
            "Bleed": None,
            "Burn": None,
            "Chill": None,
            "Blind": None,
            "Curse": None,
            "Insanity": None,
            "Stun": None,
        }
        self.stats = ITEMS.get(self.name, {}).get("stats", None)
        self.total_xp = self.total_xp_gain()

    def get_cards_need(self):
        if not (self.rarity or self.group): return -1
        if (self.level >= 14) or (self.rarity == "Relic" and self.level >= 10): return -1
        if self.rarity == "Boon": return -1
        return int(ITEM_LEVELING_CARDS[self.rarity][self.level - 1])

    def total_xp_gain(self):
        if not (self.rarity or self.group): return Exception
        if self.rarity == "Boon": return 0
        result = sum(ITEM_LEVELING_EXP[self.rarity][:self.level])
        return result

    def __str__(self):
        return f"""
        Name: {self.name}
        Level: {self.level}
        Rarity: {self.rarity}
        Cards: {self.cards}/{self.cards_need}
        Total XP: {self.total_xp}
        """
