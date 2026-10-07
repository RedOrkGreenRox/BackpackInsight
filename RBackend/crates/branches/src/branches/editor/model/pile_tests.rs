//! Тесты склада с гравитацией на тестовом наборе из [`board_tests`](super::board_tests).

use super::{
    board_tests::{kit, BAG, MELON, SPORE, STICK},
    Kit, Pile,
};

/// Ширина склада в тестах, клеток.
const WIDTH: f64 = 8.0;

/// Гоняет шаги, пока всё не ляжет (не дольше 10 секунд).
fn settle(pile: &mut Pile, kit: &Kit) {
    for _ in 0..600 {
        if !pile.step(kit, WIDTH, 1.0 / 60.0) {
            return;
        }
    }
    panic!("pile never settled");
}

#[test]
fn falls_to_the_floor() {
    let kit = kit();
    let mut pile = Pile::default();
    pile.reconcile(&kit, &[SPORE], Some((3.0, 5.0)), WIDTH);
    settle(&mut pile, &kit);
    assert!((pile.bodies[0].x - 3.0).abs() < 1e-9);
    assert!(pile.bodies[0].y.abs() < 1e-9);
}

#[test]
fn stacks_on_other_pieces() {
    let kit = kit();
    let mut pile = Pile::default();
    pile.reconcile(&kit, &[MELON], Some((2.0, 0.0)), WIDTH);
    // Спора над правой половиной арбуза ложится на него, палка рядом — на дно.
    pile.reconcile(&kit, &[MELON, SPORE], Some((3.4, 6.0)), WIDTH);
    pile.reconcile(&kit, &[MELON, SPORE, STICK], Some((6.0, 6.0)), WIDTH);
    settle(&mut pile, &kit);
    assert!((pile.bodies[1].y - 2.0).abs() < 1e-9);
    assert!(pile.bodies[2].y.abs() < 1e-9);
    assert!((pile.rows(&kit) - 4.0).abs() < 1e-9);
}

#[test]
fn spawn_inside_a_piece_is_lifted_out() {
    let kit = kit();
    let mut pile = Pile::default();
    pile.reconcile(&kit, &[BAG, BAG], Some((1.0, 0.0)), WIDTH);
    assert!((pile.bodies[1].y - 2.0).abs() < 1e-9);
}

#[test]
fn taking_from_below_lets_the_rest_fall() {
    let kit = kit();
    let mut pile = Pile::default();
    pile.reconcile(&kit, &[MELON, SPORE], Some((0.0, 0.0)), WIDTH);
    assert!((pile.bodies[1].y - 2.0).abs() < 1e-9);
    pile.reconcile(&kit, &[SPORE], None, WIDTH);
    settle(&mut pile, &kit);
    assert!(pile.bodies[0].y.abs() < 1e-9);
}

#[test]
fn without_a_hint_new_pieces_line_up_above_the_pile() {
    let kit = kit();
    let mut pile = Pile::default();
    pile.reconcile(&kit, &[MELON, MELON, MELON, MELON, MELON], None, WIDTH);
    settle(&mut pile, &kit);
    assert!(pile.bodies.iter().all(|b| b.x + 2.0 <= WIDTH + 1e-9));
    assert!((pile.rows(&kit) - 5.0).abs() < 1e-9);
}
