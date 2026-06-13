import { describe, it, expect } from 'vitest';
import { SortController } from '../ground/branches/profile/_profile/sort/SortController';

const { JSDOM } = require('jsdom');

describe('SortController', () => {
    let dom: JSDOM;
    let document: Document;
    let container: HTMLElement;

    beforeEach(() => {
        dom = new JSDOM(`
            <div id="profile-sort">
                <button id="sortToggle"></button>
                <button id="invertToggle"></button>
                <span id="sortText"></span>
                <img id="sortIcon" src="" />
                <img id="invertIcon" src="" />
                <div id="mainHeroesGrid">
                    <div class="card" data-level="10" data-rating="1000" data-prestige="false">Hero 1</div>
                    <div class="card" data-level="20" data-rating="500" data-prestige="false">Hero 2</div>
                    <div class="card" data-level="5" data-rating="1500" data-prestige="true">Hero 3</div>
                </div>
                <div id="statsHeroesGrid"></div>
            </div>
        `);
        document = dom.window.document;
        container = document.getElementById('profile-sort')!;
        globalThis.HTMLElement = dom.window.HTMLElement;
        globalThis.HTMLImageElement = dom.window.HTMLImageElement;
        globalThis.document = document;
        globalThis.requestAnimationFrame = (cb) => cb();
    });

    it('should sort by level descending by default', () => {
        const sc = new SortController(container);
        sc.destroy(); // used: init triggers sort, destroy for cleanup
        const grid = container.querySelector('#mainHeroesGrid')!;
        const cards = Array.from(grid.children);
        
        // Hero 3 (5+20=25), Hero 2 (20), Hero 1 (10)
        expect(cards[0].textContent).toBe('Hero 3');
        expect(cards[1].textContent).toBe('Hero 2');
        expect(cards[2].textContent).toBe('Hero 1');
    });

    it('should toggle sorting direction', () => {
        const sc = new SortController(container);
        sc.destroy(); // used: init triggers sort, destroy for cleanup
        const invertBtn = container.querySelector('#invertToggle')!;
        
        invertBtn.click(); // Теперь ASC
        
        const grid = container.querySelector('#mainHeroesGrid')!;
        const cards = Array.from(grid.children);
        
        // Hero 1 (10), Hero 2 (20), Hero 3 (25)
        expect(cards[0].textContent).toBe('Hero 1');
        expect(cards[2].textContent).toBe('Hero 3');
    });

    it('should sort by rating', () => {
        const sc = new SortController(container);
        sc.destroy(); // used: init triggers sort, destroy for cleanup
        const sortBtn = container.querySelector('#sortToggle')!;
        
        sortBtn.click(); // Смена на rating
        
        const grid = container.querySelector('#mainHeroesGrid')!;
        const cards = Array.from(grid.children);
        
        // Ratings: H3(1500), H1(1000), H2(500)
        expect(cards[0].textContent).toBe('Hero 3');
        expect(cards[1].textContent).toBe('Hero 1');
        expect(cards[2].textContent).toBe('Hero 2');
    });

    it('should correctly handle prestige in level sorting', () => {
        const sc = new SortController(container);
        sc.destroy(); // used: init triggers sort, destroy for cleanup
        const grid = container.querySelector('#mainHeroesGrid')!;
        
        // Hero 3 is level 5 but prestige, so 5+20 = 25
        // Hero 2 is level 20
        const cards = Array.from(grid.children);
        expect(cards[0].textContent).toBe('Hero 3');
    });
});
