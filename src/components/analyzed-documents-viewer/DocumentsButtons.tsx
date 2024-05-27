import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { message } from '@tauri-apps/plugin-dialog';
import { Match, Switch, createSignal, onCleanup } from 'solid-js';
import Sweet from 'sweetalert2';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import { useSourcesContext } from '../../contexts/sources';
import ProgressModal from '../modals/ProgressModal';
import './styles/index.css';

export default () => {
  let startedGeneratingPdfsUnlisten: Awaited<ReturnType<typeof listen>> | undefined;
  let currentPdfUnlisten: Awaited<ReturnType<typeof listen>> | undefined;
  let doneGeneratingPdfsUnlisten: Awaited<ReturnType<typeof listen>> | undefined;

  const [pdfsGenerated, setPdfsGenerated] = createSignal(false);

  const [pdfsGenerationStarted, setPdfsGenerationStarted] = createSignal(false);
  const [pdfsLen, setPdfsLen] = createSignal<number | null>(null);
  const [currentPdf, setCurrentPdf] = createSignal<number | null>(null);

  const [{ isValidDocuments, setIsValidDocuments, includedDocuments }] =
    useAnalyzedDocumentsContext();

  const [{ sourcesFormData }] = useSourcesContext();

  const validateDocuments = async () => {
    setIsValidDocuments(true);

    try {
      startedGeneratingPdfsUnlisten = await listen<number>(
        'started-generating-pdfs',
        ({ payload }) => {
          setPdfsGenerationStarted(true);
          setPdfsLen(payload);
        },
      );

      currentPdfUnlisten = await listen<number>('current-pdf', ({ payload }) =>
        setCurrentPdf(payload),
      );
    } catch (err) {
      await message('Could not start progress modal.', {
        title: 'Oops..!',
        kind: 'error',
      });

      console.error(err);
    }
  };

  const invalidateDocuments = () => {
    setIsValidDocuments(false);

    if (startedGeneratingPdfsUnlisten) startedGeneratingPdfsUnlisten();

    if (currentPdfUnlisten) currentPdfUnlisten();
  };

  const generatePdfs = async () => {
    try {
      doneGeneratingPdfsUnlisten = await listen<string>(
        'done-generating-pdfs',
        async ({ payload }) => {
          await Sweet.fire({
            toast: true,
            text: `${pdfsLen()} fichiers PDF ont été générés en ${payload}`,
            icon: 'success',
            timerProgressBar: true,
            timer: 7000,
            showCloseButton: true,
            position: 'bottom-right',
            showConfirmButton: false,
          });
        },
      );

      await invoke('generate_pdfs', {
        analyzedDocuments: includedDocuments(),
        optionsRegistry: sourcesFormData,
      });

      setPdfsGenerated(true);
    } catch (err) {
      await message('Could not generate PDFs.', {
        kind: 'error',
        title: 'Oops..',
      });

      setPdfsGenerated(false);
    } finally {
      setPdfsGenerationStarted(false);
    }
  };

  const generateExcel = async () => {
    try {
      await invoke('generate_excel', {
        optionsRegistry: sourcesFormData,
      });
    } catch (err) {
      await message('Could not generate Excel.', {
        kind: 'error',
        title: 'Oops..',
      });
    }
  };

  onCleanup(() => {
    if (startedGeneratingPdfsUnlisten) startedGeneratingPdfsUnlisten();

    if (currentPdfUnlisten) currentPdfUnlisten();
  });

  return (
    <section class="flex items-center gap-x-2">
      <Switch>
        <Match when={!isValidDocuments()}>
          <button
            type="button"
            class="rounded bg-green px-2.5 py-1.5 font-semibold text-white"
            onClick={async () => validateDocuments()}
          >
            Valider les documents
          </button>
        </Match>

        <Match when={isValidDocuments()}>
          <button
            type="button"
            class="rounded bg-peach px-2.5 py-1.5 font-semibold text-white"
            onClick={() => {
              invalidateDocuments();
            }}
          >
            Invalider les documents
          </button>
        </Match>
      </Switch>

      <button
        type="button"
        class="rounded bg-mauve px-2.5 py-1.5 font-semibold text-white shadow transition duration-200 ease-in-out hover:shadow-lg disabled:cursor-not-allowed disabled:bg-overlay0 disabled:text-text disabled:shadow-none"
        onClick={async () => generatePdfs()}
        disabled={!isValidDocuments()}
      >
        Générer les fichiers PDF
      </button>

      <ProgressModal
        len={pdfsLen()}
        current={currentPdf()}
        isOpen={pdfsGenerationStarted()}
        title="Génération de fichiers PDF:"
      />

      <button
        type="button"
        class="rounded bg-green px-2.5 py-1.5 font-semibold text-white shadow transition duration-200 ease-in-out hover:shadow-lg disabled:cursor-not-allowed disabled:bg-overlay0 disabled:text-text disabled:shadow-none"
        onClick={async () => generateExcel()}
        disabled={!pdfsGenerated()}
      >
        Générer le fichier Excel
      </button>
    </section>
  );
};
