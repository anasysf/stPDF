import { type Component } from 'solid-js';
import { type AnalyzedDocumentsRes } from '../../entities/analyzed-documents/types';
import { convertFileSrc } from '@tauri-apps/api/core';

type Props = { unrecognized: AnalyzedDocumentsRes<'Unrecognized'> };

const UnrecognizedViewer: Component<Props> = (props) => (
  <section class="flex flex-col items-center gap-y-2">
    <img
      class="rounded border-2 border-blue-700"
      src={convertFileSrc(props.unrecognized.imagePath)}
    />
  </section>
);

export default UnrecognizedViewer;
