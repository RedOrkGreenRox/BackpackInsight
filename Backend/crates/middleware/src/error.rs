use pack::read_api_error_bytes;
use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ErrorData {
    pub code: String,
    pub detail: String,
    pub issues: Vec<String>,
}

pub fn decode_error(bytes: &[u8]) -> Result<ErrorData, String> {
    let error = read_api_error_bytes(bytes)?;
    Ok(ErrorData {
        code: error.code,
        detail: error.detail,
        issues: error.issues,
    })
}

#[cfg(test)]
mod tests {
    use super::decode_error;

    #[test]
    fn rejects_invalid_error_pack() {
        assert!(decode_error(b"not an error").is_err());
    }
}
