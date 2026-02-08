document.addEventListener('DOMContentLoaded', function () {
    // Use event delegation for better performance and dynamic content support
    const grid = document.querySelector('.main-heroes-grid');
    if (grid) {
        grid.addEventListener('click', function (e) {
            const btn = e.target.closest('.skin-btn');
            if (!btn) return;

            // Determine direction based on class
            let direction = 0;
            if (btn.classList.contains('prev-skin')) {
                direction = -1;
            } else if (btn.classList.contains('next-skin')) {
                direction = 1;
            }

            if (direction !== 0) {
                changeSkin(btn, direction);
            }
        });
    }
});

// Make changeSkin globally available
window.changeSkin = function(btn, direction) {
    const card = btn.closest('.main-hero-card');
    if (!card) return;

    const heroName = card.dataset.heroName;
    let currentSkin = card.dataset.currentSkin;

    const skinsDataElement = document.getElementById('skins-data');
    if (!skinsDataElement) return;

    let profileSkins = {};
    try {
        profileSkins = JSON.parse(skinsDataElement.textContent) || {};
    } catch (e) {
        console.error("Error parsing skins data", e);
        profileSkins = {};
    }

    // Формируем массив скинов, приводя все к строкам с ведущим нулем
    let heroSkins = ['01'];
    if (profileSkins && Array.isArray(profileSkins[heroName])) {
        const extraSkins = profileSkins[heroName]
            .filter(s => s !== null && s !== undefined)
            .map(s => String(s).padStart(2, '0'));
        heroSkins = heroSkins.concat(extraSkins);
    }
    heroSkins = [...new Set(heroSkins)].sort(); // Убираем дубликаты и сортируем

    let currentIndex = heroSkins.indexOf(currentSkin);
    // Если текущий скин не найден (например, из-за формата), пробуем найти "01" или берем первый
    if (currentIndex === -1) {
        currentIndex = heroSkins.indexOf('01');
        if (currentIndex === -1) currentIndex = 0;
    }

    let newIndex = currentIndex + direction;

    if (newIndex >= heroSkins.length) {
        newIndex = 0;
    } else if (newIndex < 0) {
        newIndex = heroSkins.length - 1;
    }

    const newSkin = heroSkins[newIndex];
    card.dataset.currentSkin = newSkin;

    // Анимация для карточки героя
    const mainImageContainer = card.querySelector('.main-hero-image');
    if (mainImageContainer) {
        mainImageContainer.classList.add('changing-skin');
        setTimeout(() => {
            updateHeroImage(mainImageContainer.querySelector('picture'), heroName, newSkin);
            mainImageContainer.classList.remove('changing-skin');
        }, 200); // Должно совпадать с transition в CSS
    }

    // Анимация для шапки профиля
    const headerCard = document.querySelector(`.stat-hero-card[data-hero-name="${heroName}"]`);
    if (headerCard) {
        headerCard.classList.add('changing-skin');
        setTimeout(() => {
            updateHeroImage(headerCard.querySelector('picture'), heroName, newSkin);
            headerCard.classList.remove('changing-skin');
        }, 200);
    }
}

function updateHeroImage(picture, heroName, skinNum) {
    if (!picture) return;

    const sources = picture.querySelectorAll('source');
    const img = picture.querySelector('img');

    // Check for undefined or null skinNum to prevent 404s
    if (skinNum === undefined || skinNum === null || skinNum === "undefined") {
        console.error(`Invalid skin number for ${heroName}: ${skinNum}`);
        return;
    }

    // Убедимся, что skinNum это строка с ведущим нулем (на всякий случай)
    const formattedSkinNum = String(skinNum).padStart(2, '0');

    if (sources.length >= 2) {
        sources[0].srcset = `/static/images/heroes/${heroName}/avif/${heroName}${formattedSkinNum}.avif`;
        sources[1].srcset = `/static/images/heroes/${heroName}/webp/${heroName}${formattedSkinNum}.webp`;
    }

    if (img) {
        img.src = `/static/images/heroes/${heroName}/webp/${heroName}${formattedSkinNum}.webp`;
    }
}
