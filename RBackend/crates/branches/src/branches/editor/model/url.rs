//! Короткая запись билда для адреса страницы: `/editor?h=Mycella&b=…&s=…`.
//!
//! - `b` — поле: записи `слаг.XYО` через `~`, где `X` и `Y` — цифры клетки,
//!   `О` — поворот (`u`, `r`, `d`, `l`): `medium-bag.72l~spore.43u`;
//! - `s` — склад: слаги через `~`;
//! - `h` — герой.
//!
//! Все символы безопасны в адресе и не кодируются. Неизвестный слаг пропускается.

use super::{board::Board, cell::Cell, kit::Kit, orientation::Orientation, placed::Placed};
use serde::{Deserialize, Serialize};

/// Параметры билда из адреса, как их прочитал сервер.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct UrlCode {
    /// `h` — герой.
    pub hero: String,
    /// `b` — поле.
    pub field: String,
    /// `s` — склад.
    pub storage: String,
}

/// Разделитель записей.
const SEP: char = '~';

/// Буква поворота.
fn letter(orient: Orientation) -> char {
    match orient {
        Orientation::Up => 'u',
        Orientation::Right => 'r',
        Orientation::Down => 'd',
        Orientation::Left => 'l',
    }
}

/// Поворот по букве.
fn from_letter(letter: char) -> Option<Orientation> {
    match letter {
        'u' => Some(Orientation::Up),
        'r' => Some(Orientation::Right),
        'd' => Some(Orientation::Down),
        'l' => Some(Orientation::Left),
        _ => None,
    }
}

/// Параметр `b`: сначала сумки, потом предметы.
#[must_use]
pub fn encode_field(kit: &Kit, board: &Board) -> String {
    board
        .bags
        .iter()
        .chain(&board.items)
        .map(|p| {
            format!(
                "{}.{}{}{}",
                kit.item(p.piece).slug,
                p.pos.x,
                p.pos.y,
                letter(p.orient)
            )
        })
        .collect::<Vec<_>>()
        .join(&SEP.to_string())
}

/// Параметр `s`.
#[must_use]
pub fn encode_storage(kit: &Kit, board: &Board) -> String {
    board
        .storage
        .iter()
        .map(|&piece| kit.item(piece).slug.as_str())
        .collect::<Vec<_>>()
        .join(&SEP.to_string())
}

/// Одна запись поля: `слаг.XYО`.
fn entry(kit: &Kit, raw: &str) -> Option<Placed> {
    let (slug, code) = raw.rsplit_once('.')?;
    let mut chars = code.chars();
    let x = chars.next()?.to_digit(10)?;
    let y = chars.next()?.to_digit(10)?;
    let orient = from_letter(chars.next()?)?;
    if chars.next().is_some() {
        return None;
    }
    Some(Placed {
        piece: kit.by_slug(slug)?,
        pos: Cell::new(i16::try_from(x).ok()?, i16::try_from(y).ok()?),
        orient,
    })
}

/// Собирает поле и склад из параметров `b` и `s` по правилам поля.
#[must_use]
pub fn decode(kit: &Kit, field: &str, storage: &str) -> Board {
    let mut board = Board::default();
    let (bags, items): (Vec<Placed>, Vec<Placed>) = field
        .split(SEP)
        .filter_map(|raw| entry(kit, raw))
        .partition(|p| kit.item(p.piece).is_bag());
    for placed in bags.into_iter().chain(items) {
        board.put(kit, placed);
    }
    board
        .storage
        .extend(storage.split(SEP).filter_map(|slug| kit.by_slug(slug)));
    board
}
