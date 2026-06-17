import { HERO_LIST, RARITY_LIST, TYPE_LIST } from './items-runtime-types';

export class AutocompleteController {
    public handle(container: HTMLElement): void {
        const richInput = container.querySelector('#itemSearch') as HTMLElement;
        if (!richInput) return;
        this.hide(container);
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        if (textNode.nodeType !== 3) return;

        const typedPart = (textNode.textContent || '').slice(0, range.startOffset).split(/\s+/).pop() || '';
        if (typedPart.length < 2 || ['[', '<', '{', '('].some(prefix => typedPart.startsWith(prefix))) return;
        const bestMatch = this.findBestMatch(typedPart.toLowerCase());
        if (!bestMatch) return;

        const remainder = bestMatch.slice(typedPart.length);
        const formatted = typedPart.charAt(0) === typedPart.charAt(0).toUpperCase() ? remainder : remainder.toLowerCase();
        const ghostSpan = document.createElement('span');
        ghostSpan.className = 'ghost-suggestion';
        ghostSpan.contentEditable = 'false';
        ghostSpan.textContent = formatted;
        range.insertNode(ghostSpan);
        range.setStartBefore(ghostSpan);
        range.setEndBefore(ghostSpan);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    public hide(container: HTMLElement): void {
        const richInput = container.querySelector('#itemSearch') as HTMLElement;
        richInput?.querySelectorAll('.ghost-suggestion').forEach(el => el.remove());
    }

    private findBestMatch(query: string): string {
        for (const word of [...HERO_LIST, ...RARITY_LIST, ...TYPE_LIST]) {
            if (word.startsWith(query) && word !== query) return word;
        }
        return '';
    }
}
