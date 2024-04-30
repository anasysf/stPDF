import { Show } from 'solid-js';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import { produce } from 'solid-js/store';

export default () => {
  const [
    { currentAnalyzedDocumentByIdx, analyzedDocs, setAnalyzedDocs, currentAnalyzedDocumentIdx },
  ] = useAnalyzedDocumentsContext();

  return (
    <Show when={analyzedDocs.length}>
      <aside>
        <ul class="divide-y">
          <li class="pb-4">
            <p class="text-sm font-bold text-white">{currentAnalyzedDocumentByIdx()?.fileName}</p>
          </li>

          <li class="py-4">
            <p class="text-sm font-bold text-white">{currentAnalyzedDocumentByIdx()?.imagePath}</p>
          </li>

          <li class="pt-4">
            <input
              type="text"
              placeholder="Set barcode..."
              class="w-full rounded border-2 border-blue-900 bg-slate-800 px-4 py-2 text-white focus:outline-none"
              value={currentAnalyzedDocumentByIdx()?.identifier ?? 'No barcode'}
              onInput={(e) => {
                setAnalyzedDocs(
                  produce((analyzedDocuments) => {
                    analyzedDocuments.at(currentAnalyzedDocumentIdx())!.identifier =
                      e.currentTarget.value;
                  }),
                );
              }}
            />
          </li>
        </ul>
      </aside>
    </Show>
  );
};
