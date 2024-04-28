import { convertFileSrc } from '@tauri-apps/api/core';
import { useAnalyzedDocumentsContext } from '../../stores/analyzed-documents';
import { Show } from 'solid-js';

export default () => {
  const [{ currentAnalyzedDocumentByIdx }] = useAnalyzedDocumentsContext();

  return (
    <Show when={currentAnalyzedDocumentByIdx()}>
      <img src={convertFileSrc(currentAnalyzedDocumentByIdx()!.imagePath)} />
    </Show>
  );
};
