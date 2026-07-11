// @ts-ignore
import AOS from 'aos';
import { ListenerRegistrar } from './items-runtime-types';

export class AdvancedPanelController {
    constructor(
        private readonly container: HTMLElement,
        private readonly addListener: ListenerRegistrar,
        private readonly getVisible: () => boolean,
        private readonly setVisible: (visible: boolean) => void,
        private readonly saveState: () => void,
    ) {}

    public init(): void {
        const toggle = this.container.querySelector('#advancedFiltersToggle');
        if (toggle) this.addListener(toggle, 'click', () => this.toggle());
        this.applyInitialState();
    }

    private applyInitialState(): void {
        const panel = this.panel();
        const icon = this.icon();
        const toggle = this.toggleBtn();
        const wrapper = this.wrapper();
        if (!panel || !icon || !toggle || !wrapper) return;
        if (this.getVisible()) {
            panel.style.display = 'block';
            setTimeout(() => { panel.classList.add('show'); wrapper.classList.add('open'); }, 10);
            toggle.classList.add('open');
        } else {
            panel.style.display = 'none';
            panel.classList.remove('show');
            wrapper.classList.remove('open');
            toggle.classList.remove('open');
        }
        icon.textContent = this.getVisible() ? '▲' : '▼';
    }

    private toggle(): void {
        this.setVisible(!this.getVisible());
        const panel = this.panel();
        const icon = this.icon();
        const toggleBtn = this.toggleBtn();
        const wrapper = this.wrapper();
        if (panel && toggleBtn && wrapper) {
            if (this.getVisible()) this.show(panel, toggleBtn, wrapper);
            else this.hide(panel, toggleBtn, wrapper);
        }
        if (icon) icon.textContent = this.getVisible() ? '▲' : '▼';
        this.saveState();
    }

    private show(panel: HTMLElement, toggleBtn: HTMLElement, wrapper: HTMLElement): void {
        panel.style.display = 'block';
        setTimeout(() => {
            panel.classList.add('show');
            wrapper.classList.add('open');
            setTimeout(() => { if (AOS !== undefined) AOS.refresh(); }, 50);
        }, 10);
        toggleBtn.classList.add('open');
    }

    private hide(panel: HTMLElement, toggleBtn: HTMLElement, wrapper: HTMLElement): void {
        panel.classList.remove('show');
        wrapper.classList.remove('open');
        setTimeout(() => {
            if (!panel.classList.contains('show')) panel.style.display = 'none';
            if (AOS !== undefined) AOS.refresh();
        }, 400);
        toggleBtn.classList.remove('open');
    }

    private panel(): HTMLElement | null { return this.container.querySelector('#advancedFiltersPanel'); }
    private icon(): HTMLElement | null { return this.container.querySelector('.filter-toggle-icon'); }
    private toggleBtn(): HTMLElement | null { return this.container.querySelector('#advancedFiltersToggle'); }
    private wrapper(): HTMLElement | null { return this.container.querySelector('.search-input-wrapper'); }
}
