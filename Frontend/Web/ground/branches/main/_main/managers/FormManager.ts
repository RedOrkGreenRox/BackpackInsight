export class FormManager {
    private cleanupFns: (() => void)[] = [];

    public initForm(container: HTMLElement | null, onSubmit: (jsonText: string) => Promise<void>): void {
        const form = container?.querySelector('#uploadForm') as HTMLFormElement;
        const input = container?.querySelector('#jsonInput') as HTMLTextAreaElement;

        if (form && input) {
            const handleSubmit = async (e: Event) => {
                e.preventDefault();
                await onSubmit(input.value);
            };

            form.addEventListener('submit', handleSubmit);
            this.cleanupFns.push(() => form.removeEventListener('submit', handleSubmit));
        }
    }

    public destroy(): void {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}
