// 2. Основная инициализация

// Глобальная функция для обработки ошибок загрузки изображений
window.handleImageError = function(img: HTMLImageElement) {
    // 1. Находим родительский элемент <picture>
    const picture = img.closest('picture');
    if (picture) {
        // 2. Удаляем все <source>, чтобы они не мешали плейсхолдеру
        const sources = picture.querySelectorAll('source');
        sources.forEach(source => source.remove());
    }
    // 3. Устанавливаем плейсхолдер (лучше в формате .png или .jpg для 100% совместимости)
    img.src = '/static/images/placeholder/placeholder.webp';
    img.onerror = null; // Предотвращаем бесконечный цикл
};

document.addEventListener('DOMContentLoaded', () => {
    // МГНОВЕННО показываем body, чтобы не было белого экрана на 3G
    document.body.classList.add('loaded');

    // 1. Обработка текстовых элементов и кнопок (показываем сразу)
    const instantElements = document.querySelectorAll('span, h4, button, .button-view-profile, .main-title');
    instantElements.forEach(el => el.classList.add('loaded'));

    // 2. Обработка изображений
    const images = document.querySelectorAll('img');
    images.forEach(img => {
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
});