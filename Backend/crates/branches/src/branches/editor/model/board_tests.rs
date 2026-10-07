//! Тесты правил поля на маленьком наборе из настоящих форм 7.0.0.

use super::{Board, Cell, Kit, KitItem, Orientation, Placed};

/// Номера предметов тестового набора.
pub const SAC: usize = 0;
pub const BAG: usize = 1;
pub const STICK: usize = 2;
pub const MELON: usize = 3;
pub const SPORE: usize = 4;

fn item(id: &str, bag: bool, shape: &[(i16, i16)]) -> KitItem {
    KitItem {
        id: id.to_owned(),
        slug: id.to_lowercase().replace([' ', '\''], "-"),
        name: id.to_owned(),
        types: vec![if bag { "Bag" } else { "Food" }.to_owned()],
        shape: shape.iter().map(|&(x, y)| Cell::new(x, y)).collect(),
        ..KitItem::default()
    }
}

/// Сак споровяза 2×3, средняя сумка 2×2, палка 1×2, арбуз 2×2, спора 1×1.
pub fn kit() -> Kit {
    let sac = [(0, 0), (0, 1), (0, 2), (1, 2), (1, 1), (1, 0)];
    Kit::new(
        "7.0.0".to_owned(),
        vec![
            item("Sporeweaver's Sac", true, &sac),
            item("Medium Bag", true, &[(0, 0), (0, 1), (1, 1), (1, 0)]),
            item("Wooden Stick", false, &[(0, 0), (0, 1)]),
            item("Watermelon", false, &[(0, 0), (1, 0), (0, 1), (1, 1)]),
            item("Spore", false, &[(0, 0)]),
        ],
    )
}

pub fn at(piece: usize, x: i16, y: i16, orient: Orientation) -> Placed {
    Placed {
        piece,
        pos: Cell::new(x, y),
        orient,
    }
}

#[test]
fn rotation_matches_the_game_export() {
    let kit = kit();
    let bag = at(BAG, 7, 2, Orientation::Left);
    let cells = [
        Cell::new(7, 2),
        Cell::new(6, 2),
        Cell::new(6, 3),
        Cell::new(7, 3),
    ];
    assert_eq!(bag.cells(&kit), cells);
    let stick = at(STICK, 7, 3, Orientation::Down);
    assert_eq!(stick.cells(&kit), [Cell::new(7, 3), Cell::new(7, 2)]);
}

#[test]
fn items_need_bags_and_stay_on_the_field() {
    let kit = kit();
    let mut board = Board::default();
    assert!(!board.fits(&kit, &at(SPORE, 0, 0, Orientation::Up)));
    assert!(!board.fits(&kit, &at(BAG, 8, 0, Orientation::Up)));
    assert!(board.put(&kit, at(BAG, 0, 0, Orientation::Up)));
    assert!(board.put(&kit, at(SPORE, 1, 1, Orientation::Up)));
    assert!(!board.fits(&kit, &at(STICK, 1, 1, Orientation::Up)));
}

#[test]
fn placing_over_items_and_bags_kicks_them_to_storage() {
    let kit = kit();
    let mut board = Board::default();
    board.put(&kit, at(BAG, 0, 0, Orientation::Up));
    board.put(&kit, at(SPORE, 0, 0, Orientation::Up));
    board.put(&kit, at(MELON, 0, 0, Orientation::Up));
    assert_eq!(board.storage, [SPORE]);
    board.put(&kit, at(BAG, 1, 0, Orientation::Up));
    assert!(board.items.is_empty());
    assert_eq!(board.storage, [SPORE, BAG, MELON]);
}

#[test]
fn bags_carry_items_and_bag_mode_leaves_them() {
    let kit = kit();
    let mut board = Board::default();
    board.put(&kit, at(BAG, 0, 0, Orientation::Up));
    board.put(&kit, at(STICK, 0, 0, Orientation::Up));
    let (bag, carried) = board.lift_bag(&kit, 0).unwrap_or_else(|| panic!("no bag"));
    let to = at(BAG, 5, 3, Orientation::Right);
    let moved: Vec<Placed> = carried.iter().map(|it| it.carried(&bag, &to)).collect();
    board.drop_bag(&kit, to, moved);
    assert_eq!(board.items.len(), 1);
    assert!(board.items[0]
        .cells(&kit)
        .iter()
        .all(|c| to.cells(&kit).contains(c)));

    board.set_bag_mode(&kit, true);
    let (_, carried) = board.lift_bag(&kit, 0).unwrap_or_else(|| panic!("no bag"));
    assert!(carried.is_empty());
    board.drop_bag(&kit, at(BAG, 0, 0, Orientation::Up), carried);
    assert_eq!(board.items.len(), 1);
    board.set_bag_mode(&kit, false);
    assert!(board.items.is_empty());
    assert_eq!(board.storage, [STICK]);
}

#[test]
fn reset_drops_bags_in_bag_mode_and_items_otherwise() {
    let kit = kit();
    let mut board = Board::default();
    board.put(&kit, at(SAC, 0, 0, Orientation::Up));
    board.put(&kit, at(SPORE, 0, 0, Orientation::Up));
    board.reset();
    assert_eq!((board.bags.len(), board.storage.clone()), (1, vec![SPORE]));
    board.bag_mode = true;
    board.reset();
    assert!(board.bags.is_empty());
    assert_eq!(board.storage, [SPORE, SAC]);
}
