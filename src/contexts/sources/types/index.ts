export type BarcodeTypes = 'code-128' | 'qr-code';

export type SourcesFormData = {
  readonly sources: string[];
  readonly targetDir: string | null;
  readonly reference: string;
  readonly watermark: string;
  readonly identifierType: BarcodeTypes;
};
