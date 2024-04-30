import { Index, Show } from 'solid-js';
import { useSourcesContext } from '../../contexts/sources';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import './styles/index.css';

export default () => {
  const [{ analyzedDocs, setCurrentAnalyzedDocumentIdx, currentAnalyzedDocumentIdx }] =
    useAnalyzedDocumentsContext();

  const [{ sources }] = useSourcesContext();

  return (
    <aside class="scroller flex h-[31rem] grow overflow-y-auto scroll-smooth">
      <div
        class="grid grid-cols-4 gap-0.5 rounded"
        role="list"
      >
        <Show when={analyzedDocs.length}>
          <Index each={sources()}>
            {(source, idx) => (
              <img
                id={`source-${idx}`}
                src={convertFileSrc(source())}
                class={`cursor-pointer rounded-lg border-4 transition-colors duration-150 ease-in hover:border-blue-600 ${currentAnalyzedDocumentIdx() === idx ? 'border-blue-600' : 'border-transparent'}`}
                loading="lazy"
                onClick={() => setCurrentAnalyzedDocumentIdx(idx)}
              />
            )}
          </Index>
        </Show>
      </div>
    </aside>
  );
};
