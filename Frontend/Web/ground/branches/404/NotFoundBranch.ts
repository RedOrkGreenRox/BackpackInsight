import { Branch } from '../../roots/Branch';
import { Gen } from '../../roots/Gen';
import { Shell } from '../../roots/Shell';
import { t } from '../../localization/i18n';

export class NotFoundBranch extends Branch {
    protected getHtml(): string {
        return `
            <div class="container" style="text-align: center; padding-top: 20vh; position: relative; z-index: 10;">
                <h1 style="font-size: 6rem; color: #ff5555; margin-bottom: 20px; text-shadow: 0 4px 10px black;">${t('not_found_title')}</h1>
                <p style="font-size: 1.5rem; margin-bottom: 40px; text-shadow: 0 2px 5px black;">${t('not_found_text')}</p>
                <button id="homeBtn" class="button-view-profile">${t('not_found_button')}</button>
            </div>
        `;
    }

    protected init(): void {
        this.set404Background();

        this.container?.querySelector('#homeBtn')?.addEventListener('click', () => {
            Gen.getInstance().navigate('/');
        });
    }

    private set404Background(): void {
        // Взвешенный рандом: [80, 15, 4, 0.9, 0.1]
        // 00, 01, 02, 03, 04
        const rand = Math.random() * 100;
        let rarity = '00';

        if (rand > 99.9) rarity = '04';       // 0.1%
        else if (rand > 99) rarity = '03';    // 0.9%
        else if (rand > 95) rarity = '02';    // 4%
        else if (rand > 80) rarity = '01';    // 15%
        else rarity = '00';                   // 80%

        Shell.getInstance().set404Background(rarity);
    }

    protected destroy(): void {
        // При уходе со страницы возвращаем обычный фон
        Shell.getInstance().setRandomBackground();
    }
}
