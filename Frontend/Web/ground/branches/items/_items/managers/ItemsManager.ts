// @ts-ignore
import AOS from 'aos';
import { t } from '../../../../localization/i18n';
import { ItemsFilterManager } from './ItemsFilterManager';
import { ItemsStateManager, FilterState } from './ItemsStateManager';
import { ItemsIconService } from '../services/ItemsIconService';
import { ImageFormatService } from '../../../../utils/ImageFormatService';
import { SlugService } from '../../../../utils/SlugService';
import { generateIconsOrText } from '../../../../utils/icon-parser';
import { ItemPreviewPrefetchService } from '../../../../utils/ItemPreviewPrefetchService';

export class ItemsManager {
    private readonly container: HTMLElement;
    private readonly items: any[];
    private filteredItems: any[] = [];
    private currentSort: 'relevance' | 'rarity' | 'name' = 'rarity';
    private advancedFiltersVisible = false;
    private cleanupFns: (() => void)[] = [];
    private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    private intersectionObserver: IntersectionObserver | null = null;
    private renderedCount = 0;
    private readonly renderBatchSize = 80;
    private readonly eagerImagesCount = 12;

    private readonly filterManager = new ItemsFilterManager();
    private readonly stateManager = new ItemsStateManager();

    // Списки известных значений для сопоставления групп
    private readonly heroList = ['chana', 'ronan', 'harkon', 'nymphedora', 'tink', 'buzz', 'morrow', 'enoch', 'celeste', 'dorf', 'hob', 'pepper', 'sage', 'kragg', 'fern', 'zahir', 'shared', 'crashtestducky'];
    private readonly rarityList = ['common', 'rare', 'epic', 'legendary', 'mythic', 'unique', 'relic', 'boon', 'special'];
    private readonly typeList = ['bag', 'meleeweapon', 'rangedweapon', 'pet', 'food', 'accessory', 'armor', 'mineral', 'plant', 'potion', 'rat', 'fish', 'dragon', 'skull', 'cheese', 'chocolate', 'melee weapon', 'ranged weapon'];

    private filters: FilterState = {
        searchQuery: '',
        selectedTypes: new Set(),
        selectedRarities: new Set(),
        selectedHeroes: new Set(),
        selectedUnlockSources: new Set(),
        selectedBuffs: new Set(),
        selectedDebuffs: new Set(),
        selectedStats: new Set(),
        purchasableOnly: null
    };

    constructor(container: HTMLElement, items: any[]) {
        this.container = container;
        this.items = items;
    }

    public init(): void {
        const restored = this.stateManager.restoreState();
        this.filters = restored.filters;
        this.currentSort = (restored.currentSort || 'rarity') as 'relevance' | 'rarity' | 'name';
        this.advancedFiltersVisible = restored.advancedFiltersVisible;

        this.filterManager.initFuse(this.items);

        // Настройка WYSIWYG-инпута (contenteditable)
        const richInput = this.container.querySelector('#itemSearch') as HTMLElement;
        if (richInput) {
            // Загружаем начальный отрендеренный контент из стейта
            if (this.filters.searchQuery) {
                richInput.innerHTML = this.renderTextToRichHTML(this.filters.searchQuery);
            }

            // Перехват ввода
            this.addListener(richInput, 'input', () => {
                this.filters.searchQuery = this.getCleanTextFromRichHTML();
                this.saveState();
                
                // Скрываем автокомплит если поле пустое
                if (!richInput.textContent?.trim()) {
                    this.hideAutocomplete();
                }

                if (this.searchDebounceTimer) {
                    clearTimeout(this.searchDebounceTimer);
                }
                this.searchDebounceTimer = setTimeout(() => {
                    this.applyFilters();
                }, 200);
            });

            // Слушатель нажатий кнопок на клавиатуре
            this.addListener(richInput, 'keyup', (e: Event) => {
                const event = e as KeyboardEvent;
                if (event.key === 'Enter' || event.key === 'Escape' || event.key === 'Backspace') {
                    return;
                }
                this.handleAutocompleteTrigger();
            });

            // Преобразование в чипсы по нажатию Enter
            this.addListener(richInput, 'keydown', (e: Event) => {
                const event = e as KeyboardEvent;

                if (event.key === 'Enter') {
                    event.preventDefault();
                    
                    // Если есть "призрачная" подсказка — принимаем её!
                    const ghost = richInput.querySelector('.ghost-suggestion') as HTMLElement;
                    if (ghost) {
                        const remainder = ghost.textContent || '';
                        
                        // Создаем текстовую ноду с окончанием и пробелом
                        const textNode = document.createTextNode(remainder + ' ');
                        
                        // Заменяем призрачную подсказку на реальный текст
                        ghost.parentNode?.replaceChild(textNode, ghost);
                        
                        // Ставим каретку сразу после вставленного текста
                        const selection = window.getSelection();
                        if (selection) {
                            const range = document.createRange();
                            range.setStartAfter(textNode);
                            range.setEndAfter(textNode);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                        
                        this.hideAutocomplete();
                        richInput.dispatchEvent(new Event('input', { bubbles: true }));
                    } else {
                        // Если подсказки нет — компилируем в чипсы!
                        this.triggerCompilation(richInput);
                    }
                    return;
                }

                if (event.key === 'Escape') {
                    event.preventDefault();
                    this.hideAutocomplete();
                    return;
                }

                // Атомарное удаление (Backspace удаляет чип целиком)
                if (event.key === 'Backspace') {
                    // Сначала всегда прячем подсказку при удалении символов
                    this.hideAutocomplete();

                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        
                        // Если курсор находится перед плейсхолдером или чипсом
                        if (range.startOffset === 0 && range.startContainer.previousSibling) {
                            const prev = range.startContainer.previousSibling as HTMLElement;
                            if (prev.classList && (prev.classList.contains('rich-token') || prev.classList.contains('rich-operator') || prev.classList.contains('rich-placeholder'))) {
                                event.preventDefault();
                                
                                // Если удаляем плейсхолдер - также удаляем стоящий перед ним оператор!
                                if (prev.classList.contains('rich-placeholder')) {
                                    const opNode = prev.previousSibling;
                                    if (opNode) opNode.remove();
                                }
                                
                                prev.remove();
                                richInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }
                    }
                }
            });

            // Поддержка копирования строгого текстового формата (Copy/Paste)
            this.addListener(richInput, 'copy', (e: Event) => {
                const event = e as ClipboardEvent;
                event.preventDefault();
                const cleanText = this.getCleanTextFromRichHTML();
                event.clipboardData?.setData('text/plain', cleanText);
            });

            // Снятие фокуса с выбранных чипсов при клике вне
            this.addListener(this.container, 'click', (e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('.rich-token')) {
                    this.container.querySelectorAll('.rich-token.focused-token').forEach(el => {
                        el.classList.remove('focused-token');
                    });
                }
                if (!target.closest('.rich-placeholder')) {
                    this.container.querySelectorAll('.rich-placeholder.active-placeholder').forEach(el => {
                        el.classList.remove('active-placeholder');
                    });
                }
            });
        }

        const advancedFiltersToggle = this.container.querySelector('#advancedFiltersToggle');
        if (advancedFiltersToggle) {
            this.addListener(advancedFiltersToggle, 'click', () => {
                this.toggleAdvancedFilters();
            });
        }

        const clearFiltersBtn = this.container.querySelector('#clearFilters');
        if (clearFiltersBtn) {
            this.addListener(clearFiltersBtn, 'click', () => {
                this.clearFilters();
            });
        }

        const purchasableCheckbox = this.container.querySelector('#filterPurchasable') as HTMLInputElement;
        if (purchasableCheckbox) {
            purchasableCheckbox.checked = this.filters.purchasableOnly === true;
            this.addListener(purchasableCheckbox, 'change', (e) => {
                const checked = (e.target as HTMLInputElement).checked;
                this.filters.purchasableOnly = checked ? true : null;
                this.saveState();
                this.applyFilters();
            });
        }

        const panel = this.container.querySelector('#advancedFiltersPanel') as HTMLElement;
        const icon = this.container.querySelector('.filter-toggle-icon') as HTMLElement;
        const toggleBtn = this.container.querySelector('#advancedFiltersToggle') as HTMLElement;
        const wrapper = this.container.querySelector('.search-input-wrapper') as HTMLElement;
        if (panel && icon && toggleBtn && wrapper) {
            if (this.advancedFiltersVisible) {
                panel.style.display = 'block';
                setTimeout(() => {
                    panel.classList.add('show');
                    wrapper.classList.add('open');
                }, 10);
                toggleBtn.classList.add('open');
            } else {
                panel.style.display = 'none';
                panel.classList.remove('show');
                wrapper.classList.remove('open');
                toggleBtn.classList.remove('open');
            }
            icon.textContent = this.advancedFiltersVisible ? '▲' : '▼';
        }

        // Обработка ошибок картинок
        this.addListener(this.container, 'error', (e) => {
            const target = e.target as HTMLImageElement;
            if (target.tagName === 'IMG' && target.dataset['fallback']) {
                if (target.dataset['failed'] === 'true') return;
                target.dataset['failed'] = 'true';
                const placeholder = ImageFormatService.placeholderSrc();
                if (target.parentElement?.tagName === 'PICTURE') {
                    target.parentElement.querySelectorAll('source').forEach(s => {
                        s.srcset = placeholder;
                        s.type = 'image/webp';
                    });
                }
                target.src = placeholder;
                target.parentElement?.classList.add('no-image');
            }
        }, { capture: true });

        this.initDropdownFilters();
        this.setupFilterOptions();
        this.updateSortLabelFromQuery();
        
        // Синхронизируем чипсы с текстом при первой загрузке
        this.syncChipsWithInput();

        // Вешаем клик-события для каретки/выбора чипсов внутри contenteditable
        this.attachRichInputListeners();

        // Настройка системных логических кнопок в панели
        this.container.querySelectorAll('.logical-chip').forEach(btn => {
            this.addListener(btn, 'click', () => {
                const val = (btn as HTMLElement).dataset['value']!;
                let htmlToInsert = '';
                
                if (val === '[]') {
                    htmlToInsert = '[<span class="rich-placeholder" contenteditable="false" data-parent-op="brackets">Укажите условия...</span>]';
                    this.insertHTMLAtCaret(richInput, htmlToInsert);
                    this.moveCaretInsideBrackets(richInput);
                } else if (val === '&') {
                    htmlToInsert = `<span class="rich-operator op-and" contenteditable="false" data-raw="&">AND</span>`;
                    this.insertHTMLAtCaret(richInput, htmlToInsert);
                } else if (val === '|') {
                    htmlToInsert = `<span class="rich-operator op-or" contenteditable="false" data-raw="|">OR</span>`;
                    this.insertHTMLAtCaret(richInput, htmlToInsert);
                } else if (val === '!') {
                    htmlToInsert = `<span class="rich-operator op-not" contenteditable="false" data-raw="!">NOT</span>` +
                                   `<span class="rich-placeholder" contenteditable="false" data-parent-op="!">Выберите тег...</span>`;
                    this.insertHTMLAtCaret(richInput, htmlToInsert);
                }
                
                richInput.dispatchEvent(new Event('input', { bubbles: true }));
            });
        });
    }

    private triggerCompilation(richInput: HTMLElement) {
        const rawText = this.getCleanTextFromRichHTML();
        richInput.innerHTML = this.renderTextToRichHTML(rawText);
        this.moveCaretToEnd(richInput);
        this.filters.searchQuery = rawText;
        this.saveState();
        this.applyFilters();
        this.syncChipsWithInput();
        this.hideAutocomplete();
    }

    // --- ПРИЗРАЧНЫЕ АВТО-ПОДСКАЗКИ (GHOST SUGGESTIONS) ---

    private handleAutocompleteTrigger(): void {
        const richInput = this.container.querySelector('#itemSearch') as HTMLElement;
        if (!richInput) return;

        // Сначала всегда прячем старую подсказку перед расчетом новой
        this.hideAutocomplete();

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        if (textNode.nodeType !== 3) return;

        const offset = range.startOffset;
        const textVal = textNode.textContent || '';
        
        // Слово, вводимое пользователем в данный момент
        const typedPart = textVal.slice(0, offset).split(/\s+/).pop() || '';
        
        if (typedPart.length < 2 || typedPart.startsWith('[') || typedPart.startsWith('<') || typedPart.startsWith('{') || typedPart.startsWith('(')) {
            return;
        }

        const query = typedPart.toLowerCase();
        let bestMatch = '';

        // Поиск первого подходящего слова, начинающегося на вводимый префикс
        const allWords = [...this.heroList, ...this.rarityList, ...this.typeList];
        for (const word of allWords) {
            if (word.startsWith(query) && word !== query) {
                bestMatch = word;
                break;
            }
        }

        if (bestMatch) {
            // Вычисляем "призрачную" часть слова (окончание)
            const remainder = bestMatch.slice(query.length);
            
            // Если первая буква введенной части была заглавной — заглавная и в подсказке
            const isCapitalized = typedPart.charAt(0) === typedPart.charAt(0).toUpperCase();
            const formattedRemainder = isCapitalized 
                ? remainder 
                : remainder.toLowerCase();

            const ghostSpan = document.createElement('span');
            ghostSpan.className = 'ghost-suggestion';
            ghostSpan.contentEditable = 'false';
            ghostSpan.textContent = formattedRemainder;

            // Вставляем подсказку в DOM прямо за кареткой
            range.insertNode(ghostSpan);

            // Важно: возвращаем каретку обратно ПЕРЕД подсказкой, чтобы пользователь мог продолжать писать
            range.setStartBefore(ghostSpan);
            range.setEndBefore(ghostSpan);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    private hideAutocomplete(): void {
        const richInput = this.container.querySelector('#itemSearch') as HTMLElement;
        if (richInput) {
            richInput.querySelectorAll('.ghost-suggestion').forEach(el => el.remove());
        }
    }

    private moveCaretInsideBrackets(container: HTMLElement) {
        container.focus();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;
            if (textNode.nodeType === 3 && textNode.textContent === '[]') {
                range.setStart(textNode, 1);
                range.setEnd(textNode, 1);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    private moveCaretToEnd(el: HTMLElement) {
        el.focus();
        if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }

    // Вставка HTML в точную позицию каретки (указателя) внутри contenteditable
    private insertHTMLAtCaret(container: HTMLElement, html: string): void {
        container.focus();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            // Защита: вставляем только если каретка находится внутри поискового поля
            if (container.contains(range.startContainer)) {
                range.deleteContents();
                
                const dummy = document.createElement('div');
                dummy.innerHTML = html;
                const fragment = document.createDocumentFragment();
                let node: Node | null;
                let lastNode: Node | null = null;
                
                while ((node = dummy.firstChild)) {
                    lastNode = fragment.appendChild(node);
                }
                
                range.insertNode(fragment);
                
                // Перемещаем курсор сразу за вставленный элемент
                if (lastNode) {
                    range.setStartAfter(lastNode);
                    range.setEndAfter(lastNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                return;
            }
        }
        
        // Резервный сценарий: добавляем в конец
        const dummy = document.createElement('div');
        dummy.innerHTML = html;
        container.appendChild(dummy.firstElementChild!);
    }

    // --- КОМПИЛЯТОР: TEXT -> RICH HTML ---

    private renderTextToRichHTML(query: string): string {
        let html = '';
        let i = 0;
        const n = query.length;
        let textBuffer = '';
        const caretGap = '\u200B';

        const flushTextBuffer = () => {
            if (textBuffer) {
                let cleaned = textBuffer
                    .replace(/\s+(ИЛИ|OR|\|)\s+/gi, ` ${caretGap}<span class="rich-operator op-or" contenteditable="false" data-raw="|">OR</span>${caretGap} `)
                    .replace(/\s+(И|AND|&)\s+/gi, ` ${caretGap}<span class="rich-operator op-and" contenteditable="false" data-raw="&">AND</span>${caretGap} `)
                    .replace(/\s*(НЕ|NOT|!)\s*(?=\[)/gi, ` ${caretGap}<span class="rich-operator op-not" contenteditable="false" data-raw="!">NOT</span>${caretGap}`);
                
                html += cleaned;
                textBuffer = '';
            }
        };

        while (i < n) {
            if (query[i] === '[') {
                flushTextBuffer();
                let depth = 0;
                let start = i;
                let matched = false;
                while (i < n) {
                    if (query[i] === '[') {
                        depth++;
                    } else if (query[i] === ']') {
                        depth--;
                        if (depth === 0) {
                            matched = true;
                            i++;
                            break;
                        }
                    }
                    i++;
                }

                if (matched) {
                    const tagText = query.slice(start, i);
                    if (html.endsWith('</span>') || html.endsWith('</span>' + caretGap)) {
                        html += `${caretGap}<span class="rich-operator op-and" contenteditable="false" data-raw="&">AND</span>${caretGap}`;
                    }
                    html += this.compileTokenToHTML(tagText);
                } else {
                    textBuffer += query.slice(start);
                    break;
                }
            } else if (query[i] === '&') {
                flushTextBuffer();
                html += `${caretGap}<span class="rich-operator op-and" contenteditable="false" data-raw="&">AND</span>${caretGap}`;
                i++;
            } else if (query[i] === '|') {
                flushTextBuffer();
                html += `${caretGap}<span class="rich-operator op-or" contenteditable="false" data-raw="|">OR</span>${caretGap}`;
                i++;
            } else if (query[i] === '!' && query[i+1] !== '[') {
                flushTextBuffer();
                html += `${caretGap}<span class="rich-operator op-not" contenteditable="false" data-raw="!">NOT</span>${caretGap}`;
                i++;
            } else if (query[i] === '{') {
                flushTextBuffer();
                let start = i;
                while (i < n && query[i] !== '}') {
                    i++;
                }
                if (query[i] === '}') {
                    i++;
                    const sortTag = query.slice(start, i);
                    const sortVal = sortTag.slice(1, -1).trim();
                    const translatedSort = t('items_sort_' + sortVal.toLowerCase().replace(' ', '_'));
                    html += `${caretGap}<span class="rich-operator op-sort" contenteditable="false" data-raw="${sortTag}">${translatedSort}</span>${caretGap}`;
                } else {
                    textBuffer += query.slice(start);
                }
            } else {
                textBuffer += query[i];
                i++;
            }
        }

        flushTextBuffer();
        html = html.replace(/<\/span>\s*<span class="rich-token/g, `</span>${caretGap}<span class="rich-operator op-and" contenteditable="false" data-raw="&">AND</span>${caretGap}<span class="rich-token`);
        return html;
    }

    private compileTokenToHTML(tagText: string): string {
        let content = tagText.slice(1, -1).trim();
        let isNegated = false;
        let isExact = false;

        if (content.startsWith('!')) {
            isNegated = true;
            content = content.slice(1).trim();
        }

        if (content.startsWith('<') && content.endsWith('>')) {
            isExact = true;
            content = content.slice(1, -1).trim();
        }

        let stateClasses = 'plain';
        if (isExact) stateClasses = 'exact';
        if (isNegated) stateClasses = 'negated ' + stateClasses;

        const norm = content.toLowerCase();
        let groupType = 'plain';
        if (this.heroList.includes(norm)) groupType = 'hero';
        else if (this.rarityList.includes(norm)) groupType = 'rarity';
        else if (this.typeList.includes(norm)) groupType = 'type';

        const iconHtml = this.getIconForFilter(content, 'filter' + groupType.charAt(0).toUpperCase() + groupType.slice(1) + 's');
        const displayLabel = groupType === 'sort' ? t('items_sort_' + content.toLowerCase().replace(' ', '_')) : content;

        return `
            <span class="rich-token ${stateClasses}" contenteditable="false" data-raw="${tagText}" data-value="${content}" data-group-type="${groupType}">
                ${iconHtml || ''}
                <span>${displayLabel}</span>
                <span class="token-close-btn">&times;</span>
            </span>
        `.trim().replace(/\s+/g, ' ');
    }

    // --- ДЕКОМПИЛЯТОР: RICH HTML -> TEXT ---

    private getCleanTextFromRichHTML(): string {
        const richInput = this.container.querySelector('#itemSearch') as HTMLElement;
        if (!richInput) return '';

        let text = '';
        richInput.childNodes.forEach(node => {
            if (node.nodeType === 3) {
                text += node.textContent?.replace(/\u200B/g, '');
            } else if (node.nodeType === 1) {
                const el = node as HTMLElement;
                if (el.classList.contains('rich-placeholder')) {
                    return;
                }
                if (el.dataset['raw']) {
                    text += " " + el.dataset['raw'] + " ";
                } else {
                    text += el.textContent?.replace(/\u200B/g, '');
                }
            }
        });

        return text.replace(/\s+/g, ' ').trim();
    }

    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject, options?: any) {
        if (element) {
            element.addEventListener(event, handler, options);
            this.cleanupFns.push(() => element.removeEventListener(event, handler, options));
        }
    }

    private createIconHtml(iconName: string, title: string): string {
        const imageFormats = [
            { type: 'image/avif', ext: 'avif', path: '/images/fonticon/avif' },
            { type: 'image/webp', ext: 'webp', path: '/images/fonticon/webp' },
        ];
        const defaultFormat = imageFormats.find(f => f.ext === 'webp') || imageFormats[0];

        const sources = imageFormats.map(format =>
            `<source srcset="${format.path}/${iconName.toLowerCase()}.${format.ext}" type="${format.type}">`
        ).join('');

        return `<picture class="filter-icon" title="${title}">` +
            `${sources}` +
            `<img src="${defaultFormat?.path}/${iconName.toLowerCase()}.${defaultFormat?.ext}" alt="${title}" loading="lazy">` +
            `</picture>`;
    }

    private getCurrentSortFromQuery(query: string): { mode: 'rarity' | 'name' | 'relevance'; inverted: boolean } {
        const sortMatch = /\{([a-zA-Z\s]+)\}/i.exec(query);
        if (sortMatch) {
            const modeStr = sortMatch[1]!.toLowerCase().trim();
            if (modeStr === 'rarity down') {
                return { mode: 'rarity', inverted: false };
            } else if (modeStr === 'rarity up') {
                return { mode: 'rarity', inverted: true };
            } else if (modeStr === 'alphabet up') {
                return { mode: 'name', inverted: false };
            } else if (modeStr === 'alphabet down') {
                return { mode: 'name', inverted: true };
            } else if (modeStr === 'relevance') {
                return { mode: 'relevance', inverted: false };
            }
        }
        return { mode: 'rarity', inverted: false };
    }

    private toggleAdvancedFilters() {
        this.advancedFiltersVisible = !this.advancedFiltersVisible;
        const panel = this.container.querySelector('#advancedFiltersPanel') as HTMLElement;
        const icon = this.container.querySelector('.filter-toggle-icon') as HTMLElement;
        const toggleBtn = this.container.querySelector('#advancedFiltersToggle') as HTMLElement;
        const wrapper = this.container.querySelector('.search-input-wrapper') as HTMLElement;

        if (panel && toggleBtn && wrapper) {
            if (this.advancedFiltersVisible) {
                panel.style.display = 'block';
                setTimeout(() => {
                    panel.classList.add('show');
                    wrapper.classList.add('open');
                    setTimeout(() => { if (AOS !== undefined) AOS.refresh(); }, 50);
                }, 10);
                toggleBtn.classList.add('open');
            } else {
                panel.classList.remove('show');
                wrapper.classList.remove('open');
                setTimeout(() => {
                    if (!panel.classList.contains('show')) panel.style.display = 'none';
                    if (AOS !== undefined) AOS.refresh();
                }, 400);
                toggleBtn.classList.remove('open');
            }
        }
        
        if (icon) icon.textContent = this.advancedFiltersVisible ? '▲' : '▼';
        this.saveState();
    }

    private clearFilters() {
        const richInput = this.container.querySelector('#itemSearch') as HTMLElement;
        if (richInput) richInput.innerHTML = '';

        const purchasableCheckbox = this.container.querySelector('#filterPurchasable') as HTMLInputElement;
        if (purchasableCheckbox) purchasableCheckbox.checked = false;

        this.container.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });

        this.currentSort = 'rarity';
        this.updateSortLabelFromQuery();
        
        this.filters = {
            searchQuery: '',
            selectedTypes: new Set(),
            selectedRarities: new Set(),
            selectedHeroes: new Set(),
            selectedUnlockSources: new Set(),
            selectedBuffs: new Set(),
            selectedDebuffs: new Set(),
            selectedStats: new Set(),
            purchasableOnly: null
        };

        this.saveState();
        this.applyFilters();
    }

    private applyFilters() {
        this.filteredItems = this.filterManager.applyFilters(this.items, this.filters);
        this.filteredItems = this.filterManager.sortItems(this.filteredItems, this.currentSort, this.filters.searchQuery);

        const currentOrder = this.filteredItems.map(item => item.name);
        sessionStorage.setItem('filteredItemsOrder', JSON.stringify(currentOrder));

        this.renderGrid();
    }

    private renderGrid() {
        const grid = this.container.querySelector('#wikiItemsGrid') as HTMLElement;
        if (!grid) return;

        this.disconnectInfiniteScroll();
        grid.innerHTML = '';
        this.renderedCount = 0;
        this.appendNextItemsBatch();
        this.setupInfiniteScroll();
    }

    private setupInfiniteScroll(): void {
        const sentinel = this.container.querySelector('#itemsScrollSentinel');
        if (!sentinel) return;

        this.intersectionObserver = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) {
                this.appendNextItemsBatch();
            }
        }, {
            root: null,
            rootMargin: '900px 0px',
            threshold: 0
        });

        this.intersectionObserver.observe(sentinel);
    }

    private disconnectInfiniteScroll(): void {
        this.intersectionObserver?.disconnect();
        this.intersectionObserver = null;
    }

    private appendNextItemsBatch(): void {
        const grid = this.container.querySelector('#wikiItemsGrid') as HTMLElement;
        if (!grid) return;
        if (this.renderedCount >= this.filteredItems.length) {
            this.disconnectInfiniteScroll();
            return;
        }

        const start = this.renderedCount;
        const end = Math.min(start + this.renderBatchSize, this.filteredItems.length);
        const fragment = document.createDocumentFragment();

        for (let index = start; index < end; index++) {
            const item = this.filteredItems[index];
            if (!item) continue;

            const imagePath = ItemsIconService.getItemImagePath(item);
            const imageSrc = ImageFormatService.itemSrc(imagePath);
            const slug = SlugService.toSlug(item.name);

            const link = document.createElement('a');
            link.href = `/item/${slug}`;
            link.dataset['link'] = '';
            link.className = 'item-card-link';
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';
            link.style.display = 'block';

            (link as any)._stateData = { itemData: item };

            link.dataset['aos'] = 'fade-up';
            link.dataset['aosOffset'] = '-400px';
            const delay = Math.min((index % 10) * 30, 300);
            link.dataset['aosDelay'] = `${delay}`;

            const card = document.createElement('div');
            card.className = 'item-card';

            const isEagerImage = index < this.eagerImagesCount;
            card.innerHTML = `
                <div class="item-image-wrapper">
                    <img src="${imageSrc}"
                         alt="${item.name}" 
                         loading="${isEagerImage ? 'eager' : 'lazy'}"
                         decoding="async"
                         fetchpriority="${isEagerImage ? 'high' : 'low'}"
                         class="item-icon"
                         data-fallback>
                </div>
                <span class="item-name">${item.name}</span>
                <div class="item-stats">
                    <span class="rarity-${item.rarity.toLowerCase()}">${item.rarity}</span>
                </div>
            `;

            link.appendChild(card);
            fragment.appendChild(link);
            link.addEventListener('pointerenter', () => {
                ItemPreviewPrefetchService.prefetch(item, imageSrc);
            }, { passive: true });
            link.addEventListener('click', () => {
                (link as any)._stateData = {
                    itemData: item,
                    scrollY: window.scrollY
                };
            });
        }

        this.renderedCount = end;
        grid.appendChild(fragment);

        requestAnimationFrame(() => {
            AOS.refresh();
            setTimeout(() => {
                const elements = Array.from(grid.querySelectorAll('.item-card-link')).slice(start, end);
                elements.forEach((el, localIndex) => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        el.classList.add('aos-animate');
                        (el as HTMLElement).style.animationDelay = `${Math.min((localIndex % 10) * 30, 300)}ms`;
                        (el as HTMLElement).style.animation = 'fadeUp 0.6s ease-out forwards';
                    }
                });
            }, 50);
        });

        if (this.renderedCount >= this.filteredItems.length) {
            this.disconnectInfiniteScroll();
        }
    }

    private saveState(): void {
        this.stateManager.saveState(this.filters, this.currentSort, this.advancedFiltersVisible);
    }

    private attachRichInputListeners(): void {
        const richInput = this.container.querySelector('#itemSearch') as HTMLElement;
        if (!richInput) return;

        this.addListener(richInput, 'click', (e) => {
            const target = e.target as HTMLElement;
            const token = target.closest('.rich-token') as HTMLElement;
            const closeBtn = target.closest('.token-close-btn') as HTMLElement;
            const placeholder = target.closest('.rich-placeholder') as HTMLElement;

            if (placeholder) {
                e.stopPropagation();
                this.container.querySelectorAll('.rich-placeholder.active-placeholder').forEach(el => {
                    el.classList.remove('active-placeholder');
                });
                placeholder.classList.add('active-placeholder');
                return;
            }

            if (closeBtn && token) {
                token.remove();
                richInput.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }

            if (token) {
                e.stopPropagation();
                this.container.querySelectorAll('.rich-token.focused-token').forEach(el => {
                    if (el !== token) el.classList.remove('focused-token');
                });
                token.classList.toggle('focused-token');
            }
        });
    }

    private createMultiselectFilter(containerId: string, options: string[], groupType: string) {
        const container = this.container.querySelector(`#${containerId}`);
        if (!container) return;

        container.innerHTML = '';

        const optionsWithIcons: string[] = [];
        const optionsWithoutIcons: string[] = [];
        
        options.forEach(option => {
            const iconHtml = this.getIconForFilter(option, containerId);
            if (iconHtml) {
                optionsWithIcons.push(option);
            } else {
                optionsWithoutIcons.push(option);
            }
        });

        [...optionsWithIcons, ...optionsWithoutIcons].forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'filter-chip';
            button.dataset['groupType'] = groupType;
            
            if (containerId === 'filterRarities') {
                button.classList.add(`rarity-${option.toLowerCase()}`);
            }
            
            button.dataset['value'] = option;

            const iconHtml = this.getIconForFilter(option, containerId);
            const labelText = containerId === 'filterSort' ? t('items_sort_' + option.toLowerCase().replace(' ', '_')) : option;
            button.innerHTML = iconHtml || `<span>${labelText}</span>`;

            container.appendChild(button);
        });

        this.addListener(container, 'click', (e) => {
            const button = (e.target as HTMLElement).closest('.filter-chip') as HTMLButtonElement;
            if (!button) return;

            if (!container.classList.contains('show')) return;

            const option = button.dataset['value']!;
            const type = button.dataset['groupType']!;
            
            const richInput = this.container.querySelector('#itemSearch') as HTMLElement;
            if (!richInput) return;

            const focusedToken = richInput.querySelector('.rich-token.focused-token') as HTMLElement;
            if (focusedToken && type !== 'sort') {
                const tokenVal = focusedToken.dataset['value']!;
                const tokenType = focusedToken.dataset['groupType']!;
                
                if (tokenVal === option && tokenType === type) {
                    const isExact = focusedToken.classList.contains('exact');
                    const isNegated = focusedToken.classList.contains('negated');
                    
                    let nextRaw = '';
                    const typeMapping: Record<string, string> = {
                        'Melee Weapon': 'MeleeWeapon',
                        'Ranged Weapon': 'RangedWeapon'
                    };
                    const mappedVal = typeMapping[option] || option.replace(/\s+/g, '');

                    if (isExact && !isNegated) {
                        nextRaw = `[!<${mappedVal}>]`;
                    } else if (isExact && isNegated) {
                        nextRaw = `[${mappedVal}]`;
                    } else if (!isExact && !isNegated) {
                        nextRaw = `[!${mappedVal}]`;
                    } else {
                        focusedToken.remove();
                        richInput.dispatchEvent(new Event('input', { bubbles: true }));
                        return;
                    }

                    const dummy = document.createElement('div');
                    dummy.innerHTML = this.compileTokenToHTML(nextRaw);
                    const newToken = dummy.firstElementChild as HTMLElement;
                    newToken.classList.add('focused-token');

                    richInput.replaceChild(newToken, focusedToken);
                    richInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                return;
            }

            const activePlaceholder = richInput.querySelector('.rich-placeholder.active-placeholder') as HTMLElement;
            if (activePlaceholder && type !== 'sort') {
                const typeMapping: Record<string, string> = {
                    'Melee Weapon': 'MeleeWeapon',
                    'Ranged Weapon': 'RangedWeapon'
                };
                const mappedVal = typeMapping[option] || option.replace(/\s+/g, '');
                
                const newTag = `[<${mappedVal}>]`;
                const dummy = document.createElement('div');
                dummy.innerHTML = this.compileTokenToHTML(newTag);
                const newToken = dummy.firstElementChild as HTMLElement;

                richInput.replaceChild(newToken, activePlaceholder);
                richInput.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }

            let tagString = '';
            if (type === 'sort') {
                tagString = `{${option}}`;
            } else {
                const typeMapping: Record<string, string> = {
                    'Melee Weapon': 'MeleeWeapon',
                    'Ranged Weapon': 'RangedWeapon'
                };
                const mappedValue = typeMapping[option] || option.replace(/\s+/g, '');
                tagString = `[<${mappedValue}>]`;
            }

            const htmlToInsert = type === 'sort' 
                ? `<span class="rich-operator op-sort" contenteditable="false" data-raw="${tagString}">${t('items_sort_' + option.toLowerCase().replace(' ', '_'))}</span>`
                : this.compileTokenToHTML(tagString);

            this.insertHTMLAtCaret(richInput, htmlToInsert);
            richInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }

    private getIconForFilter(value: string, filterType: string): string | null {
        const normalizedValue = value.replace(/\s+/g, '');
        const typeMapping: Record<string, string> = {
            'Armor': 'TypeArmor', 'Accessory': 'TypeAccessory', 'Food': 'TypeFood',
            'Plant': 'TypePlant', 'Mineral': 'TypeMineral', 'Potion': 'TypePotion',
            'MeleeWeapon': 'MeleeWeapon', 'Melee Weapon': 'MeleeWeapon',
            'RangedWeapon': 'RangedWeapon', 'Ranged Weapon': 'RangedWeapon',
            'Pet': 'Pet', 'Mana': 'Mana', 'Gold': 'Gold', 'Rat': 'TypeRat'
        };

        const heroMapping: Record<string, string> = {
            'Chana': 'Chana', 'Ronan': 'Ronan', 'Harkon': 'Harkon', 'Nymphedora': 'Nymphedora',
            'Tink': 'Tink', 'Buzz': 'Buzz', 'Morrow': 'Morrow', 'Enoch': 'Enoch',
            'Celeste': 'Celeste', 'Shared': 'Shared', 'Dorf': 'Dorf', 'Hob': 'Hob',
            'Pepper': 'Pepper', 'Sage': 'Sage', 'Kragg': 'Kragg', 'Fern': 'Fern', 'Zahir': 'Zahir',
            'Crash Test Ducky': 'crashtestducky'
        };

        const buffMapping: Record<string, string> = {
            'Buff': 'Buff', 'Haste': 'Haste', 'Regeneration': 'Regeneration', 'Resist': 'Resist',
            'Thorns': 'Thorns', 'Armor': 'Armor', 'Luck': 'Luck', 'Lifesteal': 'Lifesteal', 'Empower': 'Empower',
            'Cleanse': 'Cleanse', 'Heal': 'Heal', 'Mana': 'Mana'
        };

        const debuffMapping: Record<string, string> = {
            'Burn': 'Burn', 'Bleed': 'Bleed', 'Poison': 'Poison', 'Chill': 'Chill', 'Frost': 'Frost',
            'Curse': 'Curse', 'Blind': 'Blind', 'Stun': 'Stun', 'Debuff': 'Debuff'
        };

        const statsMapping: Record<string, string> = {
            'Health': 'Health', 'MaxHealth': 'MaxHealth', 'Armor': 'Armor', 'Damage': 'Damage',
            'Accuracy': 'Accuracy', 'CritChance': 'CritChance', 'CritDamage': 'CritDamage',
            'Stamina': 'Stamina', 'StaminaRecovery': 'StaminaRecovery', 'Resist': 'Resist',
            'Static': 'Static', 'Soul': 'Soul', 'Shield': 'Shield', 'Block': 'Block'
        };

        const sortMapping: Record<string, string> = {
            'Rarity Down': 'sortlow',
            'Rarity Up': 'sorthigh',
            'Alphabet Up': 'sorthigh',
            'Alphabet Down': 'sortlow',
            'Relevance': 'luck'
        };

        let iconName: string | null = null;
        let titleDesc = '';

        if (filterType === 'filterTypes') {
            iconName = typeMapping[value] || typeMapping[normalizedValue] || null;
            titleDesc = `Тип: ${value}`;
            if (!iconName) {
                const result = generateIconsOrText([value]);
                if (result.includes('<picture')) return result;
            }
        } else if (filterType === 'filterHeroes') {
            iconName = heroMapping[value] || null;
            titleDesc = `Герой: ${value}`;
        } else if (filterType === 'filterBuffs') {
            iconName = buffMapping[value] || null;
            titleDesc = `Эффект: ${value}`;
        } else if (filterType === 'filterDebuffs') {
            iconName = debuffMapping[value] || null;
            titleDesc = `Эффект: ${value}`;
        } else if (filterType === 'filterStats') {
            iconName = statsMapping[value] || null;
            titleDesc = `Характеристика: ${value}`;
        } else if (filterType === 'filterSort') {
            iconName = sortMapping[value] || null;
            titleDesc = `Сортировка: ${t('items_sort_' + value.toLowerCase().replace(' ', '_'))}`;
        }

        if (iconName) {
            return this.createIconHtml(iconName, titleDesc);
        }

        return null;
    }

    private updateSortLabelFromQuery(): void {
        const text = this.container.querySelector('#itemSortText');
        if (text) {
            const activeSort = this.getCurrentSortFromQuery(this.filters.searchQuery);
            if (activeSort.mode === 'relevance') {
                text.textContent = t('items_sort_relevance') || 'Релевантность';
            } else if (activeSort.mode === 'rarity') {
                text.textContent = t('items_sort_rarity') + (activeSort.inverted ? " ▲" : " ▼");
            } else {
                text.textContent = t('items_sort_name') + (activeSort.inverted ? " ▲" : " ▼");
            }
        }
    }

    private initDropdownFilters(): void {
        const dropdownToggles = this.container.querySelectorAll('.dropdown-toggle');
        dropdownToggles?.forEach(toggle => {
            this.addListener(toggle, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = (toggle as HTMLElement).dataset['target'];
                if (!targetId) return;
                
                const dropdown = this.container.querySelector(`#${targetId}`) as HTMLElement;
                const arrow = toggle.querySelector('.dropdown-arrow') as HTMLElement;
                
                if (!dropdown) return;
                
                const isOpen = dropdown.classList.contains('show');
                if (isOpen) {
                    dropdown.classList.remove('show');
                    arrow.textContent = '▼';
                    toggle.classList.remove('open');
                } else {
                    dropdown.classList.add('show');
                    arrow.textContent = '▲';
                    toggle.classList.add('open');
                }
            });
        });
    }

    private setupFilterOptions(): void {
        const options = this.filterManager.calculateFilterOptions(this.items);

        this.createMultiselectFilter('filterTypes', options.sortedTypes, 'type');
        this.createMultiselectFilter('filterRarities', options.sortedRarities, 'rarity');
        this.createMultiselectFilter('filterHeroes', options.sortedHeroes, 'hero');
        this.createMultiselectFilter('filterUnlockSources', options.sortedUnlockSources, 'unlock');
        this.createMultiselectFilter('filterBuffs', options.sortedBuffs, 'buff');
        this.createMultiselectFilter('filterDebuffs', options.sortedDebuffs, 'debuff');
        this.createMultiselectFilter('filterStats', options.sortedStats, 'stat');
        this.createMultiselectFilter('filterSort', ['Rarity Down', 'Rarity Up', 'Alphabet Up', 'Alphabet Down', 'Relevance'], 'sort');

        this.applyFilters();
    }

    private syncChipsWithInput(): void {
        const query = this.filters.searchQuery;
        
        this.container.querySelectorAll('.filter-chip').forEach(chip => {
            const val = (chip as HTMLElement).dataset['value']!;
            const type = (chip as HTMLElement).dataset['groupType']!;
            
            if (type === 'sort') {
                const sortTag = `{${val}}`;
                const escTag = sortTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const hasTag = new RegExp(escTag, 'i').test(query);
                if (hasTag) {
                    chip.classList.add('active');
                } else {
                    chip.classList.remove('active');
                }
                return;
            }

            const typeMapping: Record<string, string> = {
                'Melee Weapon': 'MeleeWeapon',
                'Ranged Weapon': 'RangedWeapon'
            };
            const mappedVal = typeMapping[val] || val.replace(/\s+/g, '');
            const escVal = mappedVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const exactRegex = new RegExp(`\\[\\s*<${escVal}>\\s*\\]`, 'i');
            const negatedExactRegex = new RegExp(`\\[\\s*!<${escVal}>\\s*\\]`, 'i');
            const plainRegex = new RegExp(`\\[\\s*${escVal}\\s*\\]`, 'i');
            const negatedPlainRegex = new RegExp(`\\[\\s*!${escVal}\\s*\\]`, 'i');

            const translatedVal = containerIdToLabel(val, (chip.parentElement as HTMLElement).id);
            const span = chip.querySelector('span');

            chip.className = 'filter-chip';

            if (exactRegex.test(query)) {
                chip.classList.add('active', 'exact');
                if (span) span.innerHTML = `&lt;${translatedVal}&gt;`;
            } else if (negatedExactRegex.test(query)) {
                chip.classList.add('active', 'negated', 'exact');
                if (span) span.innerHTML = `!&lt;${translatedVal}&gt;`;
            } else if (plainRegex.test(query)) {
                chip.classList.add('active', 'plain');
                if (span) span.innerHTML = `${translatedVal}`;
            } else if (negatedPlainRegex.test(query)) {
                chip.classList.add('active', 'negated', 'plain');
                if (span) span.innerHTML = `!${translatedVal}`;
            } else {
                if (span) span.innerHTML = `${translatedVal}`;
                if ((chip.parentElement as HTMLElement).id === 'filterRarities') {
                    chip.classList.add(`rarity-${val.toLowerCase()}`);
                }
            }
        });
    }

    public destroy(): void {
        this.saveState();
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = null;
        }
        this.disconnectInfiniteScroll();
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}

// Помощник перевода названий для кнопок в зависимости от типа
function containerIdToLabel(val: string, containerId: string): string {
    if (containerId === 'filterSort') {
        return t('items_sort_' + val.toLowerCase().replace(' ', '_'));
    }
    return val;
}
