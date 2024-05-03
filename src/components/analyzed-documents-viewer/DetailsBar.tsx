import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import { produce } from 'solid-js/store';

export default () => {
  const [
    { currentAnalyzedDocumentByIdx, setAnalyzedDocs, currentAnalyzedDocumentIdx, isValidDocuments },
  ] = useAnalyzedDocumentsContext();

  return (
    <aside>
      <ul class="divide-y-2 divide-slate-600">
        <li class="pb-4">
          <p class="text-sm font-bold text-white">{currentAnalyzedDocumentByIdx()?.fileName}</p>
        </li>

        <li class="py-4">
          <p class="text-sm font-bold text-white">{currentAnalyzedDocumentByIdx()?.imagePath}</p>
        </li>

        <li class="py-4">
          <div class="inline-flex items-center gap-x-4">
            <input
              id="is-included"
              type="checkbox"
              class="size-4 rounded text-white accent-blue-500 focus:outline-none disabled:cursor-not-allowed"
              checked={currentAnalyzedDocumentByIdx()!.isIncluded}
              disabled={isValidDocuments()}
              readonly={isValidDocuments()}
              onInput={(e) => {
                setAnalyzedDocs(
                  produce((analyzedDocuments) => {
                    analyzedDocuments.at(currentAnalyzedDocumentIdx())!.isIncluded =
                      e.currentTarget.checked;
                  }),
                );
              }}
            />

            <div>
              <label
                for="is-included"
                class="font-bold text-white"
              >
                Inclus
              </label>
              <p class="text-sm font-semibold text-slate-400">
                Si ce document est inclus dans le fichier PDF.
              </p>
            </div>
          </div>
        </li>

        <li class="pt-4">
          <input
            type="text"
            placeholder="Indiquer l'identifiant..."
            class="w-full rounded border-2 border-blue-900 bg-slate-800 px-4 py-2 text-white focus:outline-none disabled:cursor-not-allowed disabled:border-transparent disabled:text-slate-600"
            value={currentAnalyzedDocumentByIdx()!.identifier ?? ''}
            disabled={isValidDocuments()}
            readonly={isValidDocuments()}
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
  );
};
