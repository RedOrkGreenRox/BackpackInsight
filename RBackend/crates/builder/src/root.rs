use std::{env, path::PathBuf};

pub fn find_project_root() -> Result<PathBuf, String> {
    let mut current = env::current_dir().map_err(|err| err.to_string())?;

    loop {
        if current.join("Backend/DB").is_dir() && current.join("Frontend/Web").is_dir() {
            return Ok(current);
        }
        if !current.pop() {
            return Err("could not find project root with Backend/DB and Frontend/Web".to_string());
        }
    }
}
