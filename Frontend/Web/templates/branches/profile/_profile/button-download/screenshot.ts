document.addEventListener('DOMContentLoaded', function () {
    const btn = document.querySelector('.button-download-profile button') as HTMLElement;
    if (!btn) return;

    btn.onclick = async function () {
        const target = document.querySelector('.profile-header') as HTMLElement;
        if (!target) return;

        // Находим все иконки персонажей
        const icons = target.querySelectorAll('.main-heroes-grid__image img') as NodeListOf<HTMLElement>;
        const originalText = btn.innerText;
        btn.innerText = "⌛ СОХРАНЕНИЕ...";
        btn.style.opacity = "0.7";

        try {
            // Фиксируем размеры в px, чтобы избежать сужения
            const originalStyles: { el: HTMLElement, width: string, height: string }[] = [];
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

            // Определяем масштаб в зависимости от устройства
            // На мобильных устройствах (ширина < 768px) используем scale: 2 для экономии памяти
            // На десктопах можно оставить scale: 3 для качества
            const isMobile = window.innerWidth < 768;
            const scaleFactor = isMobile ? 2 : 3;

            const canvas = await html2canvas(target, {
                useCORS: true,
                allowTaint: true,
                scale: scaleFactor,
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
            const nickname = (target.querySelector('h4') as HTMLElement)?.innerText.trim() || 'Player';
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