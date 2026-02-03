function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 2. Основная инициализация
document.addEventListener('DOMContentLoaded', () => {
    // МГНОВЕННО показываем body, чтобы не было белого экрана на 3G
    document.body.classList.add('loaded');
    window.scrollTo(0, 0);

    // 1. Обработка текстовых элементов и кнопок (показываем сразу)
    const instantElements = document.querySelectorAll('span, h4, button, .button-view-profile, .main-title');
    instantElements.forEach(el => el.classList.add('loaded'));

    // 2. УМНАЯ ЗАГРУЗКА ИКОНОК САЙДБАРА
    // Если интернет ХОРОШИЙ, грузим иконки меню сразу, не дожидаясь клика
    if (!window.isSlowConnection) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            const lazyIcons = sidebar.querySelectorAll('img[data-src]');
            lazyIcons.forEach(img => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                img.classList.add('loaded'); // Показываем сразу
            });
        }
    }

    // 3. Обработка остальных изображений
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Пропускаем иконки сайдбара, если у них все еще есть data-src (значит, мы на 3G и загрузим их позже)
        if (img.closest('#sidebar') && img.hasAttribute('data-src')) return;

        // ОПТИМИЗАЦИЯ: Не ставим lazy на критически важные картинки (лого и фон)
        const isCritical = img.id === 'bgImg' || img.classList.contains('logo-icon');

        if (!isCritical && !img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }

        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => img.classList.add('loaded'));
            img.addEventListener('error', () => img.classList.add('loaded'));
        }
    });

    // Инициализация табов меню
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-tab').forEach(tab => {
        const onclickAttr = tab.getAttribute('onclick');
        if (onclickAttr && (onclickAttr.includes(`'${currentPath}'`) || onclickAttr.includes(`"${currentPath}"`))) {
            tab.classList.add('active');
        }
    });

    // Инициализация AOS (анимации появятся, когда AOS.js докачается)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            disable: 'mobile' // На 3G/мобилках лучше без лишних анимаций
        });
    }

    // --- ЛОГИКА СКАЧИВАНИЯ ПРОФИЛЯ ---
    const downloadBtn = document.querySelector('.button-download-profile button');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const btn = this;

            // Функция, которая выполняет саму работу
            const executeScreenshot = async () => {
                // ИЗМЕНЕНИЕ: Захватываем СТРОГО карточку профиля (.profile-header)
                const targetElement = document.querySelector('.profile-header');
                const bgImageDiv = document.querySelector('.background-image');

                if (!targetElement) return;

                // 1. Подготовка интерфейса
                btn.style.opacity = '0'; // Прячем кнопку (хотя она внутри, но на всякий случай)

                // Прячем глобальный фон-картинку (слой с AreaXX.webp)
                if (bgImageDiv) bgImageDiv.style.visibility = 'hidden';

                // 2. Делаем подложку страницы прозрачной
                const originalBodyBg = document.body.style.background;
                const originalHtmlBg = document.documentElement.style.background;
                document.body.style.background = 'transparent';
                document.documentElement.style.background = 'transparent';

                try {
                    // 3. Создаем скриншот ТОЛЬКО ЭЛЕМЕНТА .profile-header
                    const canvas = await html2canvas(targetElement, {
                        backgroundColor: null,      // Прозрачный фон (для скругленных углов)
                        scale: 2,                   // Высокое качество (Retina)
                        logging: false,
                        useCORS: true
                    });

                    // 4. Скачиваем
                    const link = document.createElement('a');
                    link.download = `Profile_${new Date().getTime()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();

                } catch (err) {
                    console.error('Ошибка при создании скриншота:', err);
                    alert('Не удалось сохранить изображение.');
                } finally {
                    // 5. ВОССТАНОВЛЕНИЕ (Обязательно возвращаем всё назад)
                    btn.style.opacity = '1';
                    if (bgImageDiv) bgImageDiv.style.visibility = 'visible';
                    document.body.style.background = originalBodyBg;
                    document.documentElement.style.background = originalHtmlBg;
                }
            };

            // ПРОВЕРКА: Загружена ли библиотека?
            if (typeof html2canvas === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

                script.onload = () => {
                    executeScreenshot();
                };

                script.onerror = () => {
                    alert('Ошибка: не удалось загрузить библиотеку для скриншотов.');
                };

                document.head.appendChild(script);
            } else {
                executeScreenshot();
            }
        });
    }
});

// 3. Параллакс фона (ИСПРАВЛЕННЫЙ: без рывков)
// Переменные для хранения начальной позиции мыши
let initialX = null;
let initialY = null;

const handleParallax = (e) => {
    const img = document.getElementById('bgImg');
    if (!img) return;

    // При первом движении мыши запоминаем координаты как "нулевую точку"
    if (initialX === null) {
        initialX = e.clientX;
        initialY = e.clientY;
        return; // Не двигаем фон в самый первый кадр, чтобы избежать рывка
    }

    const rect = img.closest('.background-image').getBoundingClientRect();

    // Считаем смещение относительно СТАРТОВОЙ точки, а не центра экрана
    const intensivity = 1.5;

    // Формула смещения от начальной точки
    const moveX = -((e.clientX - initialX) / rect.width) * 100 * (intensivity / 50);
    const moveY = -((e.clientY - initialY) / rect.height) * 100 * (intensivity / 50);

    // Применяем transform, сохраняя изначальный scale(1.1) из CSS
    img.style.transform = `translate(-50%, -50%) translate(${moveX}%, ${moveY}%) scale(1.1)`;
};

document.addEventListener('mousemove', throttle(handleParallax, 20));

/**
 * Сайдбар
 */
/**
 * Сайдбар
 */
function toggleSidebar() {
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (sidebar) {
        const pendingIcons = sidebar.querySelectorAll('img[data-src]');
        if (pendingIcons.length > 0) {
            pendingIcons.forEach(img => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                if (img.complete) {
                    img.classList.add('loaded');
                } else {
                    img.onload = () => img.classList.add('loaded');
                }
            });
        }
    }

    body.classList.toggle('sidebar-open');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
}

/**
 * Переход между страницами
 */
function goTo(url) {
    const isMobile = window.innerWidth <= 768;
    const delay = isMobile ? 100 : 250; // Уменьшили задержку для скорости

    document.body.classList.add('leaving');

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    setTimeout(() => {
        window.location.href = url;
    }, delay);
}

// Восстановление после кнопки "Назад"
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.body.classList.remove('leaving', 'sidebar-open');
        document.body.classList.add('loaded');
    }
});