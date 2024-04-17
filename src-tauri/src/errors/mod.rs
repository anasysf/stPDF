use self::scanner_error::ScannerError;

pub mod scanner_error;

pub type ScannerResult<T> = Result<T, ScannerError>;
