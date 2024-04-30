import { invoke } from '@tauri-apps/api/core';
import { message } from '@tauri-apps/plugin-dialog';
import { Match, Switch, createMemo, createSignal, type JSX } from 'solid-js';
import { openDirectoryDialog, openImageDialog } from '../../services/dialogService';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import { type AnalyzedDocument } from '../../contexts/analyzed-documents/types';
import ScanSourcesOptions from './ScanSourcesOptions';
import { useSourcesContext } from '../../contexts/sources';

type SubmitEvent = JSX.EventHandlerUnion<HTMLFormElement, Event & { submitter: HTMLElement }>;

export default () => {
  const [targetDir, setTargetDir] = createSignal<string | null>(null);
  const [reference, setReference] = createSignal<string>('');
  const [waterMark, setWatermak] = createSignal<string>('');

  const [{ sources, setSources }] = useSourcesContext();
  const [{ setAnalyzedDocs }] = useAnalyzedDocumentsContext();

  const isValid = createMemo(
    () =>
      sources().length !== 0 &&
      Boolean(targetDir()) &&
      targetDir()?.trim().length !== 0 &&
      reference().trim().length !== 0,
  );

  const isResetable = createMemo(
    () =>
      sources().length !== 0 ||
      Boolean(targetDir()) ||
      targetDir()?.trim().length !== 0 ||
      reference().trim().length !== 0 ||
      waterMark().trim().length !== 0,
  );

  const handleSourceSelect = async () => {
    try {
      const fileResponses = await openImageDialog();
      if (!fileResponses) return setSources([]);

      return setSources(fileResponses.map((fileResponse) => fileResponse.path));
    } catch (err) {
      console.error(err);

      await message('Could not open file dialog.', {
        kind: 'error',
        title: 'Oops..',
      });

      return setSources([]);
    }
  };

  const handleTargetDirSelect = async () => {
    try {
      const targetDir = await openDirectoryDialog();
      return setTargetDir(targetDir);
    } catch (err) {
      console.error(err);

      await message('Could not open directory dialog.', {
        kind: 'error',
        title: 'Oops..',
      });

      return setTargetDir(null);
    }
  };

  const handleSubmit: SubmitEvent = async (evt) => {
    evt.preventDefault();

    const analyzedDocuments = await invoke<AnalyzedDocument[]>('analyze_sources', {
      sources: sources(),
    });

    setAnalyzedDocs(analyzedDocuments);
  };

  const reset = () => {
    setSources([]);
    setTargetDir(null);
    setReference('');
    setWatermak('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      class="mb-2 mt-4 flex w-full flex-col gap-y-4"
    >
      <div class="relative">
        <h1 class="inline-block border-b-4 border-b-blue-700 pb-1 text-xl font-semibold text-white">
          Analyse des documents
        </h1>
      </div>

      <section class="mb-1.5 flex items-center gap-x-4">
        <label
          class={`block w-full truncate rounded px-4 py-1.5 text-lg font-semibold shadow outline-none transition-colors duration-150 ease-in hover:shadow-lg ${sources().length ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-900' : 'bg-slate-800 text-white hover:bg-slate-700 active:text-slate-300'}`}
          role="button"
          onClick={async () => handleSourceSelect()}
        >
          <Switch fallback={<i class="fa-solid fa-arrow-up-from-bracket mr-3 py-1.5" />}>
            <Match when={sources().length}>
              <i class="fa-regular fa-circle-check mr-3 py-1.5" />
            </Match>
          </Switch>
          {sources().length ? 'Selected' : 'Select source(s)'}
        </label>

        <label
          class={`block w-full truncate rounded px-4 py-1.5 text-lg font-semibold shadow outline-none transition-colors duration-150 ease-in hover:shadow-lg ${targetDir() ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-900' : 'bg-slate-800 text-white hover:bg-slate-700 active:text-slate-300'}`}
          role="button"
          onClick={async () => handleTargetDirSelect()}
        >
          <Switch fallback={<i class="fa-solid fa-arrow-up-from-bracket mr-3 py-1.5" />}>
            <Match when={Boolean(targetDir())}>
              <i class="fa-regular fa-circle-check mr-3 py-1.5" />
            </Match>
          </Switch>
          {targetDir() ?? 'Select target directory'}
        </label>

        <input
          type="text"
          placeholder="Enter a reference..."
          class="w-full rounded border-2 border-blue-900 bg-slate-800 px-4 py-2 text-white focus:outline-none"
          required
          value={reference()}
          onInput={(e) => setReference(e.currentTarget.value)}
        />

        <input
          type="text"
          placeholder="Enter a watermark..."
          class="w-full rounded border-2 border-blue-900 bg-slate-800 px-4 py-2 text-white focus:outline-none"
          value={waterMark()}
          onInput={(e) => setWatermak(e.currentTarget.value)}
        />
      </section>

      <div class="flex flex-col gap-y-4">
        <div class="relative">
          <h1 class="inline-block border-b-4 border-b-blue-700 pb-1 text-xl font-semibold text-white">
            Options d'analyse
          </h1>
        </div>

        <ScanSourcesOptions />

        <section class="flex w-full flex-row-reverse items-center gap-x-2">
          <button
            type="submit"
            class={`block w-max rounded px-4 py-2 text-white outline-none transition-colors duration-150 ease-in-out ${isValid() ? 'bg-slate-800 shadow hover:bg-slate-700 hover:shadow-lg' : 'cursor-not-allowed bg-slate-300'}`}
            disabled={!isValid()}
          >
            Analyser
          </button>

          <button
            type="button"
            class={`block w-max rounded px-4 py-2 text-white outline-none transition-colors duration-150 ease-in-out ${isResetable() ? 'bg-red-800 shadow hover:bg-red-700 hover:shadow-lg' : 'cursor-not-allowed bg-slate-300'}`}
            disabled={!isResetable()}
            onClick={reset}
          >
            Réinitialiser
          </button>
        </section>
      </div>
    </form>
  );
};
