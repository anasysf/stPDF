import { useAnalyzedDocumentsContext } from '../../stores/analyzed-documents';

export default () => {
  const [
    { currentAnalyzedDocumentIdx, setCurrentAnalyzedDocumentIdx, analyzedDocs },
  ] = useAnalyzedDocumentsContext();

  const nextDoc = () => {
    if (currentAnalyzedDocumentIdx() + 1 > analyzedDocs().length - 1) {
      console.log(currentAnalyzedDocumentIdx() + 1, analyzedDocs().length - 1);
      return;
    };
    setCurrentAnalyzedDocumentIdx(currentAnalyzedDocumentIdx() + 1);
  };

  return (
    <section class="inline-flex items-center">
      <button>Previous</button>
      <button class='text-white' onClick={() => nextDoc()}>Next</button>
    </section>
  );
};
