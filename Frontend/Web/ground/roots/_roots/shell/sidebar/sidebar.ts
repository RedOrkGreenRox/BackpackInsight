/// <reference path="../../../../types/global.d.ts" />

/**
 * Сайдбар
 */
globalThis.toggleSidebar = function() {
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    body.classList.toggle('sidebar-open');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
};