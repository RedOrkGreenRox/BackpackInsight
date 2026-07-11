use std::{env, path::PathBuf};

#[derive(Debug, Clone)]
pub struct AppState {
    pub project_root: PathBuf,
    pub public_base_url: String,
    pub api_secret: Option<String>,
    pub cors_origin: String,
    pub max_body_bytes: usize,
    pub db: Option<db::Db>,
}

impl AppState {
    pub async fn discover() -> Result<Self, String> {
        let project_root = discover_project_root()?;
        let api_secret =
            read_non_empty_env("ROOT_API_SECRET").or_else(|| read_non_empty_env("API_SECRET"));
        let env_name = env::var("ROOT_ENV").unwrap_or_else(|_| "development".to_string());
        let production = env_name == "production";
        let allow_no_secret = env::var("ROOT_ALLOW_NO_SECRET")
            .map(|value| value == "true" || value == "1")
            .unwrap_or(false);

        if production && api_secret.is_none() && !allow_no_secret {
            return Err(
                "ROOT_ENV=production requires ROOT_API_SECRET/API_SECRET or ROOT_ALLOW_NO_SECRET=true"
                    .to_string(),
            );
        }

        let state = Self {
            project_root,
            public_base_url: env::var("ROOT_PUBLIC_BASE_URL")
                .unwrap_or_else(|_| "https://backpackinsight.pages.dev".to_string()),
            api_secret,
            cors_origin: env::var("ROOT_CORS_ORIGIN")
                .or_else(|_| env::var("CORS_ORIGIN"))
                .unwrap_or_else(|_| "https://backpackinsight.pages.dev".to_string()),
            max_body_bytes: env::var("ROOT_MAX_BODY_BYTES")
                .ok()
                .and_then(|value| value.parse::<usize>().ok())
                .unwrap_or(1024 * 1024),
            db: db::Db::connect_from_env_if_enabled().await?,
        };
        state.verify_required_packs()?;
        Ok(state)
    }

    fn verify_required_packs(&self) -> Result<(), String> {
        let generated = self.project_root.join("RBackend/generated");
        let required = [
            generated.join("catalog_summary.fb"),
            generated.join("api_items_en.fb"),
            generated.join("api_items_ru.fb"),
        ];
        let missing = required
            .iter()
            .filter(|path| !path.exists())
            .map(|path| path.display().to_string())
            .collect::<Vec<_>>();
        if missing.is_empty() {
            Ok(())
        } else {
            Err(format!(
                "RBackend api requires generated packs: {missing:?}"
            ))
        }
    }
}

fn discover_project_root() -> Result<PathBuf, String> {
    if let Some(root) = read_non_empty_env("ROOT_PROJECT_ROOT") {
        let path = PathBuf::from(root);
        if path.exists() {
            return Ok(path);
        }
        return Err(format!(
            "ROOT_PROJECT_ROOT does not exist: {}",
            path.display()
        ));
    }

    let mut current = env::current_dir().map_err(|err| err.to_string())?;

    loop {
        if current.join("RBackend").is_dir()
            || (current.join("Backend/DB").is_dir() && current.join("Frontend/Web").is_dir())
        {
            return Ok(current);
        }

        if !current.pop() {
            return Err(
                "could not find project root with RBackend or Backend/DB+Frontend/Web".to_string(),
            );
        }
    }
}

fn read_non_empty_env(key: &str) -> Option<String> {
    env::var(key).ok().filter(|value| !value.trim().is_empty())
}

#[cfg(test)]
mod tests {
    use super::read_non_empty_env;

    #[test]
    fn missing_env_is_none() {
        assert!(read_non_empty_env("ROOT_API_TEST_SHOULD_NOT_EXIST").is_none());
    }
}
