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
