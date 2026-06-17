import { ListenerRegistrar } from './items-runtime-types';

export class DropdownController {
    constructor(private readonly container: HTMLElement, private readonly addListener: ListenerRegistrar) {}

    public init(): void {
        this.container.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            this.addListener(toggle, 'click', (e: Event) => this.onClick(e, toggle as HTMLElement));
        });
    }

    private onClick(e: Event, toggle: HTMLElement): void {
        e.preventDefault();
        e.stopPropagation();
        const targetId = toggle.dataset['target'];
        if (!targetId) return;
        const dropdown = this.container.querySelector(`#${targetId}`) as HTMLElement;
        const arrow = toggle.querySelector('.dropdown-arrow') as HTMLElement;
        if (!dropdown) return;
        const isOpen = dropdown.classList.contains('show');
        dropdown.classList.toggle('show', !isOpen);
        toggle.classList.toggle('open', !isOpen);
        if (arrow) arrow.textContent = isOpen ? '▼' : '▲';
    }
}
