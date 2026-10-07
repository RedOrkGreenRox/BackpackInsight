//! Проверка «страница докручена почти до конца» для бесконечной прокрутки каталога.

/// Сколько пикселей до низа страницы считается «почти у конца».
#[cfg(feature = "hydrate")]
const THRESHOLD_PX: f64 = 800.0;

/// `true`, если до нижнего края документа осталось меньше [`THRESHOLD_PX`].
/// На сервере всегда `false`.
#[must_use]
pub fn near_bottom() -> bool {
    #[cfg(feature = "hydrate")]
    {
        use leptos::prelude::{document, window};
        let window = window();
        let viewport = window
            .inner_height()
            .ok()
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        let scrolled = window.scroll_y().unwrap_or(0.0);
        let height = document()
            .document_element()
            .map_or(0.0, |root| f64::from(root.scroll_height()));
        viewport + scrolled >= height - THRESHOLD_PX
    }
    #[cfg(not(feature = "hydrate"))]
    false
}
