//! [`Pile`] — склад с гравитацией: предметы падают и ложатся друг на друга.
//!
//! Единица длины — клетка склада; `x` растёт от левой стенки, `y` — вверх от дна.
//! Предметы не поворачиваются и не кувыркаются: каждый лежит формой `Up`, падает
//! вертикально и останавливается на дне или на клетках других предметов.
//! Тела идут в том же порядке, что `Board::storage`: номер тела — номер на складе.

use super::{
    contact::{floor, free_y, shape, width_of, EPS},
    kit::Kit,
};

/// Ускорение падения, клеток/с².
const GRAVITY: f64 = 60.0;
/// Наибольшая скорость падения, клеток/с.
const MAX_SPEED: f64 = 30.0;
/// Высота пустого склада, клеток.
pub const MIN_ROWS: f64 = 2.0;

/// Предмет на складе.
#[derive(Clone, Debug, PartialEq)]
pub struct Body {
    /// Номер предмета в наборе.
    pub piece: usize,
    /// Левый край охвата формы.
    pub x: f64,
    /// Нижний край охвата формы.
    pub y: f64,
    /// Скорость по вертикали (вниз — меньше нуля).
    pub vy: f64,
}

/// Все тела склада.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Pile {
    /// Тела в порядке склада.
    pub bodies: Vec<Body>,
}

impl Pile {
    /// Тела по списку склада `storage`: прежние остаются на месте, новые появляются в
    /// `spawn` (левый нижний угол, клетки) или, без подсказки, над кучей слева направо.
    pub fn reconcile(
        &mut self,
        kit: &Kit,
        storage: &[usize],
        spawn: Option<(f64, f64)>,
        width: f64,
    ) {
        let mut old: Vec<Option<Body>> = std::mem::take(&mut self.bodies)
            .into_iter()
            .map(Some)
            .collect();
        let mut slots: Vec<Option<Body>> = storage
            .iter()
            .map(|&piece| {
                old.iter_mut()
                    .find(|b| b.as_ref().is_some_and(|b| b.piece == piece))?
                    .take()
            })
            .collect();
        let mut next_x = 0.0;
        for i in 0..slots.len() {
            if slots[i].is_some() {
                continue;
            }
            let piece = storage[i];
            let w = width_of(kit, piece);
            let (x, y) = spawn.unwrap_or_else(|| {
                if next_x + w > width + EPS {
                    next_x = 0.0;
                }
                let x = next_x;
                next_x += w;
                (x, Self::top_of(kit, slots.iter().flatten()) + 1.0)
            });
            let mut body = Body {
                piece,
                x: x.clamp(0.0, (width - w).max(0.0)),
                y: y.max(0.0),
                vy: 0.0,
            };
            let others: Vec<_> = slots
                .iter()
                .flatten()
                .map(|o| (o, shape(kit, o.piece)))
                .collect();
            body.y = free_y(&body, &shape(kit, piece), &others);
            slots[i] = Some(body);
        }
        self.bodies = slots.into_iter().flatten().collect();
    }

    /// Один шаг на `dt` секунд в складе шириной `width` клеток; `true`, пока что-то падает.
    pub fn step(&mut self, kit: &Kit, width: f64, dt: f64) -> bool {
        let mut order: Vec<usize> = (0..self.bodies.len()).collect();
        order.sort_by(|&a, &b| self.bodies[a].y.total_cmp(&self.bodies[b].y));
        let mut moving = false;
        for i in order {
            let piece = self.bodies[i].piece;
            let cells = shape(kit, piece);
            let max_x = (width - width_of(kit, piece)).max(0.0);
            self.bodies[i].x = self.bodies[i].x.clamp(0.0, max_x);
            let others: Vec<_> = (self.bodies.iter().enumerate())
                .filter(|&(j, _)| j != i)
                .map(|(_, o)| (o, shape(kit, o.piece)))
                .collect();
            let lifted = free_y(&self.bodies[i], &cells, &others);
            let low = floor(
                &Body {
                    y: lifted,
                    ..self.bodies[i].clone()
                },
                &cells,
                &others,
            );
            let body = &mut self.bodies[i];
            body.y = lifted;
            body.vy = (body.vy - GRAVITY * dt).max(-MAX_SPEED);
            let next = body.y + body.vy * dt;
            if next <= low {
                body.y = low;
                body.vy = 0.0;
            } else {
                body.y = next;
                moving = true;
            }
        }
        moving
    }

    /// Высота склада в клетках: куча плюс строка сверху, не ниже [`MIN_ROWS`].
    #[must_use]
    pub fn rows(&self, kit: &Kit) -> f64 {
        (Self::top_of(kit, self.bodies.iter()).ceil() + 1.0).max(MIN_ROWS)
    }

    /// Верх самого высокого тела.
    fn top_of<'a>(kit: &Kit, bodies: impl Iterator<Item = &'a Body>) -> f64 {
        bodies
            .map(|b| b.y + f64::from(kit.item(b.piece).bounds().height()))
            .fold(0.0, f64::max)
    }
}
