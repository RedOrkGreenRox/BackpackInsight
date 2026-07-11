use crate::generated::error_generated::backpack_insight::error::{
    finish_api_error_buffer, root_as_api_error, ApiError, ApiErrorArgs,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ApiErrorPack {
    pub code: String,
    pub detail: String,
    pub issues: Vec<String>,
}

pub fn build_api_error_bytes(error: &ApiErrorPack) -> Vec<u8> {
    let mut fbb = flatbuffers::FlatBufferBuilder::new();
    let code = fbb.create_string(&error.code);
    let detail = fbb.create_string(&error.detail);
    let issue_offsets = error
        .issues
        .iter()
        .map(|issue| fbb.create_string(issue))
        .collect::<Vec<_>>();
    let issues = fbb.create_vector(&issue_offsets);
    let root = ApiError::create(
        &mut fbb,
        &ApiErrorArgs {
            code: Some(code),
            detail: Some(detail),
            issues: Some(issues),
        },
    );
    finish_api_error_buffer(&mut fbb, root);
    fbb.finished_data().to_vec()
}

pub fn read_api_error_bytes(bytes: &[u8]) -> Result<ApiErrorPack, String> {
    let error = root_as_api_error(bytes).map_err(|err| err.to_string())?;
    Ok(ApiErrorPack {
        code: error.code().to_string(),
        detail: error.detail().to_string(),
        issues: error
            .issues()
            .map(|items| items.iter().map(str::to_string).collect())
            .unwrap_or_default(),
    })
}

#[cfg(test)]
mod tests {
    use super::{build_api_error_bytes, read_api_error_bytes, ApiErrorPack};

    #[test]
    fn builds_and_reads_error() {
        let bytes = build_api_error_bytes(&ApiErrorPack {
            code: "bad_request".to_string(),
            detail: "Bad".to_string(),
            issues: vec!["one".to_string()],
        });
        let error = read_api_error_bytes(&bytes).unwrap_or_else(|err| panic!("valid fb: {err}"));
        assert_eq!(error.code, "bad_request");
        assert_eq!(error.issues, ["one"]);
    }
}
