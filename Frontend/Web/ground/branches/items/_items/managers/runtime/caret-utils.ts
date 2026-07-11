const GAP_HTML = '<span class="caret-spacer">&nbsp;</span>';

export function moveCaretToEnd(el: HTMLElement): void {
    el.focus();
    if (typeof window.getSelection === 'undefined' || typeof document.createRange === 'undefined') return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
}

export function placeCaretAfter(node: Node): void {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.setStartAfter(node);
    range.setEndAfter(node);
    selection.removeAllRanges();
    selection.addRange(range);
}

export function insertHTMLAtCaret(container: HTMLElement, html: string): void {
    container.focus();
    const selection = window.getSelection();
    if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        if (container.contains(range.startContainer)) {
            range.deleteContents();
            const { fragment, lastNode } = htmlToFragment(html);
            range.insertNode(fragment);
            if (lastNode) placeCaretAfter(lastNode);
            return;
        }
    }
    const { fragment } = htmlToFragment(html);
    container.appendChild(fragment);
    moveCaretToEnd(container);
}

function htmlToFragment(html: string): { fragment: DocumentFragment; lastNode: Node | null } {
    const dummy = document.createElement('div');
    dummy.innerHTML = `${GAP_HTML}${html}${GAP_HTML}`;
    const fragment = document.createDocumentFragment();
    let node: Node | null;
    let lastNode: Node | null = null;
    while ((node = dummy.firstChild)) lastNode = fragment.appendChild(node);
    return { fragment, lastNode };
}
