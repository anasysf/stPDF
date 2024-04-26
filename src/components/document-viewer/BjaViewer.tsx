import { type Component } from 'solid-js';
import { type AnalyzedDocumentsRes } from '../../entities/analyzed-documents/types';
import { convertFileSrc } from '@tauri-apps/api/core';

type Props = { bja: AnalyzedDocumentsRes<'Bja'> };

const BjaViewer: Component<Props> = (props) => (
  <section class="flex flex-col items-center gap-y-2">
    <img
      class="rounded border-2 border-blue-700"
      src={convertFileSrc(props.bja.imagePath)}
    />
  </section>
);

export default BjaViewer;
