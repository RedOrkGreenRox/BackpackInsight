//! `Shell` — HTML-каркас документа и корневой компонент [`App`].
//!
//! Разметка каркаса повторяет `Frontend/Web/index.html` TS-версии: кнопка меню и
//! боковая панель, фон с параллаксом, затемнение и `#app` с веткой. Переходы по
//! ссылкам перехватывает islands router: новая страница приходит с сервера, а в
//! DOM меняется только то, что отличается.

use super::{chrome::sidebar, Backdrop, Branch, BranchCtx, Gen};
use crate::{branches::not_found::NotFoundBranch, shell::ParallaxManager};
use leptos::{hydration::HydrationScripts, prelude::*};
use leptos_meta::{provide_meta_context, Body, Html, MetaTags};

/// Документ целиком: `<head>` со стилями и скриптами островов, `<body>` с [`App`].
#[must_use]
pub fn shell(options: LeptosOptions) -> impl IntoView {
    let css = format!("/{}/{}.css", options.site_pkg_dir, options.output_name);
    view! {
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta name="theme-color" content="#121212"/>
                <link rel="icon" type="image/png" href="/images/manifest/png/icon-128x128.png"/>
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
        {sidebar(&ctx)}
        <div class="background-image" id="bgImage" aria-hidden="true">
            <picture>
                <source srcset=backdrop.avif r#type="image/avif"/>
                <img src=backdrop.webp id="bgImg" alt="" fetchpriority="high"/>
            </picture>
        </div>
        <ParallaxManager/>
        <div class="overlay"></div>
        <main id="app" data-branch=entry.spec.name>{(entry.render)(ctx)}</main>
    }
}
