import { Match, Show, Switch } from 'solid-js';
import { useDocumentsContext } from '../../stores/documents';
import { type AnalyzedDocumentsRes } from '../../entities/analyzed-documents/types';
import ParentViewer from './ParentViewer';
import BjaViewer from './BjaViewer';
import UnrecognizedViewer from './UnrecognizedViewer';

export default function DocumentViewer() {
  const { currentDocumentByIdx, documents } = useDocumentsContext();

  return (
    <section>
      <Show when={!documents().length}>
        <p class="text-center font-bold text-slate-200 lg:text-xl">Analyze some documents first.</p>
      </Show>

      <Show when={documents().length}>
        <Switch>
          <Match when={currentDocumentByIdx().type === 'Bja'}>
            <BjaViewer bja={currentDocumentByIdx() as AnalyzedDocumentsRes<'Bja'>} />
          </Match>

          <Match when={currentDocumentByIdx().type === 'Parent'}>
            <ParentViewer parent={currentDocumentByIdx() as AnalyzedDocumentsRes<'Parent'>} />
          </Match>

          <Match when={currentDocumentByIdx().type === 'Unrecognized'}>
            <UnrecognizedViewer
              unrecognized={currentDocumentByIdx() as AnalyzedDocumentsRes<'Unrecognized'>}
            />
          </Match>
        </Switch>
      </Show>
    </section>
  );
}
