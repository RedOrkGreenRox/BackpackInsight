import { ApiService } from '@utils/ApiService';
import { LoadingStates } from '@utils/LoadingStates';
import { ProfileCacheUtils } from '@roots/profileCacheUtils';
import { Gen } from '@roots/Gen';
import { StorageManager } from '../draft/StorageManager';
import { ValidationManager } from '../ValidationManager';

export class SubmitManager {
    private readonly container: HTMLElement;
    private readonly t: (key: string) => string;

    constructor(container: HTMLElement, t: (key: string) => string) {
        this.container = container;
        this.t = t;
    }

    public async handleSubmit(jsonText: string): Promise<void> {
        const errorElement = this.container?.querySelector('#errorContainer') as HTMLElement;
        const submitBtn = this.container?.querySelector('#submitBtn') as HTMLButtonElement;

        if (!ValidationManager.validateAndShowError(jsonText, errorElement, this.t)) return;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = LoadingStates.createSpinner('small') + ' ' + this.t('profile_loading_button');
        }

        try {
            ProfileCacheUtils.clearAllProfileCache();
            const data = await ApiService.getProfile(JSON.parse(jsonText));
            StorageManager.clear(); // очищаем черновик напрямую через StorageManager
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
