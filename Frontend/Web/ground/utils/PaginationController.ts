import { Gen } from '@roots/Gen.ts';
// @ts-ignore
import AOS from 'aos';

export class PaginationController {
    private container: HTMLElement;
    private cleanupFns: (() => void)[] = [];
    private onExpand?: () => void;

    constructor(container: HTMLElement, onExpand?: () => void) {
        this.container = container;
        this.onExpand = onExpand;
        this.init();
    }

    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject) {
        if (element) {
            element.addEventListener(event, handler);
            this.cleanupFns.push(() => element.removeEventListener(event, handler));
        }
    }

    private init() {
        const loadMoreBtn = this.container.querySelector('#loadMoreItemsBtn');
        if (!loadMoreBtn) return;

        this.addListener(loadMoreBtn, 'click', () => {
            const hiddenLinks = this.container.querySelectorAll('.item-card-link.hidden');

            hiddenLinks.forEach(link => {
                link.classList.remove('hidden');
                link.classList.remove('aos-animate');
                void (link as HTMLElement).offsetWidth;
            });

            loadMoreBtn.remove();

            Gen.getInstance().updateCurrentState({ itemsExpanded: true });
            if (this.onExpand) this.onExpand(); // ИСПРАВЛЕНО: уведомляем ProfileBranch

            if (typeof AOS !== 'undefined') {
                setTimeout(() => {
                    AOS.refresh();
                    hiddenLinks.forEach(link => {
                        if (!link.classList.contains('aos-animate')) {
                            link.classList.add('aos-animate');
                        }
                    });
                }, 100);
            }
        });
    }

    public destroy() {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}