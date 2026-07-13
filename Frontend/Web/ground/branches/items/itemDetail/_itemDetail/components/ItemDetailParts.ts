import { ItemDefinition, PlayerItemData } from '../utils/item-detail-types';
import { parseTextWithIcons } from '@utils/icon-parser';
import { t } from '@i18n';

export class ItemDetailParts {

    static renderStatsList(item: ItemDefinition): string {
        if (!item.combatStats) return '';
        const cs = item.combatStats;
        const has = (v: number | null) => v !== null && v !== undefined;
        if (!has(cs.damageMin) && !has(cs.damageMax) && !has(cs.accuracy) &&
            !has(cs.criticalChance) && !has(cs.criticalDamage) &&
            !has(cs.staminaCost) && !has(cs.cooldown)) return '';

        const dmgIcon = parseTextWithIcons('stat_damageMin');
        const accIcon = parseTextWithIcons('stat_accuracy');
        const critIcon = parseTextWithIcons('stat_criticalChance');
        const cdIcon = parseTextWithIcons('stat_criticalDamage');
        const stamIcon = parseTextWithIcons('stat_staminaCost');
        const coolIcon = parseTextWithIcons('stat_cooldown');

        const dmg = (has(cs.damageMin) || has(cs.damageMax))
            ? `<div class="id-stat-row-h"><span class="id-stat-icon">${dmgIcon}</span><span class="id-stat-val">${cs.damageMin ?? '-'}/${cs.damageMax ?? '-'}</span></div>`
            : '';
        const acc = has(cs.accuracy)
            ? `<div class="id-stat-inline"><span class="id-stat-icon">${accIcon}</span><span class="id-stat-val">${cs.accuracy}</span></div>`
            : '';
        const crit = has(cs.criticalChance)
            ? `<div class="id-stat-inline"><span class="id-stat-icon">${critIcon}</span><span class="id-stat-val">${cs.criticalChance}%</span></div>`
            : '';
        const cdmg = has(cs.criticalDamage)
            ? `<div class="id-stat-inline"><span class="id-stat-icon">${cdIcon}</span><span class="id-stat-val">${cs.criticalDamage}%</span></div>`
            : '';
        const stam = has(cs.staminaCost)
            ? `<div class="id-stat-inline"><span class="id-stat-icon">${stamIcon}</span><span class="id-stat-val">${cs.staminaCost}</span></div>`
            : '';
        const cool = has(cs.cooldown)
            ? `<div class="id-stat-inline"><span class="id-stat-icon">${coolIcon}</span><span class="id-stat-val">${cs.cooldown}</span></div>`
            : '';

        const row3 = (acc || crit || cdmg) ? `<div class="id-stat-line">${acc}${crit}${cdmg}</div>` : '';
        const row4 = (stam || cool) ? `<div class="id-stat-line">${stam}${cool}</div>` : '';

        return `<div class="id-stats-block">
            <div class="id-stats-title">${t('item_stats_title') || 'Статистика'}</div>
            ${dmg}
            ${row3}
            ${row4}
        </div>`;
    }

    static renderRecipesSection(item: ItemDefinition): string {
        const hasRecipes = item.recipes && item.recipes.length > 0;
        if (!hasRecipes) return '';
        const recipesHtml = item.recipes.map(r => {
            const ingredients = r.ingredientIds.map((id: string) => {
                const slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                return `<a href="/items?item=${slug}" class="id-recipe-ingredient" data-link data-slug="${slug}">${id}</a>`;
            }).join('');
            return `<div class="id-recipe">
                <span class="id-recipe-arrow">→</span>
                <span class="id-recipe-result">${r.resultId}</span>
                <span class="id-recipe-from">из:</span>
                <span class="id-recipe-ingredients">${ingredients}</span>
            </div>`;
        }).join('');
        return `<div class="id-recipes" hidden>${recipesHtml}</div>`;
    }

    static renderRecipesButton(item: ItemDefinition): string {
        const hasRecipes = item.recipes && item.recipes.length > 0;
        if (!hasRecipes) return '';
        return `<button class="id-recipes-btn" data-action="toggle-recipes" aria-expanded="false" title="${t('item_recipes') || 'Recipes'}"><span class="id-recipes-arrow">▼</span></button>`;
    }

    static renderPlayerInfo(playerItem?: PlayerItemData): string {
        if (!playerItem) return '';
        const cardsInfo = playerItem.cards_need === -1
            ? ''
            : `<div class="id-stat-row"><span class="stat-label">${t('player_item_cards')}:</span> <span class="stat-value">${playerItem.cards} / ${playerItem.cards_need}</span></div>`;
        return `<div class="id-player-stats">
            <div class="id-stat-row"><span class="stat-label">${t('player_item_level')}:</span> <span class="stat-value lvl">Lvl ${playerItem.level}</span></div>
            ${cardsInfo}
        </div>`;
    }
}
