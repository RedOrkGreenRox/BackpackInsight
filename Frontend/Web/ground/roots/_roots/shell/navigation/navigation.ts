/// <reference path="../../../../types/global.d.ts" />

/**
 * Переход между страницами
 */
window.goTo = function(url: string) {
    const isMobile = window.innerWidth <= 768;
    const delay = isMobile ? 100 : 250; // Уменьшили задержку для скорости

    document.body.classList.add('leaving');

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    setTimeout(() => {
        window.location.href = url;
    }, delay);
};

// Восстановление после кнопки "Назад"
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.body.classList.remove('leaving', 'sidebar-open');
        document.body.classList.add('loaded');
    }
});