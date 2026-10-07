//! Модель редактора без браузера и сервера: геометрия поля, набор предметов,
//! правила размещения, фильтры каталога, файл билда и запись в адресе.
//! Всё здесь проверяется обычными тестами.

pub mod board;
pub mod cell;
pub mod contact;
pub mod file;
pub mod filter;
pub mod kit;
pub mod labels;
pub mod orientation;
pub mod pile;
pub mod placed;
pub mod url;

#[cfg(test)]
mod board_tests;
#[cfg(test)]
mod file_tests;
#[cfg(test)]
mod pile_tests;

pub use board::Board;
pub use cell::{place, Bounds, Cell, HEIGHT, WIDTH};
pub use file::BuildFile;
pub use filter::{Filter, Kind, SortBy};
pub use kit::{Kit, KitItem};
pub use labels::EditorLabels;
pub use orientation::Orientation;
pub use pile::{Body, Pile};
pub use placed::Placed;
