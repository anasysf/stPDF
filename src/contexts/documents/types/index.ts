type Child = {
  readonly imagePath: string;
  readonly parentBarcode: string;
};

export type AnalyzedDocumentsMap = {
  readonly Bja: {
    readonly imagePath: string;
  };
  readonly Parent: {
    readonly imagePath: string;
    readonly barcode: string;
    readonly children: Child[];
  };
  readonly Unrecognized: {
    readonly imagePath: string;
  };
};

export type AnalyzedDocumentsRes<T extends keyof AnalyzedDocumentsMap> = {
  readonly type: T;
} & AnalyzedDocumentsMap[T];
