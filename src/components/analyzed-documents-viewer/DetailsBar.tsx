import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import { produce } from 'solid-js/store';
import Input from '../scan-sources/forms/Input';

export default () => {
  const [
    { currentAnalyzedDocumentByIdx, setAnalyzedDocs, currentAnalyzedDocumentIdx, isValidDocuments },
  ] = useAnalyzedDocumentsContext();

  return (
    <aside class="rounded bg-crust p-5 shadow-xl">
      <ul class="divide-y-2 divide-mauve">
        <li class="pb-4">
          <p class="text-sm font-bold text-white">
            {String.fromCharCode.apply(
              null,
              Array.from(currentAnalyzedDocumentByIdx()!.metadata.fileName.Windows),
            )}
          </p>
        </li>

        <li class="py-4">
          <p class="text-sm font-bold text-white">
            {currentAnalyzedDocumentByIdx()?.metadata.imagePath}
          </p>
        </li>

        <li class="py-4">
          <p class="text-sm font-bold text-white">
            {currentAnalyzedDocumentByIdx()?.metadata.size.toString()} Mb
          </p>
        </li>

        <li class="py-4">
          <div class="inline-flex items-center gap-x-4">
            <input
              id="is-included"
              type="checkbox"
              class="size-4 rounded text-white accent-mauve focus:outline-none disabled:cursor-not-allowed"
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
              <p class="text-xs font-semibold text-slate-400">
                Si ce document est inclus dans le fichier PDF.
              </p>
            </div>
          </div>
        </li>

        <li class="pt-4">
          <div class="inline-flex w-full flex-col gap-y-1.5">
            <label
              for="identifier"
              class="font-semibold text-text"
            >
              Identifiant
            </label>

            <Input
              id="identifier"
              placeholder="Indiquer l'identifiant..."
              value={currentAnalyzedDocumentByIdx()!.identifier ?? ''}
              onInput={(e) => {
                setAnalyzedDocs(
                  produce((analyzedDocuments) => {
                    analyzedDocuments.at(currentAnalyzedDocumentIdx())!.identifier =
                      e.currentTarget.value;
                  }),
                );
              }}
              required
              disabled={isValidDocuments()}
              readonly={isValidDocuments()}
            />
          </div>

          {/* <input
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
          /> */}
        </li>
      </ul>
    </aside>
  );
};
