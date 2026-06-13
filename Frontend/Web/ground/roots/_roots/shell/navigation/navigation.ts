/// <reference path="../../../../types/global.d.ts" />

/**
 * Переход между страницами
 */
globalThis.goTo = function(url: string) {
    const isMobile = globalThis.innerWidth <= 768;
    const delay = isMobile ? 100 : 250; // Уменьшили задержку для скорости

    document.body.classList.add('leaving');

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    setTimeout(() => {
        globalThis.location.href = url;
    }, delay);
};

// Восстановление после кнопки "Назад"
globalThis.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.body.classList.remove('leaving', 'sidebar-open');
        document.body.classList.add('loaded');
    }
});