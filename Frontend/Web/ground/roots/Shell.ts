import { Gen } from './Gen';
import { i18n, t } from '../localization/i18n';

export class Shell {
    private static instance: Shell;
    private readonly sidebar: HTMLElement | null = null;
    private readonly overlay: HTMLElement | null = null;
    private readonly toggleBtn: HTMLElement | null = null;
    private readonly bgImg: HTMLImageElement | null = null;

    private constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebarOverlay');
        this.toggleBtn = document.getElementById('menuToggle');
        this.bgImg = document.getElementById('bgImg') as HTMLImageElement;

        this.initListeners();
        this.setRandomBackground();
        this.addLangSwitcher();
        this.translateStaticContent(); 
    }

    public static getInstance(): Shell {
        if (!Shell.instance) {
            Shell.instance = new Shell();
        }
        return Shell.instance;
    }

    private translateStaticContent() {
        document.querySelectorAll('[data-i18n-key]').forEach(element => {
            const key = (element as HTMLElement).dataset['i18nKey'];
            if (key) {
                element.textContent = t(key);
            }
        });
    }

    private addLangSwitcher() {
        if (!this.sidebar) return;

        const switcher = document.createElement('button');
        switcher.id = 'lang-switcher';
        switcher.textContent = t('lang_switch_button', { lang: i18n.currentLang === 'ru' ? 'EN' : 'RU' });

        switcher.addEventListener('click', async () => {
            const newLang = i18n.currentLang === 'ru' ? 'en' : 'ru';
            
            // Сохраняем текущую редкость перед сменой языка, если на 404
            if (document.body.classList.contains('error-404')) {
                const { BackgroundManager } = await import('../branches/404/_404/background/background');
                BackgroundManager.setLanguageChanging(true);
            }
            
            await i18n.setLanguage(newLang);
            
            // Перерисовываем статический контент и текущую страницу
            this.translateStaticContent();
            Gen.getInstance().reRenderCurrentBranch();
            
            // Обновляем текст на самой кнопке
            switcher.textContent = t('lang_switch_button', { lang: i18n.currentLang === 'ru' ? 'EN' : 'RU' });
        });

        this.sidebar.appendChild(switcher);
    }

    private initListeners(): void {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeSidebar());
        }

        if (this.sidebar) {
            this.sidebar.addEventListener('click', (e) => {
                const target = (e.target as HTMLElement).closest('[data-link]');
                if (target) {
                    e.preventDefault();
                    const href = target.getAttribute('href');
                    if (href) {
                        this.closeSidebar();
                        Gen.getInstance().navigate(href);
                    }
                }
            });
        }
    }

    public toggleSidebar(): void {
        this.sidebar?.classList.toggle('open');
        document.body.classList.toggle('sidebar-open');
    }

    public closeSidebar(): void {
        this.sidebar?.classList.remove('open');
        document.body.classList.remove('sidebar-open');
    }

    public setBackground(areaCode: string): void {
        this.updateBgImage(
            `/images/area/webp/area${areaCode}.webp`,
            `/images/area/avif/area${areaCode}.avif`
        );
    }

    public set404Background(rarityCode: string): void {
        this.updateBgImage(
            `/images/404/webp/${rarityCode}.webp`,
            `/images/404/avif/${rarityCode}.avif`
        );
    }

    private updateBgImage(webp: string, avif: string): void {
        if (!this.bgImg) return;
        
        const picture = this.bgImg.parentElement;
        if (picture) {
            const sources = picture.querySelectorAll('source');
            sources.forEach(s => {
                if (s.type === 'image/avif') s.srcset = avif;
                if (s.type === 'image/webp') s.srcset = webp;
            });
        }
        this.bgImg.src = webp;
    }

    public setRandomBackground(): void {
        const random = Math.floor(Math.random() * 20) + 1;
        const code = random.toString().padStart(2, '0');
        this.setBackground(code);
    }
}
