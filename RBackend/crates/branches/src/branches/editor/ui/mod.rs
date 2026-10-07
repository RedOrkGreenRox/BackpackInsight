//! Остров редактора и его части. Всё здесь компилируется и для сервера (каркас
//! страницы), и для WASM (поведение).

mod dom;
mod drag;
mod drop;
mod exchange;
mod field;
mod ghost;
mod input;
mod marks;
mod palette;
mod piece;
mod state;
mod storage;
mod toolbar;

pub mod manager;
