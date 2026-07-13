import { ItemDefinition } from '../utils/item-detail-types';
import { ImageFormatService } from '@utils/ImageFormatService';
import { ItemIconService } from '@utils/ItemIconService';

export class ItemGridRenderer {

    static render(item: ItemDefinition): string {
        const shape = item.itemShape ?? [];
        const stars = item.itemStars ?? [];
        const imageName = ItemIconService.getImagePath(item);
        const imageSrc = ImageFormatService.itemSrc(imageName);

        if (!shape.length && !stars.length) {
            return `<div class="id-grid-empty"><img src="${imageSrc}" alt="${item.name}" data-fallback></div>`;
        }

        const b = this.bounds(shape, stars);
        const cols = b.maxX - b.minX + 1;
        const rows = b.maxY - b.minY + 1;

        const cells: string[] = [];
        for (let y = b.minY; y <= b.maxY; y++) {
            for (let x = b.minX; x <= b.maxX; x++) {
                const col = x - b.minX + 1;
                const row = b.maxY - y + 1;
                const filled = shape.some(c => c.x === x && c.y === y);
                cells.push(`<div class="id-grid-cell${filled ? ' filled' : ''}" style="grid-column:${col};grid-row:${row};"></div>`);
            }
        }
        const starEls: string[] = [];
        for (const star of stars) {
            const col = star.x - b.minX + 1;
            const row = b.maxY - star.y + 1;
            starEls.push(`<div class="id-grid-star" style="grid-column:${col};grid-row:${row};">${this.starIcon()}</div>`);
        }

        return `
            <div class="id-grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);aspect-ratio:${cols}/${rows};">
                <div class="id-grid-all-cells">${cells.join('')}</div>
                <img class="id-grid-icon" src="${imageSrc}" alt="${item.name}" loading="lazy" decoding="async" data-fallback>
                <div class="id-grid-stars">${starEls.join('')}</div>
            </div>`;
    }

    private static starIcon(): string {
        const src = ImageFormatService.iconSrc('star');
        return `<img src="${src}" alt="star" class="id-grid-star-icon">`;
    }

    private static bounds(shape: {x:number;y:number}[], stars: {x:number;y:number}[]): {minX:number;minY:number;maxX:number;maxY:number} {
        const all = [...shape, ...stars];
        let minX = 0, minY = 0, maxX = 0, maxY = 0;
        for (const c of all) {
            if (c.x < minX) minX = c.x;
            if (c.x > maxX) maxX = c.x;
            if (c.y < minY) minY = c.y;
            if (c.y > maxY) maxY = c.y;
        }
        return { minX, minY, maxX, maxY };
    }
}
