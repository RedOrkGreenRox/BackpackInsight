/**
 * Индексный файл для всех модулей профиля
 */

// Утилиты и типы
export type { Hero, Item, ProfileData, SavedState, RarityWeights } from './utils/profile-types';
export { rarityWeights } from './utils/rarity-weights';

// Рендереры Header
export { HeaderRenderer } from './header/header';
export { PlayerInfoRenderer } from './header/player-info';
export { StatsBarRenderer } from './header/stats-bar';
export { LevelProgressRenderer } from './header/level-progress';

// Рендереры Heroes
export { HeroesSectionRenderer } from './heroes/heroes-section';
export { HeroCardRenderer } from './heroes/hero-card';
export { HeroGridRenderer } from './heroes/hero-grid';
export { HeroStatsRenderer } from './heroes/hero-stats';

// Рендереры Items
export { ItemsSectionRenderer } from './items/items-section';
export { ItemCardRenderer } from './items/item-card';
export { ItemGridRenderer } from './items/item-grid';
export { ItemStatsRenderer } from './items/item-stats';

// TODO: Добавлять экспорты новых модулей по мере создания
// Рендереры
// export { DownloadButtonRenderer } from './actions/download-button';

// Менеджеры
// export { ProfileManager } from './managers/ProfileManager';
// export { StateManager } from './managers/StateManager';
// export { SortManager } from './managers/SortManager';
// export { ScreenshotManager } from './managers/screenshot-manager';

// Контроллеры
// export { SortController } from './sort/SortController';
