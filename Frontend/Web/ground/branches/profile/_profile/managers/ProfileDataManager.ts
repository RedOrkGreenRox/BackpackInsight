/**
 * ProfileDataManager — получение данных профиля (аргумент навигации / кэш),
 * сортировка предметов, рендер skeleton.
 */
import { t } from '../../../../localization/i18n';
import { LoadingStates } from '@utils/LoadingStates';
import { ProfileStateManager, SavedState } from './ProfileStateManager';
import { ProfileData, Item } from '../utils/profile-types';
import { rarityWeights } from '../utils/rarity-weights';

export class ProfileDataManager {
    private readonly CACHE_KEY = 'currentProfileData';
    private readonly LIST_KEY  = 'profileItemsList';
    private readonly stateManager = new ProfileStateManager();

    /** Читает данные из аргумента navigate() или sessionStorage-кэша. */
    resolve(data: any): ProfileData | null {
        let incoming = data as ProfileData;

        if (!incoming?.nickname) {
            try {
                const cached = sessionStorage.getItem(this.CACHE_KEY);
                if (cached) incoming = JSON.parse(cached);
            } catch (e) {
                console.error('[ProfileDataManager] Failed to parse cache', e);
            }
        }

        if (incoming?.nickname) {
            sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(incoming));
            return incoming;
        }

        return null;
    }

    /** Восстанавливает savedState из хранилища. */
    restoreSavedState(): SavedState {
        return this.stateManager.restoreState();
    }

    /** Сортирует предметы профиля и сохраняет порядок для ItemDetail-навигации. */
    sortItems(items: Item[], sortType: 'rarity' | 'level'): Item[] {
        const sorted = [...items].sort((a, b) => {
            if (sortType === 'rarity') {
                const diff = (rarityWeights[b.rarity] || 0) - (rarityWeights[a.rarity] || 0);
                if (diff !== 0) return diff;
            }

            if (a.level !== b.level) return b.level - a.level;

            const progressA = a.cards_need > 0 ? a.cards / a.cards_need : 0;
            const progressB = b.cards_need > 0 ? b.cards / b.cards_need : 0;
            if (progressA !== progressB) return progressB - progressA;

            if (sortType !== 'rarity') {
                const diff = (rarityWeights[b.rarity] || 0) - (rarityWeights[a.rarity] || 0);
                if (diff !== 0) return diff;
            }

            return a.name.localeCompare(b.name);
        });

        sessionStorage.setItem(this.LIST_KEY, JSON.stringify(sorted));
        return sorted;
    }

    /** HTML skeleton, который mount() сразу вставит в DOM. */
    renderSkeleton(): string {
        return `
            <div class="container">
                ${LoadingStates.createProfileSkeleton()}
                <div style="margin-top: 24px;">
                    <h3 style="color: rgba(255,255,255,0.8); margin-bottom: 16px;">${t('profile_heroes_title', '0')}</h3>
                    ${LoadingStates.createCardSkeleton(3)}
                </div>
                <div style="margin-top: 24px;">
                    <h3 style="color: rgba(255,255,255,0.8); margin-bottom: 16px;">${t('profile_items_title', '0')}</h3>
                    ${LoadingStates.createCardSkeleton(6)}
                </div>
            </div>
        `;
    }

    /** Мета-теги для SEO. */
    getMeta(data: ProfileData | null): { title: string; description: string } {
        let d = data;
        if (!d) {
            try {
                const cached = sessionStorage.getItem(this.CACHE_KEY);
                if (cached) d = JSON.parse(cached);
            } catch { /* ignore */ }
        }

        if (d?.nickname) {
            return {
                title: `${d.nickname} — ${t('sidebar_profile')} | Backpack Insight`,
                description: `${d.nickname}: ${t('profile_heroes_title', String(d.heroes_count))}, ${t('profile_items_title', String(d.items_count))}.`,
            };
        }
        return {
            title: `${t('sidebar_profile')} | Backpack Insight`,
            description: t('main_meta_description'),
        };
    }
}
