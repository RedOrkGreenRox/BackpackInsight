import { slotToken } from './rich-group-renderer';

export function groupRawFromDom(group: HTMLElement): string {
    const parts: string[] = [];
    group.childNodes.forEach(node => collectRawPart(node, parts));
    return `[${parts.join(' ').replace(/\s+/g, ' ').trim()}]`;
}

export function refreshAncestorGroups(group: HTMLElement): void {
    let parent = group.parentElement?.closest('.rich-group') as HTMLElement | null;
    while (parent) {
        parent.dataset['raw'] = groupRawFromDom(parent);
        parent = parent.parentElement?.closest('.rich-group') as HTMLElement | null;
    }
}

function collectRawPart(node: Node, parts: string[]): void {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) parts.push(text);
        return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.classList.contains('group-bracket')) return;
    if (node.classList.contains('rich-placeholder')) parts.push(slotToken());
    else if (node.classList.contains('rich-group')) parts.push(groupRawFromDom(node));
    else if (node.classList.contains('rich-token')) parts.push(node.dataset['raw'] || `[${node.dataset['value'] || ''}]`);
    else if (node.classList.contains('rich-operator')) parts.push(node.dataset['raw'] || node.textContent || '');
}
