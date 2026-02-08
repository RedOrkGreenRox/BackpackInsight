(function () {
    // 1. Отключаем штатную прыгучесть браузера сразу
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // 2. Сразу достаем позицию
    const scrollPos = localStorage.getItem('scrollPos');

    // 3. ПРИМЕНЯЕМ ПОЗИЦИЮ МГНОВЕННО
    // Это заставит браузер считать текущую точку точкой отсчета
    if (scrollPos) {
        window.scrollTo(0, parseInt(scrollPos));
        // Передаем значение в CSS для корректной работы position: fixed
        document.documentElement.style.setProperty('--scroll-y', scrollPos);
    }

    // 4. Блокируем скролл
    document.documentElement.classList.add('lock-scroll');

    // 5. Сохранение при уходе (лучше через addEventListener)
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('scrollPos', window.scrollY);
    });

    window.addEventListener('load', () => {
        setTimeout(() => {
            // 6. Снимаем блокировку
            document.documentElement.classList.remove('lock-scroll');

            // 7. Возвращаем позицию финально (на случай, если страница "выросла")
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
            // Подключаем стили для слабых устройств и вешаем класс на html
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/static/css/lowres.css';
            document.head.appendChild(link);
            document.documentElement.classList.add('low-res-mode');
        }
    }

    // 2. Динамический Preload (только если соединение НЕ медленное)
    if (!window.isSlowConnection) {
        const fonts = [
            '/static/fonts/Signika-Regular.woff2',
            '/static/fonts/NotoSans.woff2'
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

// Проверка на медленное соединение или старое железо
const isLowRes = window.isSlowConnection || window.innerWidth < 480;

if (isLowRes) {
    // Добавляем класс на html, чтобы скрыть элементы до загрузки lowres.css
    document.documentElement.classList.add('low-res-mode');
}
