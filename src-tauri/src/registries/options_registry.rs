use std::{fmt::Display, path::Path};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default)]
pub enum BranchContracts {
    #[serde(rename = "c-auto")]
    #[default]
    Auto,
    #[serde(rename = "c-rd")]
    Rd,
    #[serde(rename = "c-mrc")]
    Mrc,
}

#[derive(Serialize, Deserialize, Default)]
pub enum IdentifierType {
    #[serde(rename = "code-128")]
    #[default]
    Code128,
    #[serde(rename = "qr-code")]
    QrCode,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OptionsRegistry<'a, P: AsRef<Path> + Clone + Display + Send + Sync> {
    pub reference: &'a str,
    branch_contract: BranchContracts,
    pub sources: Box<[P]>,
    pub watermark: &'a str,
    pub identifier_type: IdentifierType,
    pub target_dir: P,
}
