import { Index } from 'solid-js';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import './styles/index.css';

export default () => {
  const [{ analyzedDocs, setCurrentAnalyzedDocumentIdx, currentAnalyzedDocumentIdx }] =
    useAnalyzedDocumentsContext();

  return (
    <aside class="scroller flex h-[32.5rem] grow overflow-y-auto scroll-smooth">
      <div
        class="grid grid-cols-4 gap-0.5 rounded"
        role="list"
      >
        <Index each={analyzedDocs}>
          {(doc, idx) => (
            <img
              id={`source-${idx}`}
              src={convertFileSrc(doc().imagePath)}
              class={`cursor-pointer rounded-lg border-4 transition-colors duration-150 ease-in hover:border-blue-600 ${currentAnalyzedDocumentIdx() === idx ? 'border-blue-600' : 'border-transparent'}`}
              loading="lazy"
              onClick={() => setCurrentAnalyzedDocumentIdx(idx)}
            />
          )}
        </Index>
      </div>
    </aside>
  );
};
