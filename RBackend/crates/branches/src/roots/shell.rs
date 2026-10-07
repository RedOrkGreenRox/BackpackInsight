//! `Shell` — HTML-каркас документа и корневой компонент [`App`].
//!
//! Разметка каркаса повторяет `Frontend/Web/index.html` TS-версии: кнопка меню и
//! боковая панель, фон с параллаксом, затемнение и `#app` с веткой. Переходы по
//! ссылкам перехватывает islands router: новая страница приходит с сервера, а в
//! DOM меняется только то, что отличается.

use super::{
    chrome::sidebar, split_files::SplitFiles, Backdrop, Branch, BranchCtx, Gen, LazyIslands,
};
use crate::{
    branches::not_found::NotFoundBranch,
    shell::{ParallaxManager, SidebarManager},
};
use leptos::{hydration::HydrationScripts, prelude::*};
use leptos_meta::{provide_meta_context, Body, Html, MetaTags};

/// Документ целиком: `<head>` со стилями и скриптами островов, `<body>` с [`App`].
#[must_use]
pub fn shell(options: LeptosOptions) -> impl IntoView {
    let css = SplitFiles::stylesheet(&options);
    view! {
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta name="theme-color" content="#121212"/>
                <link rel="icon" type="image/svg+xml" href="/images/const/favicon.svg"/>
                <link rel="preload" href="/fonts/Signika-Regular.woff2" r#as="font" r#type="font/woff2" crossorigin="anonymous"/>
                <link rel="stylesheet" href=css/>
                <HydrationScripts options islands=true islands_router=true/>
                <MetaTags/>
            </head>
            <body>
                <App/>
            </body>
        </html>
    }
}

/// Ленивые острова каркаса: они есть на каждой странице.
const SHELL_ISLANDS: &[&str] = &["SidebarManager"];

/// Острова страницы: ветки и каркаса.
fn page_islands(branch: &[&'static str]) -> Vec<&'static str> {
    branch.iter().chain(SHELL_ISLANDS).copied().collect()
}

/// Корневой компонент: выбор ветки и общий каркас страницы.
#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();
    let ctx = BranchCtx::current();
    let (entry, params) = Gen::resolve(&ctx.path);
    let ctx = ctx.with_params(params);
    let not_found = entry.spec.name == NotFoundBranch::SPEC.name;
    let backdrop = Backdrop::choose(&ctx, not_found);
    // `loaded` сразу: в TS-версии body был прозрачным, пока JS не дорисует страницу,
    // а здесь сервер присылает её готовой.
    let body_class = if not_found {
        "loaded error-404"
    } else {
        "loaded"
    };
    view! {
        <Html {..} lang=ctx.lang.code()/>
        <Body {..} class=body_class/>
        {(entry.head)(&ctx).tags(entry.spec.sitemap)}
        {LazyIslands::links(&page_islands(entry.spec.islands))}
        {sidebar(&ctx)}
        <div class="background-image" id="bgImage" aria-hidden="true">
            <picture>
                <source srcset=backdrop.avif r#type="image/avif"/>
                <img src=backdrop.webp id="bgImg" alt="" fetchpriority="high"/>
            </picture>
        </div>
        <ParallaxManager/>
        <SidebarManager/>
        <div class="overlay"></div>
        <main id="app" data-branch=entry.spec.name>{(entry.render)(ctx)}</main>
    }
}
