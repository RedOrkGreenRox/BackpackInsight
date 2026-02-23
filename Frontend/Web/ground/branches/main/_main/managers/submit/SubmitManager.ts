import { ApiService } from '@utils/ApiService';
import { LoadingStates } from '@utils/LoadingStates';
import { ProfileCacheUtils } from '@utils/profileCacheUtils';
import { Gen } from '@roots/Gen';
import { DraftManager } from '../DraftManager';
import { ValidationManager } from '../ValidationManager';

export class SubmitManager {
    private container: HTMLElement;
    private t: (key: string) => string;

    constructor(container: HTMLElement, t: (key: string) => string) {
        this.container = container;
        this.t = t;
    }

    public async handleSubmit(jsonText: string): Promise<void> {
        const errorElement = this.container?.querySelector('#errorContainer') as HTMLElement;
        const submitBtn = this.container?.querySelector('#submitBtn') as HTMLButtonElement;
        
        // Валидация
        if (!ValidationManager.validateAndShowError(jsonText, errorElement, this.t)) {
            return;
        }
        
        // Показ загрузки
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = LoadingStates.createSpinner('small') + ' ' + this.t('profile_loading_button');
        }
        
        try {
            // Очистка кэша и отправка
            ProfileCacheUtils.clearAllProfileCache();
            console.log('[SubmitManager] Profile cache cleared before loading new data');
            
            const data = await ApiService.getProfile(JSON.parse(jsonText));
            
            // Очистка draft и навигация
            DraftManager.clearDraft();
            Gen.getInstance().navigate('/profile', data);
            
        } catch (e) {
            console.error('Submit error:', e);
            ValidationManager.showError(errorElement, this.t('error_server_unavailable'));
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = this.t('profile_view_button');
            }
        }
    }
}
