import { invoke } from '@tauri-apps/api/core';
import UploadButton from './buttons/UploadButton';
import { open, message } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';
import { createMemo, createSignal, onMount, type JSX } from 'solid-js';
import { listen } from '@tauri-apps/api/event';

async function openSelectDirectoryDialog() {
  try {
    const selected = await open({
      multiple: false,
      directory: true,
    });

    return selected;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default function ScanDirectoryForm() {
  const [sourceDir, setSourceDir] = createSignal<string | null>(null);
  const [sourceDirValidity, setSourceDirValidity] = createSignal<boolean>(true);
  const [targetDir, setTargetDir] = createSignal<string | null>(null);
  const [reference, setReference] = createSignal<string>('');
  const [statusMessage, setStatusMessage] = createSignal<string>('');

  const isValid = createMemo(
    () =>
      sourceDirValidity() &&
      Boolean(sourceDir()) &&
      sourceDir()?.trim().length !== 0 &&
      Boolean(targetDir()) &&
      targetDir()?.trim().length !== 0 &&
      reference().trim().length !== 0,
  );

  onMount(async () => {
    await listen('remaining-files', ({ id, event, payload }) => {
      setStatusMessage(payload as string);
      console.log(id, event, payload);
    });

    await listen('generating-pdfs', ({ id, event, payload }) => {
      setStatusMessage(payload as string);
      console.log(id, event, payload);
    });
  });

  const handleSubmit: JSX.EventHandlerUnion<
    HTMLFormElement,
    Event & {
      submitter: HTMLElement;
    }
  > = async (evt) => {
    evt.preventDefault();

    await invoke('generate_pdf', {
      sourcePath: sourceDir(),
      targetPath: targetDir(),
      reference: reference(),
    });
  };

  const handleSourceDirSelect = async () => {
    const path = await openSelectDirectoryDialog();
    if (!path) return null;

    const entries = await readDir(path);
    const isEmpty =
      entries.length === 0 ||
      (entries.length === 1 && entries[0].isFile && entries[0].name === 'desktop.ini');

    if (isEmpty) {
      await message(
        'The directory you selected is empty please select a directory containing at least one image.',
        {
          kind: 'error',
          title: 'Empty directory',
        },
      );

      setSourceDirValidity(false);
      return null;
    }

    setSourceDirValidity(true);
    return path;
  };

  return (
    <form
      onSubmit={handleSubmit}
      class="mx-4 my-2 flex flex-col gap-y-2.5"
    >
      <section class="flex items-center gap-x-4">
        <UploadButton
          label={sourceDir() ?? 'Select source directory'}
          validity={sourceDirValidity()}
          onClick={async () => setSourceDir(await handleSourceDirSelect())}
        />

        <UploadButton
          label={targetDir() ?? 'Select target directory'}
          validity={true}
          onClick={async () => setTargetDir(await openSelectDirectoryDialog())}
        />

        <input
          type="text"
          placeholder="Enter Reference"
          class="w-full rounded border-2 border-blue-700 bg-slate-100 px-3.5 py-2.5 text-sm outline-slate-800 focus:border-blue-600 focus:outline-none"
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
