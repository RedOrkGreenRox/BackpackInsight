# [Контейнер главной: рендер + стили (container.ts / container.scss)](../../../../../../../Frontend/Web/ground/branches/main/_main/container/container.ts)

> Два файла: [container.ts](../../../../../../../Frontend/Web/ground/branches/main/_main/container/container.ts) (HTML) и [container.scss](../../../../../../../Frontend/Web/ground/branches/main/_main/container/container.scss) (агрегатор стилей).

## Назначение
`ContainerRenderer` генерирует обёртку `.container` с плейсхолдером `{{CONTENT}}`; `container.scss` лишь подключает модульные стили из `styles/`.

## Логика (container.ts)
*   `static render(): string` → `<div class="container">{{CONTENT}}</div>`. Плейсхолдер заменяется собранным контентом на уровне [MainBranch](../../MainBranch.md).

## Стили (container.scss)
*   `@use "styles"` — реальные правила в [styles/index](styles/index.md) ([base](styles/container-base.md) + [responsive](styles/container-responsive.md)).

## AI-контекст
*   Рендер использует строковый плейсхолдер `{{CONTENT}}`. Стили модульны: правьте `styles/*`, не сам `container.scss`.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине; `.ts`+`.scss` одного компонента объединены).
