import './_roots/shell/ui_init/ui_init.js';
import './_roots/shell/parallax/parallax.js';
import './_roots/shell/sidebar/sidebar.js';
import './_roots/shell/navigation/navigation.js';

document.addEventListener('DOMContentLoaded', function () {
    // AOS добавляется в глобальную область видимости (window.AOS)
    if (typeof window.AOS !== 'undefined') {
        window.AOS.init({
            duration: 800,
            once: true,
            disable: window.isSlowConnection
        });
    }
});
