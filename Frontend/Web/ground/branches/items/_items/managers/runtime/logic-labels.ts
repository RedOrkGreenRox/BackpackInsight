export function logicLabel(op: string): string {
    const lang = localStorage.getItem('lang') || navigator.language.split('-')[0] || 'en';
    const ru = lang === 'ru';
    if (op === '&') return ru ? 'И' : 'AND';
    if (op === '|') return ru ? 'ИЛИ' : 'OR';
    if (op === '!') return ru ? 'НЕ' : 'NOT';
    return op;
}
