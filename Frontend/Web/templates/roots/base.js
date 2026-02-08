import "./_roots.scss";

// Import fonts so Vite processes them and we can get their final URLs
import signikaRegular from '/static/fonts/Signika-Regular.woff2';
import notoSansRegular from '/static/fonts/NotoSans.woff2';




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
        localStorage.setItem('scrollPos', window.scrollY);
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
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
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

    // 2. Динамический Preload
    if (!window.isSlowConnection) {
        const fonts = [
            signikaRegular,
            notoSansRegular
        ];

        fonts.forEach(fontHref => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = fontHref;
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
})();

const isLowRes = window.isSlowConnection || window.innerWidth < 480;
if (isLowRes) {
    document.documentElement.classList.add('low-res-mode');
}

// --- BASE LOGIC (MODULES) ---
import '/templates/roots/_roots/shell/ui_init/ui_init.js';
import '/templates/roots/_roots/shell/parallax/parallax.js';
import '/templates/roots/_roots/shell/sidebar/sidebar.js';
import '/templates/roots/_roots/shell/navigation/navigation.js';

document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.AOS !== 'undefined') {
        window.AOS.init({
            duration: 800,
            once: true,
            disable: window.isSlowConnection
        });
    }
});
