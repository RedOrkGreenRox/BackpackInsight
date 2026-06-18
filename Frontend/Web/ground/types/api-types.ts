/**
 * Unified TypeScript types matching the backend SQLModel/FastAPI schemas.
 * Provides full type safety and validation mapping for BackpackInsight.
 */

export interface CombatStats {
  damageMin: number | null;
  damageMax: number | null;
  accuracy: number | null;
  staminaCost: number | null;
  cooldown: number | null;
  criticalChance: number | null;
  criticalDamage: number | null;
}

export interface Recipe {
  resultId: string;
  ingredientIds: string[];
}

export interface LevelChange {
  level: number;
  stat: string;
  value: number;
  type: string | null;
}

export interface LevelInfo {
  maxLevel: number;
  chancePerLevel: number | null;
  baseChance: number | null;
  chanceBreakpointBonus: number | null;
  abilityDescription: string | null;
  changes: LevelChange[];
}

/**
 * ItemDefinition - Static metadata from items.json/DB
 */
export interface ItemDefinition {
  id: string;
  name: string;
  rarity: string;
  coinValue: number | null;
  itemTypes: string[];
  connectedHero: string | null;
  unlockSource: string | null;
  itemShape: { x: number; y: number }[];
  itemStars: { x: number; y: number }[];
  purchasable: boolean;
  recipes: Recipe[];
  combatStats: CombatStats;
  tooltips: string[];
  allStats: Record<string, any>;
  levels: LevelInfo;
}

/**
 * PlayerHero - Hero instance inside a profile
 */
export interface PlayerHero {
  name: string;
  level: number;
  rating: number;
  experience: number;
  exp_req: number;
  prestige: boolean;
  league: string;
  skin_num: string;
}

/**
 * PlayerItem - Inventory item instance inside a profile
 */
export interface PlayerItem {
  name: string;
  rarity: string;
  level: number;
  cards: number;
  cards_need: number;
}

/**
 * PlayerProfile - Profile analytics output matching Profile.to_frontend_view()
 */
export interface PlayerProfile {
  nickname: string;
  level: number;
  trophy: number;
  bonus_trophy: number;
  gems: number;
  coins: number;
  xp_current: number;
  xp_need: number;
  area: string;
  item_stats: Record<string, number>;
  heroes: PlayerHero[];
  heroes_count: number;
  items: PlayerItem[];
  items_count: number;
  actual_version: string;
  install_version: string;
  profile_skins: Record<string, string[]>;
  itemsSort?: 'rarity' | 'level';
}
