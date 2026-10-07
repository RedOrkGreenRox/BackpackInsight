//! Касания тел склада ([`Pile`](super::pile::Pile)): форма тела, подъём из пересечения
//! и опора снизу. Клетки — единичные квадраты; соседние по стороне не пересекаются.

use super::{cell::Cell, kit::Kit, pile::Body};

/// Допуск сравнения координат.
pub const EPS: f64 = 1e-6;

/// Клетки формы `Up` со сдвигом: левая нижняя клетка охвата — `(0, 0)`.
#[must_use]
pub fn shape(kit: &Kit, piece: usize) -> Vec<Cell> {
    let item = kit.item(piece);
    let min = item.bounds().min;
    let cells: Vec<Cell> = item.shape.iter().map(|c| c.minus(min)).collect();
    if cells.is_empty() {
        vec![Cell::default()]
    } else {
        cells
    }
}

/// Ширина формы в клетках.
#[must_use]
pub fn width_of(kit: &Kit, piece: usize) -> f64 {
    f64::from(kit.item(piece).bounds().width())
}

/// Наименьший `y` не ниже `body.y`, при котором тело не пересекается с `others`.
#[must_use]
pub fn free_y(body: &Body, cells: &[Cell], others: &[(&Body, Vec<Cell>)]) -> f64 {
    let mut y = body.y;
    for _ in 0..64 {
        let hit = others.iter().flat_map(|(o, oc)| {
            oc.iter().flat_map(move |d| {
                cells.iter().filter_map(move |c| {
                    let (ax, ay) = (body.x + f64::from(c.x), y + f64::from(c.y));
                    let (bx, by) = (o.x + f64::from(d.x), o.y + f64::from(d.y));
                    let overlap = (ax - bx).abs() < 1.0 - EPS && (ay - by).abs() < 1.0 - EPS;
                    overlap.then(|| by + 1.0 - f64::from(c.y))
                })
            })
        });
        match hit.fold(None, |m: Option<f64>, v| Some(m.map_or(v, |m| m.max(v)))) {
            Some(raised) => y = raised,
            None => break,
        }
    }
    y
}

/// Наименьший `y`, до которого тело может упасть: дно или клетки других тел под ним.
#[must_use]
pub fn floor(body: &Body, cells: &[Cell], others: &[(&Body, Vec<Cell>)]) -> f64 {
    let mut floor: f64 = 0.0;
    for (o, oc) in others {
        for d in oc {
            for c in cells {
                let (ax, ay) = (body.x + f64::from(c.x), body.y + f64::from(c.y));
                let (bx, top) = (o.x + f64::from(d.x), o.y + f64::from(d.y) + 1.0);
                if (ax - bx).abs() < 1.0 - EPS && top <= ay + EPS {
                    floor = floor.max(top - f64::from(c.y));
                }
            }
        }
    }
    floor
}
