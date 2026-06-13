/**
 * Утилиты для управления кэшем профиля
 */

export class ProfileCacheUtils {
    /**
     * Полностью очищает все данные связанные с профилем из всех хранилищ
     */
    public static clearAllProfileCache(): void {
        try {
            // Очистка sessionStorage
            sessionStorage.removeItem('currentProfileData');
            sessionStorage.removeItem('profileDynamicState');
            sessionStorage.removeItem('profileItemsList');
            
            // Очистка localStorage
            localStorage.removeItem('profileDynamicState');
            
        } catch (error) {
            console.error('[ProfileCacheUtils] Error clearing profile cache:', error);
        }
    }

    /**
     * Проверяет есть ли закэшированные данные профиля
     */
    public static hasProfileCache(): boolean {
        return !!(sessionStorage.getItem('currentProfileData') || 
                  sessionStorage.getItem('profileDynamicState') ||
                  localStorage.getItem('profileDynamicState'));
    }

    /**
     * Очищает кэш только при явном переходе на /profile без данных профиля,
     * и только если это НЕ возврат назад (popstate).
     *
     * Три сценария перехода на /profile:
     *  1. Форма отправлена → state содержит nickname/level → кэш НЕ сбрасываем (свежие данные).
     *  2. Возврат кнопкой «Назад» из /profile/item/:name → state содержит только scrollY →
     *     это возврат назад, кэш профиля живой, НЕ сбрасываем.
     *  3. Переход по ссылке из сайдбара (navigate()) → state пустой или только scrollY →
     *     здесь тоже нельзя сбрасывать, иначе пользователь теряет профиль.
     *
     * Вывод: сбрасывать кэш нужно только тогда, когда в sessionStorage вообще нет
     * currentProfileData — то есть профиль ещё ни разу не загружался.
     */
    public static clearCacheOnNavigation(state?: any): void {
        // Если в state пришли свежие данные профиля (из формы) — просто выходим,
        // кэш обновится сам в getHtml.
        if (state?.nickname || state?.level) {
            return;
        }

        // Если в sessionStorage есть данные профиля — это возврат назад или
        // SPA-навигация внутри сайта. Кэш трогать не нужно.
        const cached = sessionStorage.getItem('currentProfileData');
        if (cached) {
            return;
        }

        // Профиля нет ни в state, ни в кэше — можно почистить остатки.
        this.clearAllProfileCache();
    }
}
