export class Parallax {
    private static instance: Parallax;
    private img: HTMLElement | null = null;
    private initialX: number | null = null;
    private initialY: number | null = null;

    private constructor() {
        this.img = document.getElementById('bgImg');
        if (this.img) {
            document.addEventListener('mousemove', this.throttle((e: MouseEvent) => this.handleParallax(e), 20));
        }
    }

    public static init(): void {
        if (!Parallax.instance) {
            Parallax.instance = new Parallax();
        }
    }

    private throttle(func: Function, limit: number) {
        let inThrottle: boolean;
        return function (this: any, ...args: any[]) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    private handleParallax(e: MouseEvent): void {
        if (!this.img) return;

        if (this.initialX === null) {
            this.initialX = e.clientX;
            this.initialY = e.clientY;
            return;
        }

        const rect = this.img.closest('.background-image')?.getBoundingClientRect();
        if (!rect) return;

        const intensivity = 1.5;

        // Используем clientX/Y, чтобы не зависеть от скролла
        const moveX = -((e.clientX - this.initialX) / rect.width) * 100 * (intensivity / 50);
        const moveY = -((e.clientY - this.initialY!) / rect.height) * 100 * (intensivity / 50);

        // Важно: порядок трансформаций как в оригинале
        this.img.style.transform = `translate(-50%, -50%) translate(${moveX}%, ${moveY}%) scale(1.1)`;
    }
}
