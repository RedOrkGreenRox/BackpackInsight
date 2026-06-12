import type { ItemDefinition } from '../../../../utils/ItemIconService';

export interface PlayerItemData {
    name: string;
    level: number;
    cards: number;
    cards_need: number;
}

export interface ItemDetailData {
    name?: string;
    playerItem?: PlayerItemData;
    itemData?: ItemDefinition | null;
}

export interface NavigationState {
    prev: string | null;
    next: string | null;
}

export type { ItemDefinition } from '../../../../utils/ItemIconService';
