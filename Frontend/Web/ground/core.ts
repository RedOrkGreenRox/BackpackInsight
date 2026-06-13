import { Gen } from './roots/Gen';
import { Shell } from './roots/Shell';
import { Parallax } from './roots/Parallax';
import './roots/_roots/shell/ui_init/ui_init'; // Импорт инициализации UI
import { i18n } from './localization/i18n';
import { ImageFormatService } from './utils/ImageFormatService';

// Импорт AOS из npm
// @ts-ignore
import AOS from 'aos';
import 'aos/dist/aos.css';

/**
 * PerformanceMonitor - класс для управления режимом экономии ресурсов.
 */
class PerformanceMonitor {
    private static readonly STORAGE_KEY = 'lowResMode';

    public static init() {
        const userChoice = localStorage.getItem(this.STORAGE_KEY);

        if (userChoice === 'enabled') {
            this.enableMode();
        } else if (userChoice === 'disabled') {
            this.disableMode();
        } else if (this.isSlowConnection() || this.isLowEndDevice()) {
            // Автоматическое определение, если пользователь не делал выбор
            this.enableMode();
        }
    }

    /**
     * Переключает режим или принудительно устанавливает его.
     * @param force - true для включения, false для выключения. Если не указан, переключает.
     */
    public static toggleLowResMode(force?: boolean) {
        const isEnabled = document.body.classList.contains('low-res-mode');
        const shouldEnable = force === undefined ? !isEnabled : force;

        if (shouldEnable) {
            this.enableMode();
            localStorage.setItem(this.STORAGE_KEY, 'enabled');
        } else {
            this.disableMode();
            localStorage.setItem(this.STORAGE_KEY, 'disabled');
        }
    }

    private static enableMode() {
        document.body.classList.add('low-res-mode');
    }

    private static disableMode() {
        document.body.classList.remove('low-res-mode');
    }

    private static isSlowConnection(): boolean {
        const conn = (navigator as any).connection;
        if (!conn) return false;

        // effectiveType: 'slow-2g', '2g', '3g', '4g'
        // downlink: скорость в Мбит/с
        return conn.effectiveType.includes('2g') || (conn.downlink && conn.downlink < 1);
    }

    private static isLowEndDevice(): boolean {
        // deviceMemory: объем ОЗУ в ГБ (приблизительно)
        const memory = (navigator as any).deviceMemory;
        if (memory && memory < 4) { // Меньше 4 ГБ ОЗУ
            return true;
        }

        // hardwareConcurrency: количество логических ядер процессора
        const cores = navigator.hardwareConcurrency;
        if (cores && cores < 4) { // Меньше 4 ядер
            return true;
        }

        return false;
    }
}


// Делаем AOS глобальным для совместимости с другими файлами, 
// где используется declare const AOS
(globalThis as any).AOS = AOS;

document.addEventListener('DOMContentLoaded', async () => {
    // Сначала инициализируем локализацию и единый формат изображений
    await Promise.all([
        i18n.init(),
        ImageFormatService.init()
    ]);

    // Затем все остальное
    PerformanceMonitor.init();

    // Инициализация анимаций
    AOS.init({
        duration: 800,
        once: false, // Разрешаем повторные анимации
        offset: -400, // Запускать за 400px до появления в viewport
        throttleDelay: 0, // Без задержек
        debounceDelay: 0, // Мгновенная реакция
        mirror: false,
        anchorPlacement: 'top-bottom' // Когда верх элемента достигает низа окна
    });

    Shell.getInstance();
    Parallax.init();

    const router = Gen.getInstance();
    
    // Статические маршруты — lazy loaded, чтобы не тащить все страницы в initial bundle
    router.register('/', () => import('./branches/main/MainBranch').then(m => m.MainBranch));
    router.register('/profile', () => import('./branches/profile/ProfileBranch').then(m => m.ProfileBranch));
    router.register('/items', () => import('./branches/items/ItemsBranch').then(m => m.ItemsBranch));
    router.register('/404', () => import('./branches/404/NotFoundBranch').then(m => m.NotFoundBranch));

    // Динамические маршруты
    router.register('/item/:name', () => import('./branches/itemDetail/ItemDetailBranch').then(m => m.ItemDetailBranch));
    router.register('/profile/item/:name', () => import('./branches/itemDetail/ItemDetailBranch').then(m => m.ItemDetailBranch));

    document.body.addEventListener('pointerover', (event) => {
        const target = (event.target as HTMLElement).closest('[data-link]');
        const href = target?.getAttribute('href');
        if (href) router.prefetch(href);
    }, { passive: true });

    document.body.addEventListener('focusin', (event) => {
        const target = (event.target as HTMLElement).closest('[data-link]');
        const href = target?.getAttribute('href');
        if (href) router.prefetch(href);
    });

    const requestIdle = globalThis.requestIdleCallback || ((cb: IdleRequestCallback) => globalThis.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 800));
    requestIdle(() => {
        const connection = (navigator as any).connection;
        const saveData = !!connection?.saveData;
        const slowConnection = typeof connection?.effectiveType === 'string' && connection.effectiveType.includes('2g');
        if (!saveData && !slowConnection) {
            router.prefetch('/items');
        }
    });
    
    router.init('app');

    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});
