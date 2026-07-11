import { RichQueryRenderer } from './rich-query-renderer';

export function replaceFocusedToken(
    richInput: HTMLElement,
    token: HTMLElement,
    option: string,
    renderer: RichQueryRenderer,
    mapOption: (option: string) => string,
): void {
    const tag = `[<${mapOption(option)}>]`;
    const replacement = htmlToElement(renderer.compileTokenToHTML(tag));
    replacement.classList.add('focused-token');
    token.replaceWith(replacement);
    richInput.dispatchEvent(new Event('input', { bubbles: true }));
}

function htmlToElement(html: string): HTMLElement {
    const dummy = document.createElement('div');
    dummy.innerHTML = html;
    return dummy.firstElementChild as HTMLElement;
}
