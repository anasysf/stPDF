import { Show } from 'solid-js';
import Carousel from './Carousel';
import DetailsBar from './DetailsBar';
import SourcesGalleryBar from './SourcesGalleryBar';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import NoAnalyzedDocumentsSection from './NoAnalyzedDocumentsSection';
import StatusBar from './StatusBar';

export default () => {
  const [{ analyzedDocs }] = useAnalyzedDocumentsContext();

  return (
    <Show
      when={analyzedDocs.length !== 0}
      fallback={<NoAnalyzedDocumentsSection />}
    >
      <section class="flex w-11/12 flex-col gap-y-2">
        <div class="grid w-full grid-cols-12 gap-x-4">
          <div class="col-span-4">
            <SourcesGalleryBar />
          </div>

          <div class="col-span-5">
            <Carousel />
          </div>

          <div class="col-span-3">
            <DetailsBar />
          </div>
        </div>

        <div class="w-full">
          <StatusBar />
        </div>
      </section>
    </Show>
  );
};
