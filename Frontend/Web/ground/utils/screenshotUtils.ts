// @ts-ignore
import html2canvas from 'html2canvas';

export async function downloadProfileScreenshot(target: HTMLElement, btn: HTMLButtonElement, nickname: string = 'Player'): Promise<void> {
    const originalText = btn.innerText;
    btn.innerText = "⌛ СОХРАНЕНИЕ...";
    btn.style.opacity = "0.7";
    btn.disabled = true;

    const DESKTOP_WIDTH = 1200;

    try {
        // 1. Сначала фиксируем размеры на ОРИГИНАЛЕ (на мгновение)
        const originalIcons = target.querySelectorAll('.main-heroes-grid__image img') as NodeListOf<HTMLImageElement>;
        const sizeMap = new Map<number, { w: number, h: number }>();
        
        originalIcons.forEach((img, index) => {
            const rect = img.getBoundingClientRect();
            sizeMap.set(index, { w: rect.width, h: rect.height });
        });

        // 2. Создаем клон
        const clone = target.cloneNode(true) as HTMLElement;
        
        Object.assign(clone.style, {
            position: 'fixed',
            left: '0',
            top: '-10000px', // Уводим далеко вверх
            width: `${DESKTOP_WIDTH}px`,
            minWidth: `${DESKTOP_WIDTH}px`,
            zIndex: '-9999',
            display: 'block'
        });

        // 3. Применяем зафиксированные размеры к иконкам в клоне
        const clonedIcons = clone.querySelectorAll('.main-heroes-grid__image img') as NodeListOf<HTMLImageElement>;
        clonedIcons.forEach((img, index) => {
            const size = sizeMap.get(index);
            if (size && size.w > 0) {
                img.style.setProperty('width', `${size.w}px`, 'important');
                img.style.setProperty('height', `${size.h}px`, 'important');
                img.style.setProperty('min-width', `${size.w}px`, 'important');
                img.style.setProperty('flex', 'none', 'important');
                img.style.objectFit = 'contain';
            }
        });

        document.body.appendChild(clone);

        // Ждем загрузки картинок
        const imagePromises = Array.from(clone.querySelectorAll('img')).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        });
        await Promise.all(imagePromises);
        
        // Небольшая пауза для рендеринга стилей в DOM
        await new Promise(r => setTimeout(r, 150));

        // 4. Скриншот
        const canvas = await html2canvas(clone, {
            useCORS: true,
            allowTaint: true,
            scale: 2,
            backgroundColor: "#11121d",
            width: DESKTOP_WIDTH,
            windowWidth: DESKTOP_WIDTH,
            onclone: (clonedDoc) => {
                // Дополнительная проверка внутри процесса html2canvas
                const el = clonedDoc.body.querySelector('[style*="left: -9999px"]') as HTMLElement;
                if (el) el.style.left = '0';
            }
        });

        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png", 1.0);
        link.download = `Profile_${nickname}.png`;
        link.click();

        document.body.removeChild(clone);

    } catch (err) {
        console.error("Screenshot Error:", err);
        btn.innerText = "❌ ОШИБКА";
        setTimeout(() => { btn.innerText = originalText; }, 3000);
    } finally {
        btn.innerText = originalText;
        btn.style.opacity = "1";
        btn.disabled = false;
    }
}