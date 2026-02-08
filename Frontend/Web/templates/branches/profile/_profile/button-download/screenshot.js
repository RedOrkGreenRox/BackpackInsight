document.addEventListener('DOMContentLoaded', function () {
    const btn = document.querySelector('.button-download-profile button');
    if (!btn) return;

    btn.onclick = async function () {
        const target = document.querySelector('.profile-header');
        if (!target) return;

        // Находим все иконки персонажей
        const icons = target.querySelectorAll('.main-heroes-grid__image img');
        const originalText = btn.innerText;
        btn.innerText = "⌛ СОХРАНЕНИЕ...";
        btn.style.opacity = "0.7";

        try {
            // Фиксируем размеры в px, чтобы избежать сужения
            const originalStyles = [];
            icons.forEach(img => {
                originalStyles.push({
                    el: img,
                    width: img.style.width,
                    height: img.style.height
                });
                img.style.width = img.offsetWidth + 'px';
                img.style.height = img.offsetHeight + 'px';
            });

            const { default: html2canvas } = await import('html2canvas');

            const canvas = await html2canvas(target, {
                useCORS: true,
                allowTaint: true,
                scale: 3, // Увеличиваем до 3 для еще большей четкости
                backgroundColor: null,
                logging: false,
                // Важно для корректного захвата при прокрутке
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight
            });

            // Возвращаем стили назад
            originalStyles.forEach(style => {
                style.el.style.width = style.width;
                style.el.style.height = style.height;
            });

            const link = document.createElement('a');
            link.href = canvas.toDataURL("image/png");
            const nickname = target.querySelector('h4')?.innerText.trim() || 'Player';
            link.download = `Profile_${nickname}.png`;
            link.click();

            btn.innerText = originalText;
            btn.style.opacity = "1";

        } catch (err) {
            console.error("Ошибка:", err);
            btn.innerText = "❌ ОШИБКА";
            btn.style.opacity = "1";
        }
    };
});