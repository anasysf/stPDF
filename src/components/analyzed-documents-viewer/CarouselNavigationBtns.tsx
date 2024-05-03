import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';

export default () => {
  const [{ currentAnalyzedDocumentIdx, setCurrentAnalyzedDocumentIdx, analyzedDocs }] =
    useAnalyzedDocumentsContext();

  const prevDoc = () => {
    if (currentAnalyzedDocumentIdx() - 1 < 0) return;
    setCurrentAnalyzedDocumentIdx(currentAnalyzedDocumentIdx() - 1);
  };

  const nextDoc = () => {
    if (currentAnalyzedDocumentIdx() + 1 > analyzedDocs.length - 1) return;
    setCurrentAnalyzedDocumentIdx(currentAnalyzedDocumentIdx() + 1);
  };

  return (
    <section class="inline-flex items-center gap-x-4">
      <button
        class={`rounded bg-slate-600 px-4 py-1 text-lg text-white shadow hover:bg-slate-500 active:shadow-lg ${currentAnalyzedDocumentIdx() - 1 < 0 ? 'invisible' : 'visible'}`}
        onClick={() => {
          prevDoc();
        }}
      >
        <i class="fa-solid fa-arrow-left" />
      </button>

      <button
        class={`rounded bg-blue-600 px-4 py-1 text-lg text-white shadow hover:bg-blue-500 active:shadow-lg ${currentAnalyzedDocumentIdx() + 1 > analyzedDocs.length - 1 ? 'invisible' : 'visible'}`}
        onClick={() => {
          nextDoc();
        }}
      >
        <i class="fa-solid fa-arrow-right" />
      </button>
    </section>
  );
};
