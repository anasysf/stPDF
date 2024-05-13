import { For } from 'solid-js';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import './styles/index.css';

export default () => {
  const [{ analyzedDocs, setCurrentAnalyzedDocumentIdx, currentAnalyzedDocumentIdx }] =
    useAnalyzedDocumentsContext();

  return (
    <aside
      class="flex h-[31.5rem] w-full grow overflow-y-auto scroll-smooth rounded bg-crust px-3 py-2.5 shadow-xl"
      data-simplebar
    >
      <div
        class="grid grid-cols-4 gap-1.5 rounded"
        role="list"
      >
        <For each={analyzedDocs}>
          {(doc, idx) => (
            <img
              id={`source-${idx()}`}
              src={convertFileSrc(doc.metadata.imagePath)}
              class={`cursor-pointer rounded-lg border-4 transition-colors duration-150 ease-in ${currentAnalyzedDocumentIdx() === idx() ? 'border-blue' : 'border-transparent hover:border-teal'}`}
              loading="lazy"
              onClick={() => setCurrentAnalyzedDocumentIdx(idx())}
            />
          )}
        </For>
      </div>
    </aside>
  );
};
