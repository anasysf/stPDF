import { createMemo } from 'solid-js';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import CarouselNavigationBtns from './CarouselNavigationBtns';
import DocumentsButtons from './DocumentsButtons';

export default () => {
  const [{ analyzedDocs, currentAnalyzedDocumentIdx, currentAnalyzedDocumentByIdx, contracts }] =
    useAnalyzedDocumentsContext();

  const currentAnalyzedDocumentPos = createMemo(() => currentAnalyzedDocumentIdx() + 1);

  const currentContractIdx = createMemo(() =>
    contracts().findIndex(
      (contract) =>
        contract.metadata.imagePath.trim() ===
        currentAnalyzedDocumentByIdx()?.metadata.imagePath.trim(),
    ),
  );

  const currentContractPos = createMemo(() =>
    currentContractIdx() === -1 ? 0 : currentContractIdx() + 1,
  );

  return (
    <div class="flex w-full items-center justify-between gap-x-4 rounded bg-crust px-3 py-2.5 shadow-xl">
      <DocumentsButtons />

      <div class="inline-flex items-center divide-x-4 divide-mauve">
        <p class="pr-2 font-bold text-white">
          Source: {currentAnalyzedDocumentPos()}/{analyzedDocs.length}
        </p>
        <p class="pl-2 font-bold text-white">
          Contrat: {currentContractPos()}/{contracts().length}
        </p>
      </div>

      <CarouselNavigationBtns />
    </div>
  );
};
