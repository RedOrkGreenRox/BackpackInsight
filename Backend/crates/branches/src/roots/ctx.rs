//! `BranchCtx` — всё, что ветке нужно знать о запросе: путь, параметры, query, язык,
//! каталог и словарь.

use super::{
    request::{parse_cookies, parse_query, resolve_lang, LANG_COOKIE},
    Dict, Params,
};
use crate::{
    catalog::{CatalogHandle, LangCatalog},
    model::Lang,
};
use axum::http::{header, request::Parts, HeaderValue};
use leptos::prelude::*;
use leptos_axum::ResponseOptions;

/// Контекст ветки для одного запроса.
#[derive(Clone, Debug)]
pub struct BranchCtx {
    /// Язык ответа.
    pub lang: Lang,
    /// Путь запроса без query.
    pub path: String,
    /// Переход внутри сайта через islands router (заголовок `Islands-Router`),
    /// а не первая загрузка страницы.
    pub navigation: bool,
    params: Params,
    query: Vec<(String, String)>,
    cookies: Vec<(String, String)>,
    catalog: CatalogHandle,
    dict: Dict,
}

impl BranchCtx {
    /// Собирает контекст из текущего запроса Leptos (`Parts`, каталог и словарь в контексте).
    /// Если язык пришёл в `?lang=`, запоминает его в cookie.
    pub fn current() -> Self {
        let parts = use_context::<Parts>();
        let path = parts
            .as_ref()
            .map_or_else(|| "/".into(), |p| p.uri.path().to_string());
        let query = parse_query(parts.as_ref().and_then(|p| p.uri.query()));
        let navigation = parts
            .as_ref()
            .is_some_and(|p| p.headers.contains_key("Islands-Router"));
        let cookies = parts
            .as_ref()
            .map(|p| parse_cookies(&p.headers))
            .unwrap_or_default();
        let (lang, remember) = parts
            .as_ref()
            .map(|p| resolve_lang(&query, &p.headers))
            .unwrap_or_default();
        if let Some(response) = use_context::<ResponseOptions>() {
            response.append_header(
                header::VARY,
                HeaderValue::from_static("Cookie, Accept-Language"),
            );
        }
        if remember {
            set_cookie(&format!(
                "{LANG_COOKIE}={}; Path=/; Max-Age=31536000; SameSite=Lax",
                lang.code()
            ));
        }
        Self {
            lang,
            path,
            navigation,
            params: Params::new(),
            query,
            cookies,
            catalog: expect_context::<CatalogHandle>(),
            dict: expect_context::<Dict>(),
        }
    }

    /// Тот же контекст с параметрами пути, найденными `Gen`.
    #[must_use]
    pub fn with_params(mut self, params: Params) -> Self {
        self.params = params;
        self
    }

    /// Параметр пути (`:slug`).
    #[must_use]
    pub fn param(&self, name: &str) -> Option<&str> {
        self.params
            .iter()
            .find(|(key, _)| *key == name)
            .map(|(_, value)| value.as_str())
    }

    /// Первое значение query-параметра.
    #[must_use]
    pub fn query(&self, name: &str) -> Option<&str> {
        self.query
            .iter()
            .find(|(key, _)| key == name)
            .map(|(_, value)| value.as_str())
    }

    /// Значение cookie из запроса.
    #[must_use]
    pub fn cookie(&self, name: &str) -> Option<&str> {
        self.cookies
            .iter()
            .find(|(key, _)| key == name)
            .map(|(_, value)| value.as_str())
    }

    /// Запоминает значение в cookie на время сессии браузера.
    pub fn remember(&self, name: &str, value: &str) {
        set_cookie(&format!("{name}={value}; Path=/; SameSite=Lax"));
    }

    /// Каталог на языке запроса.
    #[must_use]
    pub fn catalog(&self) -> &LangCatalog {
        self.catalog.0.lang(self.lang)
    }

    /// Перевод ключа на язык запроса.
    #[must_use]
    pub fn t(&self, key: &str) -> String {
        self.dict.t(self.lang, key)
    }

    /// Перевод с подстановкой.
    #[must_use]
    pub fn tf(&self, key: &str, args: &[(&str, &str)]) -> String {
        self.dict.tf(self.lang, key, args)
    }

    /// Задаёт HTTP-статус ответа (например, 404).
    pub fn set_status(&self, status: axum::http::StatusCode) {
        if let Some(response) = use_context::<ResponseOptions>() {
            response.set_status(status);
        }
    }
}

/// Добавляет заголовок `Set-Cookie` к ответу.
fn set_cookie(cookie: &str) {
    if let (Some(response), Ok(value)) = (
        use_context::<ResponseOptions>(),
        HeaderValue::from_str(cookie),
    ) {
        response.append_header(header::SET_COOKIE, value);
    }
}
