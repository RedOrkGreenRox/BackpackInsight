# [Заголовок главной: рендер + стили (title.ts / title.scss)](../../../../../../../Frontend/Web/ground/branches/main/_main/title/title.ts)

> Два файла: [title.ts](../../../../../../../Frontend/Web/ground/branches/main/_main/title/title.ts) (HTML) и [title.scss](../../../../../../../Frontend/Web/ground/branches/main/_main/title/title.scss) (агрегатор стилей).

## Назначение
`TitleRenderer` генерирует `<h1 class="main-title">` с переводом; `title.scss` подключает модульные стили из `styles/`.

## Связи (Dependencies)
*   [Локализация (i18n)](../../../../localization/i18n.md): текст через переданную `tFunction('profile_title')`.

## Логика (title.ts)
*   `static render(tFunction): string` → `<h1 class="main-title" data-aos="fade-down">{перевод}</h1>`.

## Стили (title.scss)
*   `@use "styles"` — правила в [styles/index](styles/index.md) ([base](styles/title-base.md) + [responsive](styles/title-responsive.md)).

## AI-контекст
*   Перевод приходит параметром (DI), а не импортом — упрощает тестирование рендера.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине; `.ts`+`.scss` одного компонента объединены).
