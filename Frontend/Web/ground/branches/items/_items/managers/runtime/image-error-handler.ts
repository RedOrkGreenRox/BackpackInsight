import { ImageFormatService } from '../../../../../utils/ImageFormatService';
import { ListenerRegistrar } from './items-runtime-types';

export function attachImageErrorHandler(container: HTMLElement, addListener: ListenerRegistrar): void {
    addListener(container, 'error', (e: Event) => {
        const target = e.target as HTMLImageElement;
        if (target.tagName !== 'IMG' || !target.dataset['fallback']) return;
        if (target.dataset['failed'] === 'true') return;
        target.dataset['failed'] = 'true';
        const placeholder = ImageFormatService.placeholderSrc();
        if (target.parentElement?.tagName === 'PICTURE') {
            target.parentElement.querySelectorAll('source').forEach(source => {
                source.srcset = placeholder;
                source.type = 'image/webp';
            });
        }
        target.src = placeholder;
        target.parentElement?.classList.add('no-image');
    }, { capture: true });
}
