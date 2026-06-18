import { RuntimeFilterOptions } from './filter-options-controller';

export class ItemsHelpController {
  constructor(private readonly container: HTMLElement) {}

  public renderAdvancedHelp(options: RuntimeFilterOptions): void {
    const target = this.container.querySelector('#advancedSearchHelpContent');
    if (!target) return;
    const list = (values: string[]) => values.map(v => `<code>${this.escapeHtml(v)}</code>`).join(' ');
    const examples = ['[<Knife>] | [<Dagger>]', '[Poison] & [<Dagger>]', '![<Purchasable>]', '1 < cooldown < 5', 'damageMax > 10 & [<MeleeWeapon>]', '([Poison] | [Burn]) & ![<Boon>]'];
    target.innerHTML = `
        <h3>Как работает поиск</h3>
        <p><b>Обычный режим:</b> строка сверху ищет только текстом по уже отфильтрованному списку. Теги выбираются кнопками: первый клик — зелёный «Искать», второй — красный «Исключить», третий — убрать.</p>
        <p><b>Продвинутый режим:</b> можно писать формулу руками. Это быстрее кнопок, если привыкнуть: вставил текст, нажал Enter — получил токены.</p>
        <ul>
            <li><code>[Poison]</code> — <b>умный НЕ точный тег</b>: ищет термин шире, через описания, иконки и алиасы. Хорошо для эффектов вроде Poison/Burn.</li>
            <li><code>[&lt;Knife&gt;]</code> — <b>конкретный точный тег</b>: только точный тип/герой/редкость/флаг. В списках «Искать/Исключить» все теги работают именно так.</li>
            <li><code>!</code> / <code>НЕ</code> / <code>NOT</code> — исключить: <code>![&lt;Purchasable&gt;]</code>.</li>
            <li><code>&amp;</code> / <code>И</code> / <code>AND</code> — оба условия: <code>[Poison] &amp; [&lt;Dagger&gt;]</code>.</li>
            <li><code>|</code> / <code>ИЛИ</code> / <code>OR</code> — любое условие: <code>[&lt;Knife&gt;] | [&lt;Dagger&gt;]</code>.</li>
            <li><code>[ ]</code> — группа условий. Двойной клик по токену возвращает сырой текст.</li>
            <li>Сравнения: <code>damageMax &gt; 10</code>, <code>1 &lt; cooldown &lt; 5</code>, <code>accuracy &gt;= 80</code>, <code>cost &lt;= 5</code>.</li>
            <li>Сортировка в обычном UI задаётся тремя приоритетами. В тексте также работают: <code>{rarity down}</code>, <code>{rarity up}</code>, <code>{alphabet up}</code>, <code>{alphabet down}</code>, <code>{relevance}</code>.</li>
        </ul>
        <h3>Примеры — можно скопировать</h3>
        ${examples.map(example => `<div class="copy-example"><code>${this.escapeHtml(example)}</code><button class="copy-query-btn" data-copy="${this.escapeAttr(example)}">Копировать</button></div>`).join('')}
        <h3>Теги из текущей базы</h3>
        <p><b>Типы:</b> ${list(options.sortedTypes)}</p>
        <p><b>Редкости:</b> ${list(options.sortedRarities)}</p>
        <p><b>Герои:</b> ${list(options.sortedHeroes)}</p>
        <p><b>Источники:</b> ${list(options.sortedUnlockSources)}</p>
        <p><b>Баффы:</b> ${list(options.sortedBuffs)}</p>
        <p><b>Дебаффы:</b> ${list(options.sortedDebuffs)}</p>
        <p><b>Статы/термины:</b> ${list(options.sortedStats)} <code>damageMin</code> <code>damageMax</code> <code>criticalChance</code> <code>criticalDamage</code> <code>staminaCost</code> <code>coinValue</code></p>
        <p><b>Флаги:</b> ${list(options.sortedFlags)}</p>
    `;
  }

  private escapeHtml(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  private escapeAttr(value: string): string {
    return this.escapeHtml(value);
  }
}
