import { Show, createMemo } from 'solid-js';
import { useDocumentsContext } from '../stores/documents';
import plurify from '../utils/plurify';

export function DetailsBar() {
  const { documents, sources, currentDocumentIdx, nextDocument, previousDocument } =
    useDocumentsContext();

  const sourcesSizeTitle = createMemo(
    () => `${sources().length} ${plurify('Source', sources().length)}`,
  );

  const documentsSizeTitle = createMemo(
    () => `${documents().length} ${plurify('Document', documents().length)}`,
  );

  const currentDocumentPosition = createMemo(() => currentDocumentIdx() + 1);

  const currentDocumentPositionTitle = createMemo(
    () => `${currentDocumentPosition()}/${documents().length}`,
  );

  return (
    <aside class="flex min-h-full flex-col items-center justify-start gap-y-3">
      <div class="flex flex-col gap-y-1.5">
        <strong class="text-xl text-slate-200">{sourcesSizeTitle()}</strong>
        <strong class="text-xl text-slate-200">{documentsSizeTitle()}</strong>
      </div>

      <Show when={documents().length}>
        <section class="inline-flex w-full items-center justify-center gap-x-4 lg:gap-x-6">
          <button
            class={`rounded bg-slate-800 px-3 py-1 font-semibold text-white transition duration-75 ease-out hover:bg-slate-700 active:text-slate-900 ${currentDocumentIdx() > 0 ? 'visible' : 'invisible'}`}
            onClick={() => previousDocument()}
          >
            <i class="fa-solid fa-arrow-left" />
          </button>

          <strong class="text-xl font-bold text-slate-200">{currentDocumentPositionTitle()}</strong>

          <button
            class={`rounded bg-blue-600 px-3 py-1 font-semibold text-slate-200 transition duration-75 ease-out hover:bg-blue-500 active:bg-blue-900 ${currentDocumentIdx() + 1 < documents().length - 1 ? 'visible' : 'invisible'}`}
            onClick={() => nextDocument()}
          >
            <i class="fa-solid fa-arrow-right" />
          </button>
        </section>
      </Show>
    </aside>
  );
}
