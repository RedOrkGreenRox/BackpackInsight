import { moveCaretToEnd } from './caret-utils';
import { AutocompleteController } from './autocomplete-controller';
import { ListenerRegistrar } from './items-runtime-types';
import { RichQueryRenderer } from './rich-query-renderer';
import { RawEditController } from './raw-edit-controller';
export class RichInputController {
    private readonly autocomplete = new AutocompleteController();
    constructor(
        private readonly container: HTMLElement,
        private readonly renderer: RichQueryRenderer,
        private readonly addListener: ListenerRegistrar,
        private readonly onQueryChange: () => void,
        private readonly onCompile: () => void,
        private readonly isAdvancedMode: () => boolean = () => true,
    ) {}
    public init(initialQuery: string): void {
        const richInput = this.input();
        if (!richInput) return;
        if (initialQuery) {
            if (this.isAdvancedMode()) richInput.innerHTML = this.renderer.renderTextToRichHTML(initialQuery);
            else richInput.textContent = initialQuery;
        }
        this.attachInput(richInput);
        this.attachKeys(richInput);
        this.attachCopy(richInput);
        new RawEditController(this.container, this.addListener).init(richInput);
        this.attachOutsideClick();
    }
    public getInput(): HTMLElement | null {
        return this.input();
    }
    public triggerCompilation(): void {
        const richInput = this.input();
        if (!richInput) return;
        const rawText = this.renderer.getCleanTextFromRichHTML(this.container);
        richInput.innerHTML = this.renderer.renderTextToRichHTML(rawText);
        moveCaretToEnd(richInput);
        this.onCompile();
        this.autocomplete.hide(this.container);
    }
    public renderPlainText(): void {
        const richInput = this.input();
        if (!richInput) return;
        richInput.textContent = this.renderer.getCleanTextFromRichHTML(this.container);
        moveCaretToEnd(richInput);
    }
    public hideAutocomplete(): void {
        this.autocomplete.hide(this.container);
    }
    private attachInput(richInput: HTMLElement): void {
        this.addListener(richInput, 'input', () => {
            if (!richInput.textContent?.trim()) this.autocomplete.hide(this.container);
            this.onQueryChange();
        });
    }
    private attachKeys(richInput: HTMLElement): void {
        this.addListener(richInput, 'keyup', (e: Event) => {
            const event = e as KeyboardEvent;
            if (!['Enter', 'Escape', 'Backspace'].includes(event.key)) this.autocomplete.handle(this.container);
        });
        this.addListener(richInput, 'keydown', (e: Event) => this.handleKeydown(e as KeyboardEvent, richInput));
    }
    private handleKeydown(event: KeyboardEvent, richInput: HTMLElement): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (this.isAdvancedMode()) {
                if (!this.acceptGhost(richInput)) this.triggerCompilation();
            } else if (!this.acceptGhost(richInput)) {
                this.onCompile();
            }
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            this.autocomplete.hide(this.container);
            return;
        }
        if (event.key === 'Backspace') this.handleBackspace(event, richInput);
    }
    private acceptGhost(richInput: HTMLElement): boolean {
        const ghost = richInput.querySelector('.ghost-suggestion') as HTMLElement;
        if (!ghost) return false;
        const textNode = document.createTextNode((ghost.textContent || '') + ' ');
        ghost.parentNode?.replaceChild(textNode, ghost);
        const selection = window.getSelection();
        if (selection) {
            const range = document.createRange();
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        this.autocomplete.hide(this.container);
        richInput.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    }
    private handleBackspace(event: KeyboardEvent, richInput: HTMLElement): void {
        this.autocomplete.hide(this.container);
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        const range = selection.getRangeAt(0);
        const prev = range.startOffset === 0 ? range.startContainer.previousSibling as HTMLElement | null : null;
        if (!prev?.classList || !['rich-token', 'rich-operator'].some(c => prev.classList.contains(c))) return;
        event.preventDefault();
        prev.remove();
        richInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    private attachCopy(richInput: HTMLElement): void {
        this.addListener(richInput, 'copy', (e: Event) => {
            const event = e as ClipboardEvent;
            event.preventDefault();
            event.clipboardData?.setData('text/plain', this.renderer.getCleanTextFromRichHTML(this.container));
        });
    }
    private attachOutsideClick(): void {
        this.addListener(this.container, 'click', (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.closest('.logical-chip')) return;
            if (!target.closest('.rich-token')) this.container.querySelectorAll('.rich-token.focused-token').forEach(el => el.classList.remove('focused-token'));
            if (!target.closest('.rich-placeholder')) this.container.querySelectorAll('.rich-placeholder.active-placeholder').forEach(el => el.classList.remove('active-placeholder'));
        });
    }
    private input(): HTMLElement | null {
        return this.container.querySelector('#itemSearch') as HTMLElement | null;
    }
}
