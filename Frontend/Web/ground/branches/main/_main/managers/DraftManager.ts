import { StorageManager } from './draft/StorageManager';
import { DraftEventHandler } from './draft/DraftEventHandler';

export class DraftManager {
    private eventHandler: DraftEventHandler | null = null;

    public initDraftManagement(container: HTMLElement): void {
        // Уничтожаем предыдущий обработчик перед созданием нового,
        // чтобы не накапливать слушатели при повторной инициализации.
        this.destroy();

        this.eventHandler = new DraftEventHandler(container, (value: string) => {
            StorageManager.save(value);
        });

        // Восстановление draft при инициализации
        const savedDraft = StorageManager.restore();
        if (savedDraft) {
            const input = container.querySelector('#jsonInput') as HTMLTextAreaElement;
            if (input) input.value = savedDraft;
        }
    }

    public saveDraft(data: string): void {
        StorageManager.save(data);
    }

    public restoreDraft(): string | null {
        return StorageManager.restore();
    }

    public clearDraft(): void {
        StorageManager.clear();
    }

    public destroy(): void {
        this.eventHandler?.destroy();
        this.eventHandler = null;
    }
}
