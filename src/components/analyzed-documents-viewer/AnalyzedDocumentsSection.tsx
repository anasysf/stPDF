import { Show } from 'solid-js';
import Carousel from './Carousel';
import CarouselNavigationBtns from './CarouselNavigationBtns';
import DetailsBar from './DetailsBar';
import SourcesGalleryBar from './SourcesGalleryBar';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import NoAnalyzedDocumentsSection from './NoAnalyzedDocumentsSection';
import StatusBar from './StatusBar';

export default () => {
  const [{ analyzedDocs }] = useAnalyzedDocumentsContext();

  return (
    <Show
      when={analyzedDocs.length}
      fallback={<NoAnalyzedDocumentsSection />}
    >
      <section class="grid w-11/12 grid-cols-12 gap-x-4">
        <div class="col-span-4">
          <SourcesGalleryBar />
        </div>

        <div class="col-span-5 flex w-full flex-col gap-y-2">
          <Carousel />

          <div class="inline-flex w-full items-center justify-between">
            <StatusBar />
            <CarouselNavigationBtns />
          </div>
        </div>

        <div class="col-span-3">
          <DetailsBar />
        </div>
      </section>
    </Show>
  );
};
