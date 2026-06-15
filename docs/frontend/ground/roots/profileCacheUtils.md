# [Кеш профилей (profileCacheUtils.ts)](../../../../Frontend/Web/ground/roots/profileCacheUtils.ts)

## Назначение
Статический класс `ProfileCacheUtils` управляет жизненным циклом кеша **просматриваемого профиля** в браузерных хранилищах. Задача — не потерять данные профиля при SPA-навигации и возврате «Назад», но корректно очищать «мусор», когда профиль действительно больше не нужен.

## Связи (Dependencies)
*   **Браузерные хранилища**: напрямую работает с `sessionStorage` (ключи `currentProfileData`, `profileDynamicState`, `profileItemsList`) и `localStorage` (ключ `profileDynamicState`).
*   [Генератор UI (Gen.ts)](Gen.md): роутер вызывает `clearCacheOnNavigation(state)` при переходах, передавая объект `history.state`.
*   [Менеджер отправки (SubmitManager)](../branches/main/_main/managers/submit/SubmitManager.md): после успешного анализа профиля кладёт свежие данные в кеш, который читают эти утилиты.

## Подробное описание методов

### `static clearAllProfileCache(): void`
*   Удаляет `currentProfileData`, `profileDynamicState`, `profileItemsList` из `sessionStorage` и `profileDynamicState` из `localStorage`.
*   Вся операция в `try/catch` — сбой доступа к хранилищу (приватный режим) логируется, но не роняет приложение.

### `static hasProfileCache(): boolean`
*   Возвращает `true`, если присутствует хотя бы один из ключей: `currentProfileData`/`profileDynamicState` в `sessionStorage` или `profileDynamicState` в `localStorage`.

### `static clearCacheOnNavigation(state?: any): void` — **КЛЮЧЕВАЯ ЛОГИКА**
*   Очищает кеш **только** если профиль ещё ни разу не загружался, и никогда — при возврате назад или внутренней навигации.
*   **Три сценария перехода на `/profile`** (описаны в коде):
    1.  **Форма отправлена** — в `state` есть `nickname`/`level` → данные свежие, кеш **не трогаем**.
    2.  **Возврат «Назад»** из `/profile/item/:name` — в `state` только `scrollY` → кеш живой, **не сбрасываем**.
    3.  **Переход из сайдбара** (`navigate()`) — `state` пустой/только `scrollY` → сбрасывать **нельзя**, иначе профиль потеряется.
*   **Итоговое правило**: реальная очистка происходит только когда в `sessionStorage` нет `currentProfileData`.

## AI-контекст
*   **Конфиденциальность**: данные профиля живут только локально в браузере и недоступны другим.
*   **Опасность регрессий**: наивный `clearAllProfileCache()` на каждом заходе на `/profile` сломает кнопку «Назад» и SPA-навигацию. Всегда идите через `clearCacheOnNavigation`.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации.
