import {
  type ParentComponent,
  createContext,
  createSignal,
  useContext,
  createMemo,
} from 'solid-js';
import {
  type AnalyzedDocumentsMap,
  type AnalyzedDocumentsRes,
} from '../entities/analyzed-documents/types';

const useProviderValue = () => {
  const [documents, setDocuments] = createSignal<
    Array<AnalyzedDocumentsRes<keyof AnalyzedDocumentsMap>>
  >([]);

  const [sources, setSources] = createSignal<string[]>([]);

  const [currentDocumentIdx, setCurrentDocumentIdx] = createSignal<number>(0);

  const currentDocumentByIdx = createMemo(() => documents()[currentDocumentIdx()]);

  const [currentParentDocumentImageIdx, setCurrentParentDocumentImageIdx] = createSignal(0);

  const previousDocument = () => {
    if (currentDocumentIdx() - 1 < 0) return;

    setCurrentParentDocumentImageIdx(0);
    return setCurrentDocumentIdx(currentDocumentIdx() - 1);
  };

  const nextDocument = () => {
    if (currentDocumentIdx() + 1 > documents().length - 1) return;

    console.log(currentDocumentIdx());

    setCurrentParentDocumentImageIdx(0);
    return setCurrentDocumentIdx(currentDocumentIdx() + 1);
  };

  const previousParentDocumentImage = () =>
    currentParentDocumentImageIdx() - 1 === 0 ?
      setCurrentParentDocumentImageIdx(currentParentDocumentImageIdx() - 1)
    : undefined;

  const nextParentDocumentImage = (images: string[]) =>
    currentParentDocumentImageIdx() + 1 < images.length ?
      setCurrentParentDocumentImageIdx(currentParentDocumentImageIdx() + 1)
    : undefined;

  return {
    documents,
    setDocuments,
    sources,
    setSources,
    currentDocumentIdx,
    setCurrentDocumentIdx,
    currentDocumentByIdx,
    currentParentDocumentImageIdx,
    setCurrentParentDocumentImageIdx,
    previousParentDocumentImage,
    nextParentDocumentImage,
    previousDocument,
    nextDocument,
  };
};

type ContextType = ReturnType<typeof useProviderValue>;

const DocumentsContext = createContext<ContextType>();

export const DocumentsProvider: ParentComponent = (props) => {
  const value = useProviderValue();

  return <DocumentsContext.Provider value={value}>{props.children}</DocumentsContext.Provider>;
};

export function useDocumentsContext() {
  const context = useContext(DocumentsContext);
  if (!context) throw new ReferenceError('useDocumentsContext must be within a DocumentsProvider.');

  return context;
}
