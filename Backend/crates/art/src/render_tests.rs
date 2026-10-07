use super::{render, shape_cells, Fit, MASTER_CELL};
use crate::test_kit::TestKit;
use backend_core::Cell;

fn cells(points: &[(i8, i8)]) -> Vec<Cell> {
    points.iter().map(|&(x, y)| Cell { x, y }).collect()
}

#[test]
fn shape_cells_is_bounding_box() {
    assert_eq!(shape_cells(&cells(&[(0, 0)])), (1, 1));
    assert_eq!(
        shape_cells(&cells(&[(0, 0), (1, 0), (1, 1), (1, 2)])),
        (2, 3)
    );
    assert_eq!(shape_cells(&[]), (1, 1));
}

#[test]
fn exact_size_is_kept() {
    let kit = TestKit::new();
    let path = kit.png("a.png", 120, 240, [9, 9, 9, 255]);
    let (img, fit) = render(&[path], (1, 2), None, 90, 0.08).unwrap_or_else(|err| panic!("{err}"));
    assert_eq!(img.dimensions(), (MASTER_CELL, 2 * MASTER_CELL));
    assert_eq!(fit, Fit::Exact);
}

#[test]
fn bag_frame_is_stretched_into_grid() {
    let kit = TestKit::new();
    let path = kit.png("bag.png", 255, 375, [9, 9, 9, 255]);
    let (img, fit) = render(&[path], (2, 3), None, 90, 0.08).unwrap_or_else(|err| panic!("{err}"));
    assert_eq!(img.dimensions(), (240, 360));
    assert_eq!(fit, Fit::Stretched { from: (255, 375) });
}

#[test]
fn crosswise_art_is_rotated() {
    let kit = TestKit::new();
    let path = kit.png("oar.png", 240, 120, [9, 9, 9, 255]);
    let (img, fit) = render(&[path], (1, 2), None, 90, 0.08).unwrap_or_else(|err| panic!("{err}"));
    assert_eq!(img.dimensions(), (120, 240));
    assert_eq!(fit, Fit::Exact);
}

#[test]
fn far_aspect_is_letterboxed() {
    let kit = TestKit::new();
    let path = kit.png("odd.png", 100, 50, [9, 9, 9, 255]);
    let (img, fit) = render(&[path], (1, 1), None, 90, 0.08).unwrap_or_else(|err| panic!("{err}"));
    assert_eq!(img.dimensions(), (120, 120));
    assert_eq!(fit, Fit::Letterboxed { from: (100, 50) });
    assert_eq!(img.get_pixel(60, 0).0[3], 0, "top band stays transparent");
}

#[test]
fn layers_are_centered_on_the_largest() {
    let kit = TestKit::new();
    let base = kit.png("base.png", 120, 120, [0, 0, 255, 255]);
    let stamp = kit.png("stamp.png", 20, 20, [255, 0, 0, 255]);
    let (img, _) =
        render(&[base, stamp], (1, 1), None, 90, 0.08).unwrap_or_else(|err| panic!("{err}"));
    assert_eq!(img.get_pixel(60, 60).0, [255, 0, 0, 255]);
    assert_eq!(img.get_pixel(5, 5).0, [0, 0, 255, 255]);
}
