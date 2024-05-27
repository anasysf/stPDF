export type AnalyzedDocument = {
  identifier: string | null;
  isIncluded: boolean;
  readonly metadata: DocumentMetadata;
};

type DocumentMetadata = {
  readonly imagePath: string;
  readonly fileName: {
    readonly Windows: Uint16Array;
  };
  readonly size: string;
};
