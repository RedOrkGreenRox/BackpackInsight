// @ts-ignore
import html2canvas from 'html2canvas';
import { t } from '../localization/i18n';

/**
 * Утилита для создания скриншота профиля
 * @param {HTMLElement} target - Элемент для захвата (.profile-header)
 * @param {HTMLElement} btn - Кнопка управления для индикации статуса
 * @param {string} nickname - Никнейм игрока для имени файла
 */
export async function downloadProfileScreenshot(target: HTMLElement, btn: HTMLButtonElement, nickname: string = 'Player'): Promise<void> {
    if (!target || !btn) return;

    const originalText = btn.innerText;
    btn.innerText = t('screenshot_saving');
    btn.style.opacity = "0.7";
    btn.disabled = true;

    try {
        const canvas = await html2canvas(target, {
            useCORS: true,
            allowTaint: true,
            scale: 2,
            backgroundColor: null,
            width: 1200,  // Фиксированная ширина как на ноутбуках
            height: 800,  // Фиксированная высота как на ноутбуках
            windowWidth: 1800,
            windowHeight: 1100
        });

        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = `Profile_${nickname}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        btn.innerText = originalText;
        btn.style.opacity = "1";
        btn.disabled = false;
    } catch (err) {
        console.error("Ошибка захвата:", err);
        btn.innerText = t('screenshot_error');
        btn.style.opacity = "1";
        btn.disabled = false;
    }
}