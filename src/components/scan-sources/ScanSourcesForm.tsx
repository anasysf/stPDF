import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { createMemo, createSignal, onCleanup } from 'solid-js';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import { type AnalyzedDocument } from '../../contexts/analyzed-documents/types';
import { useSourcesContext } from '../../contexts/sources';
import { exists } from '../../utils/type-guard';
import ProgressModal from '../modals/ProgressModal';
import DocumentAnalysisOptions from './DocumentAnalysisOptions';
import DocumentsAnalysis from './DocumentsAnalysis';
import Title from './forms/Title';

type SubmitEvent = Event & {
  readonly submitter: HTMLElement;
} & {
  readonly currentTarget: HTMLFormElement;
  readonly target: Element;
};

export default () => {
  let startedAnalyzingSourcesUnlisten: Awaited<ReturnType<typeof listen>> | undefined;
  let currentSourceUnlisten: Awaited<ReturnType<typeof listen>> | undefined;

  const [{ sourcesFormData, resetSourcesFormData }] = useSourcesContext();
  const [{ setAnalyzedDocs, resetDocs }] = useAnalyzedDocumentsContext();

  const [analyzingSources, setAnalyzingSources] = createSignal(false);
  const [currentSource, setCurrentSource] = createSignal<number | null>(null);
  const [sourcesLen, setSourcesLen] = createSignal<number | null>(null);

  const canReset = createMemo(
    () =>
      sourcesFormData.sources.length !== 0 ||
      sourcesFormData.reference.trim().length !== 0 ||
      (exists(sourcesFormData.targetDir) && sourcesFormData.targetDir.trim().length !== 0) ||
      sourcesFormData.watermark.trim().length !== 0,
  );

  const canAnalyze = createMemo(
    () =>
      sourcesFormData.sources.length !== 0 &&
      sourcesFormData.reference.trim().length !== 0 &&
      exists(sourcesFormData.targetDir) &&
      sourcesFormData.targetDir.trim().length !== 0 &&
      sourcesFormData.watermark.trim().length !== 0,
  );

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      await invoke('clear_state');

      startedAnalyzingSourcesUnlisten = await listen<number>(
        'started-analyzing-sources',
        ({ payload }) => {
          setAnalyzingSources(true);
          setSourcesLen(payload);
        },
      );

      currentSourceUnlisten = await listen<number>('current-source', ({ payload }) =>
        setCurrentSource(payload),
      );

      const analyzedDocuments = await invoke<AnalyzedDocument[]>('analyze_sources', {
        optionsRegistry: sourcesFormData,
      });

      setAnalyzedDocs(analyzedDocuments);

      setAnalyzingSources(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReset = async () => {
    resetSourcesFormData();
    resetDocs();

    await invoke('clear_state');
  };

  onCleanup(() => {
    if (exists(startedAnalyzingSourcesUnlisten)) startedAnalyzingSourcesUnlisten();

    if (exists(currentSourceUnlisten)) currentSourceUnlisten();
  });

  return (
    <form
      onSubmit={handleSubmit}
      class="mt-1.5 flex w-11/12 flex-col gap-y-3"
    >
      <Title text="Analyse des documents & options" />

      <DocumentsAnalysis />

      <DocumentAnalysisOptions />

      <section class="flex items-center gap-x-3 self-end">
        <button
          type="button"
          class="inline-flex items-center gap-x-2 rounded bg-red px-3 py-1.5 text-lg font-semibold text-white shadow transition duration-200 ease-in-out hover:shadow-lg disabled:cursor-not-allowed disabled:bg-overlay0 disabled:text-text disabled:shadow-none"
          disabled={!canReset()}
          onClick={async () => {
            await handleReset();
          }}
        >
          <i class="fa-solid fa-rotate-left mt-0.5" />
          Réinitialiser
        </button>

        <button
          type="submit"
          class="inline-flex items-center gap-x-2 rounded bg-blue px-3 py-1.5 text-lg font-semibold text-white shadow transition duration-200 ease-in-out hover:shadow-lg disabled:cursor-not-allowed disabled:bg-overlay0 disabled:text-text disabled:shadow-none"
          disabled={!canAnalyze()}
        >
          <i class="fa-solid fa-barcode mt-0.5" />
          Analyser
        </button>

        <ProgressModal
          len={sourcesLen()}
          current={currentSource()}
          isOpen={analyzingSources()}
          title="Analyse des sources:"
        />
      </section>
    </form>
  );
};
