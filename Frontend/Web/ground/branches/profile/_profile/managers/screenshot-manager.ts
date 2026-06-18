import { toPng } from 'html-to-image';

export class ScreenshotManager {
    private readonly container: HTMLElement;
    private cleanupFns: (() => void)[] = [];
    private readonly t: (key: string) => string;

    constructor(container: HTMLElement, t: (key: string) => string) {
        this.container = container;
        this.t = t;
    }

    public init(): void {
        const saveBtn = this.container.querySelector('#saveProfileBtn');
        if (saveBtn) {
            const handler = () => this.takeScreenshot();
            saveBtn.addEventListener('click', handler);
            this.cleanupFns.push(
                () => saveBtn.removeEventListener('click', handler)
            );
        }
    }

    private async takeScreenshot(): Promise<void> {
        const element = this.container?.querySelector('.profile-header') as HTMLElement;
        if (!element) return;

        const btn = this.container?.querySelector('#saveProfileBtn') as HTMLButtonElement;
        if (!btn) return;

        const originalText = btn.innerText;
        btn.innerText = this.t('screenshot_saving');
        btn.style.opacity = "0.7";
        btn.disabled = true;

        // Создаем временный клон элемента вне экрана для предотвращения любых конфликтов с живым DOM
        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.cssText = `
            position: fixed !important;
            left: -9999px !important;
            top: -9999px !important;
            width: 900px !important;
            height: 600px !important;
            max-width: 900px !important;
            max-height: 600px !important;
            transform: scale(1) !important;
            overflow: hidden !important;
            background: #121212 !important;
            box-sizing: border-box !important;
            z-index: -9999 !important;
        `;
        document.body.appendChild(clone);

        try {
            const baseUrl = window.location.origin;

            // 1. Превращаем все <picture> в простые <img> внутри клона
            const pictures = clone.querySelectorAll('picture');
            pictures.forEach(pic => {
                const img = pic.querySelector('img');
                const parent = pic.parentElement;
                if (img && parent) {
                    const originalImgClass = img.getAttribute('class');

                    // Резолвим src в абсолютный URL
                    const src = img.getAttribute('src');
                    if (src && src.startsWith('/')) {
                        img.setAttribute('src', baseUrl + src);
                    }

                    // Переносим CSS-классы с <picture> на <img>
                    const picClasses = pic.getAttribute('class');
                    if (picClasses) {
                        img.setAttribute('class', ((originalImgClass || '') + ' ' + picClasses).trim());
                    }

                    // Заменяем в клоне
                    parent.replaceChild(img, pic);
                }
            });

            // 2. Резолвим любые другие одиночные картинки в клоне
            const singleImages = clone.querySelectorAll('img');
            singleImages.forEach(img => {
                const src = img.getAttribute('src');
                if (src && src.startsWith('/')) {
                    img.setAttribute('src', baseUrl + src);
                }
            });

            // Ждем 100мс перед рендером, чтобы браузер успел просчитать стили клона
            await new Promise(resolve => setTimeout(resolve, 100));

            // Генерируем PNG изображение с клонированного элемента
            const dataUrl = await toPng(clone, {
                backgroundColor: '#121212',
                width: 900,
                height: 600,
                style: {
                    transform: 'scale(1)',
                    left: '0',
                    top: '0'
                }
            });

            // Удаляем временный клон из DOM
            clone.remove();

            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.download = `profile-screenshot-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            link.remove();

            btn.innerText = originalText;
            btn.style.opacity = "1";
            btn.disabled = false;

        } catch (error) {
            console.error('Screenshot failed:', error);
            
            // Защитная очистка клона при ошибке
            clone.remove();

            btn.innerText = this.t('screenshot_error');
            btn.style.opacity = "1";
            btn.disabled = false;

            this.showErrorNotification('Не удалось сделать скриншот. Попробуйте еще раз.');
        }
    }

    private showErrorNotification(message: string): void {
        const notification = document.createElement('div');
        notification.className = 'screenshot-error';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    public destroy(): void {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}
