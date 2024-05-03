import { invoke } from '@tauri-apps/api/core';
import { message } from '@tauri-apps/plugin-dialog';
import { Match, Show, Switch, createMemo, type JSX } from 'solid-js';
import { openDirectoryDialog, openImageDialog } from '../../services/dialogService';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import { type AnalyzedDocument } from '../../contexts/analyzed-documents/types';
import ScanSourcesOptions from './ScanSourcesOptions';
import { useSourcesContext } from '../../contexts/sources';
import { reconcile } from 'solid-js/store';

type SubmitEvent = JSX.EventHandlerUnion<HTMLFormElement, Event & { submitter: HTMLElement }>;

export default () => {
  const [{ sourcesFormData, setSourcesFormData, updateSourcesFormData }] = useSourcesContext();
  const [
    { analyzedDocs, includedDocuments, setAnalyzedDocs, isValidDocuments, setIsValidDocuments },
  ] = useAnalyzedDocumentsContext();

  const isValid = createMemo(
    () =>
      sourcesFormData.sources.length !== 0 &&
      Boolean(sourcesFormData.targetDir) &&
      sourcesFormData.targetDir?.trim().length !== 0 &&
      sourcesFormData.reference.trim().length !== 0,
  );

  const isResetable = createMemo(
    () =>
      sourcesFormData.sources.length !== 0 ||
      (sourcesFormData.targetDir ? sourcesFormData.targetDir.trim().length !== 0 : false) ||
      sourcesFormData.reference.trim().length !== 0,
  );

  const handleSourceSelect = async () => {
    try {
      const fileResponses = await openImageDialog();
      if (!fileResponses) {
        updateSourcesFormData('sources', []);
        return;
      }

      updateSourcesFormData(
        'sources',
        fileResponses.map((fileResponse) => fileResponse.path),
      );
    } catch (err) {
      console.error(err);

      await message('Could not open file dialog.', {
        kind: 'error',
        title: 'Oops..',
      });

      updateSourcesFormData('sources', []);
    }
  };

  const handleTargetDirSelect = async () => {
    try {
      const targetDir = await openDirectoryDialog();
      updateSourcesFormData('targetDir', targetDir);
    } catch (err) {
      console.error(err);

      await message('Could not open directory dialog.', {
        kind: 'error',
        title: 'Oops..',
      });

      updateSourcesFormData('targetDir', null);
    }
  };

  const handleSubmit: SubmitEvent = async (evt) => {
    evt.preventDefault();

    const analyzedDocuments = await invoke<AnalyzedDocument[]>('analyze_sources', {
      sources: sourcesFormData.sources,
    });

    setAnalyzedDocs(analyzedDocuments);
  };

  const generatePdfs = async () => {
    try {
      await invoke('generate_pdfs', {
        analyzedDocuments: includedDocuments(),
        targetDirectory: sourcesFormData.targetDir,
        reference: sourcesFormData.reference,
      });
    } catch (err) {
      await message('Could not generate PDFs.', {
        kind: 'error',
        title: 'Oops..',
      });
    }
  };

  const reset = () => {
    setSourcesFormData(
      reconcile({
        sources: [],
        reference: '',
        targetDir: null,
        watermark: '',
        identifierType: 'code-128',
      }),
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      class="my-4 flex w-full flex-col gap-y-2.5"
    >
      <div class="relative">
        <h1 class="inline-block border-b-4 border-b-blue-700 pb-1 text-xl font-semibold text-white">
          Analyse des documents
        </h1>
      </div>

      <section class="flex items-center gap-x-4">
        <label
          class={`block w-full truncate rounded px-4 py-1.5 font-semibold shadow outline-none transition-colors duration-150 ease-in hover:shadow-lg ${sourcesFormData.sources.length ? 'bg-teal-800 text-white hover:bg-teal-700 active:bg-teal-900' : 'bg-slate-800 text-white hover:bg-slate-700 active:text-slate-300'}`}
          role="button"
          onClick={async () => handleSourceSelect()}
        >
          <Switch fallback={<i class="fa-solid fa-arrow-up-from-bracket mr-3 py-1.5" />}>
            <Match when={sourcesFormData.sources.length}>
              <i class="fa-regular fa-circle-check mr-3 py-1.5" />
            </Match>
          </Switch>
          {sourcesFormData.sources.length ? 'Sélectionné' : 'Sélectionner les sources'}
        </label>

        <label
          class={`block w-full truncate rounded px-4 py-1.5 font-semibold shadow outline-none transition-colors duration-150 ease-in hover:shadow-lg ${sourcesFormData.targetDir ? 'bg-teal-800 text-white hover:bg-teal-700 active:bg-teal-900' : 'bg-slate-800 text-white hover:bg-slate-700 active:text-slate-300'}`}
          role="button"
          onClick={async () => handleTargetDirSelect()}
        >
          <Switch fallback={<i class="fa-solid fa-arrow-up-from-bracket mr-3 py-1.5" />}>
            <Match when={Boolean(sourcesFormData.targetDir)}>
              <i class="fa-regular fa-circle-check mr-3 py-1.5" />
            </Match>
          </Switch>
          {sourcesFormData.targetDir ?? 'Sélectionner le répertoire cible'}
        </label>

        <input
          type="text"
          placeholder="Entrer le numero de conteneur..."
          class="w-full rounded border-2 border-blue-900 bg-slate-800 px-4 py-2 text-white focus:outline-none"
          required
          value={sourcesFormData.reference}
          onInput={(e) => {
            updateSourcesFormData('reference', e.currentTarget.value);
          }}
        />
      </section>

      <div class="flex flex-col gap-y-2">
        <div class="relative">
          <h1 class="inline-block border-b-4 border-b-blue-700 pb-1 text-xl font-semibold text-white">
            Options d'analyse
          </h1>
        </div>

        <ScanSourcesOptions />

        <section class="flex w-full flex-row-reverse items-center justify-between">
          <div class="inline-flex flex-row-reverse items-center gap-x-2">
            <button
              type="submit"
              class={`inline-flex w-max items-center gap-x-2 rounded px-4 py-2 font-semibold text-white outline-none transition-colors duration-150 ease-in-out ${isValid() ? 'bg-teal-800 text-white hover:bg-teal-700 active:bg-teal-900 shadow hover:shadow-lg' : 'cursor-not-allowed bg-slate-300'}`}
              disabled={!isValid()}
            >
              <i class="fa-solid fa-barcode" />
              Analyser
            </button>

            <button
              type="button"
              class={`inline-flex w-max items-center gap-x-2 rounded px-4 py-2 font-semibold text-white outline-none transition-colors duration-150 ease-in-out ${isResetable() ? 'bg-red-800 shadow hover:bg-red-700 hover:shadow-lg' : 'cursor-not-allowed bg-slate-300'}`}
              disabled={!isResetable()}
              onClick={reset}
            >
              <i class="fa-solid fa-rotate-left" />
              Réinitialiser
            </button>
          </div>

          <div class="inline-flex items-center gap-x-2">
            <Show when={isValidDocuments()}>
              <button
                type="submit"
                class="inline-flex w-max items-center gap-x-2 rounded bg-orange-500 px-4 py-2 font-semibold text-white shadow outline-none transition-colors duration-150 ease-in-out hover:bg-orange-600 hover:shadow-lg"
                onClick={() => setIsValidDocuments(false)}
              >
                <i class="fa-solid fa-file-excel" />
                Invalider les documents
              </button>
            </Show>

            <Show when={!isValidDocuments()}>
              <button
                type="submit"
                class={`inline-flex w-max items-center gap-x-2 rounded px-4 py-2 font-semibold text-white outline-none transition-colors duration-150 ease-in-out ${analyzedDocs.length ? 'bg-teal-800 shadow hover:bg-teal-700 hover:shadow-lg active:bg-teal-900' : 'cursor-not-allowed bg-slate-300'}`}
                disabled={!analyzedDocs.length}
                onClick={() => setIsValidDocuments(true)}
              >
                <i class="fa-solid fa-file-circle-check" />
                Valider les documents
              </button>
            </Show>

            <button
              type="button"
              class={`inline-flex w-max items-center gap-x-2 rounded px-4 py-2 font-semibold text-white outline-none transition-colors duration-150 ease-in-out ${isValidDocuments() ? 'bg-teal-800 shadow hover:bg-teal-700 hover:shadow-lg active:bg-teal-900' : 'cursor-not-allowed bg-slate-300'}`}
              disabled={!isValidDocuments()}
              onClick={async () => generatePdfs()}
            >
              <i class="fa-solid fa-file-pdf" />
              Générer les fichiers PDF.
            </button>
          </div>
        </section>
      </div>
    </form>
  );
};
