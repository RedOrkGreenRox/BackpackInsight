// Логика "Показать еще" для предметов
document.addEventListener('DOMContentLoaded', function () {
    const loadMoreBtn = document.getElementById('loadMoreItemsBtn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', function () {
        const grid = document.getElementById('profileItemsGrid');
        const hiddenItems = grid.querySelectorAll('.item-card.hidden');
        const itemsToShow = 120; // Сколько предметов открываем за раз

        hiddenItems.forEach((item, index) => {
            if (index < itemsToShow) {
                // 1. Ставим "подготовительный" класс (прозрачность 0)
                item.classList.add('preparing');

                // 2. Убираем display: none
                item.classList.remove('hidden');

                // 3. Запускаем анимацию с задержкой для каждого следующего элемента
                setTimeout(() => {
                    item.classList.remove('preparing');

                    // Активируем AOS, если он используется
                    item.classList.add('aos-animate');

                    // Принудительно ставим финальные стили на случай конфликтов
                    item.style.opacity = "1";
                    item.style.transform = "translateY(0) scale(1)";
                }, index * 80); // Шаг "лесенки" — 80мс
            }
        });

        // Прячем кнопку, если скрытых карточек больше не осталось
        const remainingHidden = grid.querySelectorAll('.item-card.hidden').length;
        if (remainingHidden === 0) {
            loadMoreBtn.parentElement.style.display = 'none';
        }

        // Обновляем позиции AOS после завершения всех анимаций
        setTimeout(() => {
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        }, itemsToShow * 80 + 600);
    });
});
