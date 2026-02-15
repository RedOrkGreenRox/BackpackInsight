import { Gen } from './roots/Gen';
import { Shell } from './roots/Shell';
import { Parallax } from './roots/Parallax';
import { MainBranch } from './branches/main/MainBranch';
import { ProfileBranch } from './branches/profile/ProfileBranch';
import { ItemsBranch } from './branches/items/ItemsBranch';
import { NotFoundBranch } from './branches/404/NotFoundBranch';
import { ItemDetailBranch } from './branches/itemDetail/ItemDetailBranch'; // Обновленный путь
import { i18n } from './localization/i18n';

// Импорт AOS из npm
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
        } else {
            // Автоматическое определение, если пользователь не делал выбор
            if (this.isSlowConnection() || this.isLowEndDevice()) {
                console.log("PerformanceMonitor: Slow connection or low-end device detected. Enabling low-res mode.");
                this.enableMode();
            }
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
(window as any).AOS = AOS;

document.addEventListener('DOMContentLoaded', async () => {
    // Сначала инициализируем локализацию
    await i18n.init();

    // Затем все остальное
    PerformanceMonitor.init();

    // Инициализация анимаций
    AOS.init({
        duration: 800,
        once: true
    });

    Shell.getInstance();
    Parallax.init();

    const router = Gen.getInstance();
    
    // Статические маршруты
    router.register('/', MainBranch);
    router.register('/profile', ProfileBranch);
    router.register('/items', ItemsBranch);
    router.register('/404', NotFoundBranch);

    // Динамические маршруты
    router.register('/item/:name', ItemDetailBranch);
    router.register('/profile/item/:name', ItemDetailBranch);
    
    router.init('app');

    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});
