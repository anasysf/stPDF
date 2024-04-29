import { ParentComponent, createContext, createMemo, createSignal, useContext } from "solid-js";
import { AnalyzedDocumentsMap, AnalyzedDocumentsRes } from "./types";

const makeDocumentsContext = () => {
  const [documents, setDocuments] = createSignal<AnalyzedDocumentsRes<keyof AnalyzedDocumentsMap>[]>([]);

  const [currentDocumentIdx, setCurentDocumentIdx] = createSignal(0);

  const currentDocumentByIdx = createMemo(() => documents().at(currentDocumentIdx())!);

  return {
    documents,
    setDocuments,
    currentDocumentByIdx,
  } as const;
};

type DocumentsContextType = ReturnType<typeof makeDocumentsContext>;

const DocumentsContext = createContext<DocumentsContextType>();

export const DocumentsProvider: ParentComponent = (props) => {
  const value = makeDocumentsContext();

  return <DocumentsContext.Provider value={value}>{props.children}</DocumentsContext.Provider>
};

export const useDocumentsContext = () => {
  const documentsContext = useContext(DocumentsContext);
  if (!documentsContext)
    throw new ReferenceError('useDocumentsContext should be called inside its DocumentsProvider.');

  return documentsContext;
};
