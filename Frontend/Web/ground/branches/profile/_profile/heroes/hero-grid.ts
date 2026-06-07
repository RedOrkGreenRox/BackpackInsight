/**
 * HeroGridRenderer - рендеринг сетки героев
 */

import { Hero } from '../utils/profile-types';
import { HeroCardRenderer } from './hero-card';

export class HeroGridRenderer {
    static render(heroes: Hero[]): string {
        return `
            <div class="main-heroes-grid" id="mainHeroesGrid">
                ${heroes.map(hero => HeroCardRenderer.render(hero)).join('')}
            </div>
        `;
    }
}
