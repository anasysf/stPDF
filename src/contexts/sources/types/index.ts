export type BarcodeTypes = 'code-128' | 'qr-code';
export type BranchContracts = 'c-auto' | 'c-rd' | 'c-mrc';

export type SourcesFormData = {
  readonly sources: string[];
  readonly targetDir: string | null;
  readonly reference: string;
  readonly watermark: string;
  readonly identifierType: BarcodeTypes;
  readonly branchContract: BranchContracts;
};
