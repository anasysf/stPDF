import {
  type ParentComponent,
  createContext,
  useContext,
  createMemo,
  createEffect,
  createSignal,
  on,
} from 'solid-js';
import { type AnalyzedDocument } from './types';
import { createStore } from 'solid-js/store';

const makeAnalyzedDocumentsContext = () => {
  const [analyzedDocs, setAnalyzedDocs] = createStore<AnalyzedDocument[]>([]);

  const [currentAnalyzedDocumentIdx, setCurrentAnalyzedDocumentIdx] = createSignal(0);

  const currentAnalyzedDocumentByIdx = createMemo(() =>
    analyzedDocs.at(currentAnalyzedDocumentIdx()),
  );

  createEffect(
    on(
      [currentAnalyzedDocumentIdx, currentAnalyzedDocumentByIdx],
      () => {
        if (
          currentAnalyzedDocumentIdx() < 0 ||
          currentAnalyzedDocumentIdx() > analyzedDocs.length - 1 ||
          !currentAnalyzedDocumentByIdx()
        )
          throw new RangeError(
            `Current analyzed document index is out of bounds. index: ${currentAnalyzedDocumentIdx()}`,
          );
      },
      { defer: true },
    ),
  );

  return [
    {
      analyzedDocs,
      setAnalyzedDocs,
      currentAnalyzedDocumentIdx,
      setCurrentAnalyzedDocumentIdx,
      currentAnalyzedDocumentByIdx,
    },
  ] as const;
};

type AnalyzedDocumentsContextType = ReturnType<typeof makeAnalyzedDocumentsContext>;

const AnalyzedDocumentsContext = createContext<AnalyzedDocumentsContextType>();

export const AnalyzedDocumentsProvider: ParentComponent = (props) => {
  const value = makeAnalyzedDocumentsContext();

  return (
    <AnalyzedDocumentsContext.Provider value={value}>
      {props.children}
    </AnalyzedDocumentsContext.Provider>
  );
};

export function useAnalyzedDocumentsContext() {
  const context = useContext(AnalyzedDocumentsContext);
  if (!context)
    throw new ReferenceError(
      'useAnalyzedDocumentsContext must be within a AnalyzedDocumentsProvider.',
    );

  return context;
}
