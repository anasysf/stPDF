import { createMemo } from 'solid-js';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';

export default () => {
  const [{ currentAnalyzedDocumentIdx, setCurrentAnalyzedDocumentIdx, analyzedDocs }] =
    useAnalyzedDocumentsContext();

  const analyzedDocsSize = analyzedDocs.length - 1;

  const isFirst = createMemo(() => currentAnalyzedDocumentIdx() === 0);

  const isLast = createMemo(() => currentAnalyzedDocumentIdx() === analyzedDocsSize);

  const canGoPrev = createMemo(() => currentAnalyzedDocumentIdx() - 1 < 0);

  const canGoNext = createMemo(() => currentAnalyzedDocumentIdx() + 1 > analyzedDocsSize);

  const firstDoc = () => setCurrentAnalyzedDocumentIdx(0);

  const lastDoc = () => setCurrentAnalyzedDocumentIdx(analyzedDocs.length - 1);

  const prevDoc = () => setCurrentAnalyzedDocumentIdx(currentAnalyzedDocumentIdx() - 1);

  const nextDoc = () => setCurrentAnalyzedDocumentIdx(currentAnalyzedDocumentIdx() + 1);

  return (
    <section class="inline-flex items-center gap-x-4">
      <button
        class={`rounded bg-subtext1 px-4 py-1 text-lg text-white shadow transition-opacity duration-200 ease-in-out active:shadow-lg ${isFirst() ? 'opacity-0' : 'opacity-100'}`}
        onClick={() => {
          firstDoc();
        }}
      >
        <i class="fa-solid fa-backward-step" />
      </button>

      <button
        class={`rounded bg-subtext1 px-4 py-1 text-lg text-white shadow transition-opacity duration-200 ease-in-out active:shadow-lg ${canGoPrev() ? 'opacity-0' : 'opacity-100'}`}
        onClick={() => {
          prevDoc();
        }}
      >
        <i class="fa-solid fa-chevron-left" />
      </button>

      <button
        class={`rounded bg-blue px-4 py-1 text-lg text-white shadow transition-opacity duration-200 ease-in-out active:shadow-lg ${canGoNext() ? 'opacity-0' : 'opacity-100'}`}
        onClick={() => {
          nextDoc();
        }}
      >
        <i class="fa-solid fa-chevron-right" />
      </button>

      <button
        class={`rounded bg-blue px-4 py-1 text-lg text-white shadow transition-opacity duration-200 ease-in-out active:shadow-lg ${isLast() ? 'opacity-0' : 'opacity-100'}`}
        onClick={() => {
          lastDoc();
        }}
      >
        <i class="fa-solid fa-forward-step" />
      </button>
    </section>
  );
};
