export class SearchDebouncer {
    private timer: ReturnType<typeof setTimeout> | null = null;

    constructor(private readonly delayMs: number) {}

    public run(callback: () => void): void {
        this.clear();
        this.timer = setTimeout(() => {
            this.timer = null;
            callback();
        }, this.delayMs);
    }

    public clear(): void {
        if (!this.timer) return;
        clearTimeout(this.timer);
        this.timer = null;
    }
}
