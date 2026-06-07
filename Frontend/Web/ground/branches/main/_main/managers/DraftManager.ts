import { StorageManager } from './draft/StorageManager';
import { DraftEventHandler } from './draft/DraftEventHandler';

export class DraftManager {
    private static eventHandler: DraftEventHandler | null = null;

    public static initDraftManagement(container: HTMLElement): void {
        this.eventHandler = new DraftEventHandler(container, (value: string) => {
            StorageManager.save(value);
        });

        // Восстановление draft при инициализации
        const savedDraft = StorageManager.restore();
        if (savedDraft) {
            const input = container.querySelector('#jsonInput') as HTMLTextAreaElement;
            if (input) {
                input.value = savedDraft;
            }
        }
    }

    public static saveDraft(data: string): void {
        StorageManager.save(data);
    }
    
    public static restoreDraft(): string | null {
        return StorageManager.restore();
    }
    
    public static clearDraft(): void {
        StorageManager.clear();
    }

    public static destroy(): void {
        if (this.eventHandler) {
            this.eventHandler.destroy();
            this.eventHandler = null;
        }
    }
}
