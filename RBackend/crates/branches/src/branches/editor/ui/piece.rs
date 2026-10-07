//! Картинка предмета на поле, на складе и под пальцем.
//!
//! Картинка нарисована для поворота `Up` и покрывает охват формы. Блок снаружи
//! занимает охват повёрнутой формы, картинка внутри стоит по центру и
//! поворачивается CSS-трансформацией. Размеры — в `var(--cell)`.

use crate::{
    branches::editor::model::{Bounds, KitItem, Orientation, HEIGHT},
    model::ItemImage,
};
use leptos::prelude::*;

/// Заглушка, если у предмета нет картинки.
const PLACEHOLDER: &str = "/images/placeholder/placeholder";

/// `left/top/width/height` блока в клетках поля (строки считаются сверху).
#[must_use]
pub fn box_style(b: Bounds) -> String {
    format!(
        "left:calc(var(--cell)*{});top:calc(var(--cell)*{});width:calc(var(--cell)*{});height:calc(var(--cell)*{})",
        b.min.x,
        HEIGHT - 1 - b.max.y,
        b.width(),
        b.height()
    )
}

/// `width/height` блока размером `width × height` клеток.
#[must_use]
pub fn size_style(width: i16, height: i16) -> String {
    format!("width:calc(var(--cell)*{width});height:calc(var(--cell)*{height})")
}

/// Картинка предмета `item`, повёрнутая на `orient`, по центру родительского блока.
#[component]
#[allow(clippy::must_use_candidate)]
pub fn PieceArt(item: KitItem, orient: Orientation) -> impl IntoView {
    let b = item.bounds();
    let style = format!(
        "{};transform:translate(-50%,-50%) rotate({}deg)",
        size_style(b.width(), b.height()),
        u16::from(orient.turns()) * 90
    );
    let [avif, webp] = ["avif", "webp"].map(|format| srcset(&item.image, format));
    view! {
        <div class="ed-art" style=style>
            <picture>
                <source srcset=avif r#type="image/avif"/>
                <img srcset=webp alt=item.name draggable="false" decoding="async"/>
            </picture>
        </div>
    }
}

/// Картинка в формате `format`: клетка 60 px и 120 px для экранов 2x.
fn srcset(image: &ItemImage, format: &str) -> String {
    if image.is_empty() {
        format!("{PLACEHOLDER}.{format}")
    } else {
        format!(
            "/images/{}.{format} 1x, /images/{}.{format} 2x",
            image.x1, image.x2
        )
    }
}
