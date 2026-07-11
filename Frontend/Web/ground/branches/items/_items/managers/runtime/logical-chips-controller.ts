import { insertHTMLAtCaret } from './caret-utils';
import { ListenerRegistrar } from './items-runtime-types';
import { refreshAncestorGroups } from './group-dom-raw';
import { renderGroup, renderGroupInner, replaceGroupSlot, slotToken } from './rich-group-renderer';
import { RichInputController } from './rich-input-controller';
import { RichQueryRenderer } from './rich-query-renderer';

export class LogicalChipsController {
    constructor(
        private readonly container: HTMLElement,
        private readonly addListener: ListenerRegistrar,
        private readonly inputController: RichInputController,
        private readonly renderer: RichQueryRenderer,
    ) {}

    public init(): void {
        this.container.querySelectorAll('.logical-chip').forEach(btn => {
            this.addListener(btn, 'click', () => this.onClick(btn as HTMLElement));
        });
    }

    private onClick(btn: HTMLElement): void {
        const richInput = this.inputController.getInput();
        if (!richInput) return;
        const raw = this.templateFor(btn.dataset['value']);
        if (!raw) return;
        const focused = this.focusedEditable(richInput);
        const group = this.activeGroup();
        if (focused) this.replaceFocused(richInput, focused, raw);
        else if (group) this.replaceActiveSlot(group, raw);
        else this.insertTemplate(richInput, raw);
        richInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    private templateFor(value: string | undefined): string {
        if (value === '[]') return `[${slotToken()}]`;
        if (value === '&') return `[${slotToken()} & ${slotToken()}]`;
        if (value === '|') return `[${slotToken()} | ${slotToken()}]`;
        if (value === '!') return `[!${slotToken()}]`;
        return '';
    }

    private insertTemplate(richInput: HTMLElement, raw: string): void {
        insertHTMLAtCaret(richInput, renderGroup(raw, token => this.renderer.compileTokenToHTML(token)));
    }

    private focusedEditable(richInput: HTMLElement): HTMLElement | null {
        return richInput.querySelector('.focused-token.rich-token, .focused-token.rich-group, .focused-token.rich-operator');
    }

    private replaceFocused(richInput: HTMLElement, focused: HTMLElement, raw: string): void {
        const node = this.htmlToElement(renderGroup(raw, token => this.renderer.compileTokenToHTML(token)));
        focused.replaceWith(node);
        const parent = node.parentElement?.closest('.rich-group') as HTMLElement | null;
        if (parent) refreshAncestorGroups(parent);
        richInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    private activeGroup(): HTMLElement | null {
        const placeholder = this.container.querySelector('.rich-placeholder.active-placeholder');
        return placeholder?.closest('.rich-group') as HTMLElement | null;
    }

    private htmlToElement(html: string): HTMLElement {
        const dummy = document.createElement('div');
        dummy.innerHTML = html;
        return dummy.firstElementChild as HTMLElement;
    }

    private replaceActiveSlot(group: HTMLElement, rawTemplate: string): void {
        const nextRaw = replaceGroupSlot(group.dataset['raw'] || '[]', rawTemplate);
        group.dataset['raw'] = nextRaw;
        group.innerHTML = renderGroupInner(nextRaw, token => this.renderer.compileTokenToHTML(token));
        refreshAncestorGroups(group);
    }
}
