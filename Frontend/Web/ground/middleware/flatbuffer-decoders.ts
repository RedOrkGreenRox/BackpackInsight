import * as flatbuffers from 'flatbuffers';
import { ApiItemsPack } from './generated/backpack-insight/api-items/api-items-pack.js';
import { Value } from './generated/backpack-insight/api-items/value.js';
import { ValueKind } from './generated/backpack-insight/api-items/value-kind.js';
import { ProfileView } from './generated/backpack-insight/profile/profile-view.js';
import { ApiError } from './generated/backpack-insight/error/api-error.js';
import type { ItemDefinition, PlayerProfile } from '../types/api-types';

type JsonLike = null | boolean | number | string | JsonLike[] | { [key: string]: JsonLike };

export interface ApiErrorData {
    code: string;
    detail: string;
    issues: string[];
}

export function decodeItems(bytes: ArrayBuffer): ItemDefinition[] {
    const bb = byteBuffer(bytes);
    if (!ApiItemsPack.bufferHasIdentifier(bb)) {
        throw new Error('Invalid /api/items.fb FlatBuffer identifier');
    }

    const pack = ApiItemsPack.getRootAsApiItemsPack(bb);
    const result: ItemDefinition[] = [];
    const len = pack.itemsLength();

    for (let index = 0; index < len; index += 1) {
        const item = pack.items(index);
        const value = item?.value();
        if (!value) continue;
        const decoded = decodeValue(value);
        if (isObject(decoded)) {
            result.push(decoded as unknown as ItemDefinition);
        }
    }

    return result;
}

export function decodeProfile(bytes: ArrayBuffer): PlayerProfile {
    const bb = byteBuffer(bytes);
    if (!ProfileView.bufferHasIdentifier(bb)) {
        throw new Error('Invalid /api/profile.fb FlatBuffer identifier');
    }

    const view = ProfileView.getRootAsProfileView(bb);
    const itemStats: Record<string, number> = {};
    for (let index = 0; index < view.itemStatsLength(); index += 1) {
        const stat = view.itemStats(index);
        const rarity = stat?.rarity() ?? '';
        if (!rarity) continue;
        itemStats[rarity] = toNumber(stat?.count() ?? BigInt(0));
    }

    const heroes = [];
    for (let index = 0; index < view.heroesLength(); index += 1) {
        const hero = view.heroes(index);
        if (!hero) continue;
        heroes.push({
            name: hero.name() ?? '',
            level: hero.level(),
            rating: hero.rating(),
            experience: toNumber(hero.experience()),
            exp_req: toNumber(hero.expReq()),
            prestige: hero.prestige(),
            league: hero.league() ?? '',
            skin_num: hero.skinNum() ?? '',
        });
    }

    const items = [];
    for (let index = 0; index < view.itemsLength(); index += 1) {
        const item = view.items(index);
        if (!item) continue;
        items.push({
            name: item.name() ?? '',
            rarity: item.rarity() ?? '',
            level: item.level(),
            cards: item.cards(),
            cards_need: item.cardsNeed(),
        });
    }

    const profileSkins: Record<string, string[]> = {};
    for (let index = 0; index < view.profileSkinsLength(); index += 1) {
        const skinList = view.profileSkins(index);
        const owner = skinList?.owner() ?? '';
        if (!owner || !skinList) continue;
        const skins: string[] = [];
        for (let skinIndex = 0; skinIndex < skinList.skinsLength(); skinIndex += 1) {
            const skin = skinList.skins(skinIndex);
            if (typeof skin === 'string') skins.push(skin);
        }
        profileSkins[owner] = skins;
    }

    return {
        nickname: view.nickname() ?? '',
        level: toNumber(view.level()),
        trophy: toNumber(view.trophy()),
        bonus_trophy: toNumber(view.bonusTrophy()),
        gems: toNumber(view.gems()),
        coins: toNumber(view.coins()),
        xp_current: toNumber(view.xpCurrent()),
        xp_need: toNumber(view.xpNeed()),
        area: view.area() ?? '',
        item_stats: itemStats,
        heroes,
        heroes_count: view.heroesCount(),
        items,
        items_count: view.itemsCount(),
        actual_version: view.actualVersion() ?? '',
        install_version: view.installVersion() ?? '',
        profile_skins: profileSkins,
    };
}

export function decodeApiError(bytes: ArrayBuffer): ApiErrorData | null {
    const bb = byteBuffer(bytes);
    if (!ApiError.bufferHasIdentifier(bb)) return null;

    const error = ApiError.getRootAsApiError(bb);
    const issues: string[] = [];
    for (let index = 0; index < error.issuesLength(); index += 1) {
        const issue = error.issues(index);
        if (typeof issue === 'string') issues.push(issue);
    }
    return {
        code: error.code() ?? 'error',
        detail: error.detail() ?? 'Backend error',
        issues,
    };
}

function decodeValue(value: Value): JsonLike {
    switch (value.kind()) {
        case ValueKind.Null:
            return null;
        case ValueKind.Bool:
            return value.boolValue();
        case ValueKind.Int:
            return toNumber(value.intValue());
        case ValueKind.Float:
            return value.floatValue();
        case ValueKind.String:
            return value.stringValue() ?? '';
        case ValueKind.Array: {
            const result: JsonLike[] = [];
            for (let index = 0; index < value.arrayValueLength(); index += 1) {
                const entry = value.arrayValue(index);
                result.push(entry ? decodeValue(entry) : null);
            }
            return result;
        }
        case ValueKind.Object_: {
            const result: { [key: string]: JsonLike } = {};
            for (let index = 0; index < value.objectValueLength(); index += 1) {
                const entry = value.objectValue(index);
                const key = entry?.key();
                const entryValue = entry?.value();
                if (!key || !entryValue) continue;
                result[key] = decodeValue(entryValue);
            }
            return result;
        }
        default:
            return null;
    }
}

function byteBuffer(bytes: ArrayBuffer): flatbuffers.ByteBuffer {
    return new flatbuffers.ByteBuffer(new Uint8Array(bytes));
}

function toNumber(value: bigint): number {
    const max = BigInt(Number.MAX_SAFE_INTEGER);
    if (value > max) return Number.MAX_SAFE_INTEGER;
    if (value < -max) return -Number.MAX_SAFE_INTEGER;
    return Number(value);
}

function isObject(value: JsonLike): value is { [key: string]: JsonLike } {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
