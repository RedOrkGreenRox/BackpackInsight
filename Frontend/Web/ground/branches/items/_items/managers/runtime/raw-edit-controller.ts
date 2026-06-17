import { placeCaretAfter } from './caret-utils';
import { ListenerRegistrar } from './items-runtime-types';

export class RawEditController {
    constructor(private readonly container: HTMLElement, private readonly addListener: ListenerRegistrar) {}

    public init(richInput: HTMLElement): void {
        this.addListener(richInput, 'click', e => this.onClick(e as Event, richInput));
        this.addListener(richInput, 'dblclick', e => this.onDoubleClick(e as Event, richInput));
        this.addListener(richInput, 'keyup', e => this.onKeyup(e as KeyboardEvent));
    }

    private onClick(e: Event, richInput: HTMLElement): void {
        const target = e.target as HTMLElement;
        const token = target.closest('.rich-token') as HTMLElement;
        const closeBtn = target.closest('.token-close-btn') as HTMLElement;
        const placeholder = target.closest('.rich-placeholder') as HTMLElement;
        if (placeholder) return this.activatePlaceholder(e, placeholder);
        if (closeBtn && token) return this.removeToken(token, richInput);
        const editable = target.closest('.rich-token, .rich-group, .rich-operator') as HTMLElement;
        if (editable) this.focusEditable(e, editable);
    }

    private onDoubleClick(e: Event, richInput: HTMLElement): void {
        const editable = (e.target as HTMLElement).closest('.rich-token, .rich-group, .rich-operator') as HTMLElement;
        if (editable) this.convertToRawText(editable, richInput);
    }

    private onKeyup(event: KeyboardEvent): void {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        const adjacent = this.getAdjacentEditable(event.key);
        if (adjacent) this.focusEditable(event, adjacent);
    }

    private getAdjacentEditable(key: string): HTMLElement | null {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return null;
        const range = sel.getRangeAt(0);
        if (range.startContainer.nodeType !== 3) return null;
        const sibling = key === 'ArrowLeft' ? range.startContainer.previousSibling : range.startContainer.nextSibling;
        return sibling instanceof HTMLElement && sibling.matches('.rich-token, .rich-group, .rich-operator') ? sibling : null;
    }

    private focusEditable(e: Event, editable: HTMLElement): void {
        e.stopPropagation();
        this.container.querySelectorAll('.focused-token').forEach(el => el.classList.remove('focused-token'));
        editable.classList.add('focused-token');
    }

    private activatePlaceholder(e: Event, placeholder: HTMLElement): void {
        e.stopPropagation();
        this.container.querySelectorAll('.rich-placeholder.active-placeholder').forEach(el => el.classList.remove('active-placeholder'));
        placeholder.classList.add('active-placeholder');
    }

    private removeToken(token: HTMLElement, richInput: HTMLElement): void {
        token.remove();
        richInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    private convertToRawText(editable: HTMLElement, richInput: HTMLElement): void {
        const raw = editable.dataset['raw'] || editable.dataset['value'] || editable.textContent || '';
        const node = document.createTextNode(` ${raw} `);
        editable.replaceWith(node);
        placeCaretAfter(node);
        richInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
