import { t } from '../localization/i18n';

/**
 * Утилиты для состояний загрузки
 */
export class LoadingStates {
    /**
     * Показывает skeleton экран для карточек
     */
    public static createCardSkeleton(count: number = 6): string {
        return Array(count).fill(0).map(() => `
            <div class="skeleton-card" data-aos="fade-up">
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-meta">
                        <div class="skeleton-badge"></div>
                        <div class="skeleton-badge"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Показывает skeleton для профиля
     */
    public static createProfileSkeleton(): string {
        return `
            <div class="skeleton-profile">
                <div class="skeleton-header">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-info">
                        <div class="skeleton-name"></div>
                        <div class="skeleton-level"></div>
                    </div>
                </div>
                <div class="skeleton-stats">
                    <div class="skeleton-stat"></div>
                    <div class="skeleton-stat"></div>
                    <div class="skeleton-stat"></div>
                </div>
            </div>
        `;
    }

    /**
     * Показывает индикатор прогресса
     */
    public static createProgressBar(label: string, progress: number = 0): string {
        return `
            <div class="progress-container">
                <div class="progress-label">${label}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${Math.round(progress)}%</div>
            </div>
        `;
    }

    /**
     * Показывает спиннер загрузки
     */
    public static createSpinner(size: 'small' | 'medium' | 'large' = 'medium'): string {
        return `
            <div class="spinner spinner-${size}">
                <div class="spinner-circle"></div>
            </div>
        `;
    }

    /**
     * Показывает состояние загрузки страницы
     */
    public static showPageLoading(container: HTMLElement): void {
        container.innerHTML = `
            <div class="page-loading">
                ${this.createSpinner('large')}
                <div class="loading-text">${t('loading_text')}</div>
            </div>
        `;
    }

    /**
     * Обновляет прогресс бар
     */
    public static updateProgress(selector: string, progress: number): void {
        const fill = document.querySelector(`${selector} .progress-fill`) as HTMLElement;
        const text = document.querySelector(`${selector} .progress-text`) as HTMLElement;
        
        if (fill) fill.style.width = `${progress}%`;
        if (text) text.textContent = `${Math.round(progress)}%`;
    }
}
