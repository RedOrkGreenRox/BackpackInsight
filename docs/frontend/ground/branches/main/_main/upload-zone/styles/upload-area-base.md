# [Базовая область загрузки (upload-area-base.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/styles/upload-area-base.scss)

## Назначение
Базовые стили зоны загрузки `.upload-area` (dark-glass прямоугольник с пунктирной рамкой, куда перетаскивают/вставляют JSON).

## Задаваемые стили

### `.upload-area`
*   `position: relative` — координаты для absolute `textarea` и `.upload-hint` внутри.
*   Фон/рамка: `background: rgba(0,0,0,0.6)`; `border: 2px dashed rgba(255,255,255,0.4)`; `border-radius:20px`.
*   Размер/раскладка: `min-height:250px; display:flex; align-items:center; justify-content:center`.
*   `margin-bottom:25px`; `cursor:pointer`; `transition: all 0.3s ease`.
*   Внутренняя тень для объёма: `box-shadow: inset 0 0 20px rgba(0,0,0,0.5)`.

## AI-контекст
*   Пунктирная рамка (`dashed`) — общепринятый сигнал drop-зоны. Hover/состояния и адаптив лежат в соседних файлах `styles/`.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
