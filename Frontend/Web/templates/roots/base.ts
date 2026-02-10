import "./_roots.scss";

// --- HEAD LOGIC (CRITICAL) ---
(function () {
    // 1. Отключаем штатную прыгучесть браузера сразу
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // 2. Сразу достаем позицию
    const scrollPos = localStorage.getItem('scrollPos');

    // 3. ПРИМЕНЯЕМ ПОЗИЦИЮ МГНОВЕННО
    if (scrollPos) {
        window.scrollTo(0, parseInt(scrollPos));
        document.documentElement.style.setProperty('--scroll-y', scrollPos);
    }

    // 4. Блокируем скролл
    document.documentElement.classList.add('lock-scroll');

    // 5. Сохранение при уходе
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('scrollPos', window.scrollY.toString());
    });

    window.addEventListener('load', () => {
        setTimeout(() => {
            // 6. Снимаем блокировку
            document.documentElement.classList.remove('lock-scroll');

            // 7. Возвращаем позицию финально
            if (scrollPos) {
                window.scrollTo({
                    top: parseInt(scrollPos),
                    behavior: 'instant'
                });
            }
        }, 1000);
    });
})();

(function () {
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    window.isSlowConnection = false;

    // 1. Проверка типа соединения
    if (conn) {
        if (conn.saveData || ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) {
            window.isSlowConnection = true;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/templates/roots/lowres.css';
            document.head.appendChild(link);
            document.documentElement.classList.add('low-res-mode');
        }
    }
})();

const isLowRes = window.isSlowConnection || window.innerWidth < 480;
if (isLowRes) {
    document.documentElement.classList.add('low-res-mode');
}

// --- BASE LOGIC (MODULES) ---
import '/templates/roots/_roots/shell/ui_init/ui_init.ts';
import '/templates/roots/_roots/shell/parallax/parallax.ts';
import '/templates/roots/_roots/shell/sidebar/sidebar.ts';
import '/templates/roots/_roots/shell/navigation/navigation.ts';

document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.AOS !== 'undefined') {
        window.AOS.init({
            duration: 800,
            once: true,
            disable: window.isSlowConnection
        });
    }
});