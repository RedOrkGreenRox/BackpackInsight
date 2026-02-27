export class ScreenshotManager {
    private container: HTMLElement;
    private cleanupFns: (() => void)[] = [];
    private t: (key: string) => string;

    constructor(container: HTMLElement, t: (key: string) => string) {
        this.container = container;
        this.t = t;
    }

    public init(): void {
        const saveBtn = this.container.querySelector('#saveProfileBtn');
        if (saveBtn) {
            const handler = () => this.takeScreenshot();
            saveBtn.addEventListener('click', handler);
            this.cleanupFns.push(() => saveBtn.removeEventListener('click', handler));
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

        try {
            // Динамический импорт html2canvas
            // @ts-ignore
            const html2canvas = (await import('html2canvas')).default;
            
            // Временно применяем стили для стандартного вида
            const originalStyles = element.style.cssText;
            element.style.cssText = `
                width: 900px !important;
                height: 600px !important;
                max-width: 900px !important;
                max-height: 600px !important;
                transform: scale(1) !important;
                position: relative !important;
                overflow: hidden !important;
            `;
            
            const canvas = await html2canvas(element, {
                useCORS: true,
                allowTaint: true,
                scale: 2,  // Для качества
                backgroundColor: null,
                width: 900,  // Фиксированная ширина
                height: 600,  // Фиксированная высота
                windowWidth: 1800,
                windowHeight: 1100
            });
            
            // Восстанавливаем оригинальные стили
            element.style.cssText = originalStyles;
            
            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.download = `profile-screenshot-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            btn.innerText = originalText;
            btn.style.opacity = "1";
            btn.disabled = false;
            
            console.log('Screenshot saved successfully');
        } catch (error) {
            console.error('Screenshot failed:', error);
            
            btn.innerText = this.t('screenshot_error');
            btn.style.opacity = "1";
            btn.disabled = false;
            
            // Показываем уведомление об ошибке
            this.showErrorNotification('Не удалось сделать скриншот. Попробуйте еще раз.');
        }
    }

    private showErrorNotification(message: string): void {
        // Создаем временное уведомление об ошибке
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
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Автоматически удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    public destroy(): void {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}
