window.handleImageError = function(img) {
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

document.addEventListener('DOMContentLoaded', function () {
    const title = document.querySelector('.section-title');
    if (title) {
        title.classList.add('loaded');
    }
});
