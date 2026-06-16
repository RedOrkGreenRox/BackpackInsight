import { Branch } from '@roots/Branch.ts';
import { ItemsCacheService } from '../../utils/ItemsCacheService';
import { SearchTermService } from '../../utils/SearchTermService';
import { ItemsLayoutRenderer } from './_items/components/ItemsLayoutRenderer';
import { ItemsManager } from './_items/managers/ItemsManager';
import './items.scss';

// --- Точные типы на основе items.json для обратной совместимости API ---

interface CombatStats {
    damageMin: number | null;
    damageMax: number | null;
    accuracy: number | null;
    staminaCost: number | null;
    cooldown: number | null;
    criticalChance: number | null;
    criticalDamage: number | null;
}

interface Recipe {
    resultId: string;
    ingredientIds: string[];
}

interface LevelChange {
    level: number;
    stat: string;
    value: number;
    type: string | null;
}

interface LevelInfo {
    maxLevel: number;
    chancePerLevel: number | null;
    baseChance: number | null;
    chanceBreakpointBonus: number | null;
    abilityDescription: string | null;
    changes: LevelChange[];
}

export interface ItemDefinition {
    id: string;
    name: string;
    rarity: string;
    coinValue: number | null;
    itemTypes: string[];
    connectedHero: string;
    unlockSource: string;
    itemShape: { x: number, y: number }[];
    itemStars: { x: number, y: number }[];
    purchasable: boolean;
    recipes: Recipe[];
    combatStats: CombatStats;
    tooltips: string[];
    allStats: Record<string, any>;
    levels: LevelInfo;
}

export class ItemsBranch extends Branch {
    private manager: ItemsManager | null = null;

    protected getHtml(): string {
        // Отрисовка базовой структуры с скелетоном сразу
        return ItemsLayoutRenderer.render();
    }

    protected init(): void {
        if (!this.container) return;
        this.loadAndActivate().catch(console.error);
    }

    private async loadAndActivate(): Promise<void> {
        // Инициализируем семантический сервис синонимов параллельно с загрузкой кэша
        const [items] = await Promise.all([
            ItemsCacheService.getAllItems(),
            SearchTermService.init()
        ]);
        
        if (this.container) {
            // Передача управления главному оркестратору
            this.manager = new ItemsManager(this.container, items as any);
            this.manager.init();
        }
    }

    protected destroy(): void {
        if (this.manager) {
            // Каскадная очистка событий, таймеров и отписок
            this.manager.destroy();
            this.manager = null;
        }
    }
}
