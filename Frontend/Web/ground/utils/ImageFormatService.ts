export type SupportedImageFormat = 'avif' | 'webp';

/**
 * Единая проверка формата изображений на старте приложения.
 * После init() карточки и detail-страницы используют один выбранный формат,
 * без генерации <picture>/<source> для каждого предмета.
 */
export class ImageFormatService {
    private static format: SupportedImageFormat = 'webp';
    private static initialized = false;

    private static readonly TEST_IMAGES: Record<SupportedImageFormat, string> = {
        // Tiny AVIF/WebP test images. Если AVIF-тест не пройдет, останемся на WebP.
        avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxAAAAF21ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAHBpY3QAAAAAAAAAAAAAAABsaWJhdmlmAAAAAAAOcGl0bQAAAAAAAQAAABJpbG9jAAAAAEQAAQAAAAEAAAAAAAEAAAAeAAAAKGlpbmYAAAAAAAEAAAAaaW5mZQIAAAAAAQAAAGF2MDFDb2xvcgAAAABoaXBycAAAABNpcGNvAAAAAAABAAAADGF2MUOBABAAAAAAABNpcG1hAAAAAAAAAAEAAQEEAAAAHm1kYXQSAAoIP8AAAAA=',
        webp: 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA'
    };

    public static async init(): Promise<SupportedImageFormat> {
        if (this.initialized) return this.format;

        if (await this.supports('avif')) {
            this.format = 'avif';
        } else if (await this.supports('webp')) {
            this.format = 'webp';
        } else {
            this.format = 'webp';
        }

        this.initialized = true;
        document.documentElement.dataset['imageFormat'] = this.format;
        return this.format;
    }

    public static getFormat(): SupportedImageFormat {
        return this.format;
    }

    public static itemSrc(imageName: string): string {
        const format = this.getFormat();
        return `/images/items/${format}/${imageName}.${format}`;
    }

    public static placeholderSrc(): string {
        return `/images/placeholder/placeholder.${this.getFormat()}`;
    }

    private static supports(format: SupportedImageFormat): Promise<boolean> {
        return new Promise(resolve => {
            const img = new Image();
            const done = (supported: boolean) => {
                img.onload = null;
                img.onerror = null;
                resolve(supported);
            };

            const timeout = globalThis.setTimeout(() => done(false), 800);
            img.onload = () => {
                globalThis.clearTimeout(timeout);
                done(img.width > 0 && img.height > 0);
            };
            img.onerror = () => {
                globalThis.clearTimeout(timeout);
                done(false);
            };
            img.src = this.TEST_IMAGES[format];
        });
    }
}
