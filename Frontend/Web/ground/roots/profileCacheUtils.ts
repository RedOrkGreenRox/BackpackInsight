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
     * Очищает кэш только если переход не из обработки формы
     * Проверяет наличие данных профиля в параметрах навигации (history.state)
     */
    public static clearCacheOnNavigation(state?: any): void {
        // Если в state есть данные профиля (nickname), значит переход из формы
        // Если данных нет, значит это переход по ссылке/кнопке - очищаем кэш
        const hasProfileData = state?.nickname || state?.level;
        
        if (!hasProfileData) {
            this.clearAllProfileCache();
        }
    }
}
