/// <reference path="../../../../types/global.d.ts" />

// Логика "Показать еще" для предметов
document.addEventListener('DOMContentLoaded', function () {
    const loadMoreBtn = document.getElementById('loadMoreItemsBtn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', function () {
        const grid = document.getElementById('profileItemsGrid');
        if (!grid) return;
        
        const hiddenItems = grid.querySelectorAll('.item-card.hidden') as NodeListOf<HTMLElement>;
        const itemsToShow = 120; // Сколько предметов открываем за раз

        // Используем requestAnimationFrame для группировки изменений DOM
        requestAnimationFrame(() => {
            hiddenItems.forEach((item, index) => {
                if (index < itemsToShow) {
                    // 1. Ставим "подготовительный" класс (прозрачность 0)
                    item.classList.add('preparing');

                    // 2. Убираем display: none
                    item.classList.remove('hidden');

                    // 3. Запускаем анимацию с задержкой для каждого следующего элемента
                    // Используем CSS transition вместо JS-таймеров для производительности
                    // Но для "лесенки" (stagger) все равно нужна задержка
                    setTimeout(() => {
                        item.classList.remove('preparing');

                        // Активируем AOS, если он используется
                        item.classList.add('aos-animate');

                        // Принудительно ставим финальные стили на случай конфликтов
                        item.style.opacity = "1";
                        item.style.transform = "translateY(0) scale(1)";
                    }, index * 30); // Уменьшили шаг до 30мс для более быстрой реакции
                }
            });
        });

        // Прячем кнопку, если скрытых карточек больше не осталось
        const remainingHidden = grid.querySelectorAll('.item-card.hidden').length;
        if (remainingHidden === 0) {
            const parent = loadMoreBtn.parentElement;
            if (parent) parent.style.display = 'none';
        }

        // Обновляем позиции AOS после завершения всех анимаций
        setTimeout(() => {
            if (typeof window.AOS !== 'undefined') {
                window.AOS.refresh();
            }
        }, itemsToShow * 30 + 300);
    });
});