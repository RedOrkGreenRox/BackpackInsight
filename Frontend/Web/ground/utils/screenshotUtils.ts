// @ts-ignore
import html2canvas from 'html2canvas';

export async function downloadProfileScreenshot(target: HTMLElement, btn: HTMLButtonElement, nickname: string = 'Player'): Promise<void> {
    const originalText = btn.innerText;
    btn.innerText = "⌛ СОХРАНЕНИЕ...";
    btn.style.opacity = "0.7";
    btn.disabled = true;

    try {
        const icons = target.querySelectorAll('.main-heroes-grid__image img') as NodeListOf<HTMLElement>;
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

        const isMobile = window.innerWidth < 768;
        const scaleFactor = isMobile ? 2 : 3;

        const canvas = await html2canvas(target, {
            useCORS: true,
            allowTaint: true,
            scale: scaleFactor,
            backgroundColor: null,
            logging: false,
            scrollY: -window.scrollY,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight
        });

        originalStyles.forEach(style => {
            style.el.style.width = style.width;
            style.el.style.height = style.height;
        });

        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = `Profile_${nickname}.png`;
        link.click();

    } catch (err) {
        console.error("Screenshot Error:", err);
        btn.innerText = "❌ ОШИБКА";
        setTimeout(() => {
            btn.innerText = originalText;
        }, 3000);
    } finally {
        btn.innerText = originalText;
        btn.style.opacity = "1";
        btn.disabled = false;
    }
}