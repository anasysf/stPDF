import { createMemo } from 'solid-js';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';

export default () => {
  const [{ analyzedDocs, currentAnalyzedDocumentIdx, currentAnalyzedDocumentByIdx, contracts }] =
    useAnalyzedDocumentsContext();

  const currentAnalyzedDocumentPos = createMemo(() => currentAnalyzedDocumentIdx() + 1);

  const currentContractIdx = createMemo(() =>
    contracts().findIndex(
      (contract) => contract.imagePath.trim() === currentAnalyzedDocumentByIdx()?.imagePath.trim(),
    ),
  );

  const currentContractPos = createMemo(() => currentContractIdx() === -1 ? 0 : currentContractIdx() + 1);

  return (
    <div class='inline-flex gap-x-4'>
      <div class="w-full space-y-1">
        <p class="font-bold text-white">
          Source: {currentAnalyzedDocumentPos()}/{analyzedDocs.length}
        </p>
        <p class="font-bold text-white">
          Contrat: {currentContractPos()}/{contracts().length}
        </p>
      </div>
    </div>
  );
};
