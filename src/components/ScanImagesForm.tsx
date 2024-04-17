import { invoke } from '@tauri-apps/api/core';
import UploadButton from './buttons/UploadButton';
import { message } from '@tauri-apps/plugin-dialog';
import { createMemo, createSignal, onMount, type JSX } from 'solid-js';
import { listen } from '@tauri-apps/api/event';
import { openDirectoryDialog, openImageDialog } from '../services/dialogService';

type SubmitEvent = JSX.EventHandlerUnion<HTMLFormElement, Event & { submitter: HTMLElement }>;

export default function ScanDirectoryForm() {
  const [sources, setSources] = createSignal<string[]>([]);
  const [targetDir, setTargetDir] = createSignal<string | null>(null);
  const [reference, setReference] = createSignal<string>('');
  const [statusMessage, setStatusMessage] = createSignal<string>('');

  const isValid = createMemo(
    () =>
      sources().length !== 0 &&
      Boolean(targetDir()) &&
      targetDir()?.trim().length !== 0 &&
      reference().trim().length !== 0,
  );

  onMount(async () => {
    await listen<string>('decoding-barcode', ({ payload }) => setStatusMessage(payload));

    await listen<string>('generating-pdf', ({ payload }) => setStatusMessage(payload));

    await listen<string>('done-generating', ({ payload }) => setStatusMessage(payload));
  });

  const handleSourceSelect = async () => {
    try {
      const fileResponses = await openImageDialog();
      if (!fileResponses) return setSources([]);

      const sources = fileResponses.map((fileResponse) => fileResponse.path);
      return setSources(sources);
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

  const clearStates = (): void => {
    setSources([]);
    setTargetDir(null);
    setReference('');
  };

  const handleSubmit: SubmitEvent = async (evt) => {
    evt.preventDefault();

    await invoke('generate_pdfs_from_sources', {
      sources: sources(),
      target: targetDir(),
      reference: reference(),
    });

    clearStates();
  };

  /* OnCleanup(() => {
    decodingBarcodeUnlisten();
    generatingPdfUnlisten();
    doneGeneratingUnlisten();
  }); */

  return (
    <form
      onSubmit={handleSubmit}
      class="mx-4 my-2 flex flex-col gap-y-2.5"
    >
      <section class="flex items-center gap-x-4">
        <UploadButton
          label={`Select source (${sources().length})`}
          uploaded={sources().length !== 0}
          onClick={async () => handleSourceSelect()}
        />

        <UploadButton
          label={targetDir() ?? 'Select target directory'}
          uploaded={Boolean(targetDir())}
          onClick={async () => handleTargetDirSelect()}
        />

        <input
          type="text"
          placeholder="Enter Reference"
          class="w-full rounded border-2 border-blue-700 bg-slate-100 px-3.5 py-2.5 text-sm outline-slate-800 focus:border-blue-600 focus:outline-none"
          required
          value={reference()}
          onInput={(e) => setReference(e.currentTarget.value)}
        />
      </section>

      <section class="flex w-full flex-row-reverse items-center justify-between">
        <button
          type="submit"
          class={`block w-max rounded px-4 py-2 text-white outline-none transition-colors duration-150 ease-in-out ${isValid() ? 'bg-slate-800 shadow hover:bg-slate-700 hover:shadow-lg' : 'cursor-not-allowed bg-slate-200'}`}
          disabled={!isValid()}
        >
          Generate PDFs
        </button>

        <p>{statusMessage()}</p>
      </section>
    </form>
  );
}
