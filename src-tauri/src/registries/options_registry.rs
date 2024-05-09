use std::path::Path;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub(crate) enum BranchContracts {
    #[serde(rename = "c-auto")]
    Auto,
    #[serde(rename = "c-rd")]
    Rd,
    #[serde(rename = "c-mrc")]
    Mrc,
}

impl Default for BranchContracts {
    fn default() -> Self {
        Self::Auto
    }
}

#[derive(Serialize, Deserialize)]
pub(crate) enum IdentifierType {
    #[serde(rename = "code-128")]
    Code128,
    #[serde(rename = "qr-code")]
    QrCode,
}

impl Default for IdentifierType {
    fn default() -> Self {
        Self::Code128
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct OptionsRegistry<P: AsRef<Path>> {
    reference: Box<str>,
    branch_contract: BranchContracts,
    pub(crate) sources: Box<[P]>,
    watermark: Box<str>,
    identifier_type: IdentifierType,
    target_dir: P,
}
