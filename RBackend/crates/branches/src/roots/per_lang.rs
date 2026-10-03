//! Острова, зависящие от языка.
//!
//! Islands router Leptos при переходе обновляет серверный HTML, но острова не
//! трогает, чтобы не потерять их состояние. Если пропсы острова зависят от языка,
//! его оборачивают в [`per_lang`]: у разных языков разные ветки разметки, и
//! router при смене языка заменяет остров целиком.

use crate::model::Lang;
use leptos::either::Either;

/// Своя ветка разметки для каждого языка.
pub fn per_lang<V>(lang: Lang, view: V) -> Either<V, V> {
    match lang {
        Lang::En => Either::Left(view),
        Lang::Ru => Either::Right(view),
    }
}
