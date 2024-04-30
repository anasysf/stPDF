import ScanSourcesForm from '../components/scan-sources/ScanSourcesForm';
import Carousel from '../components/analyzed-documents-viewer/Carousel';
import CarouselNavigationBtns from '../components/analyzed-documents-viewer/CarouselNavigationBtns';
import { AnalyzedDocumentsProvider } from '../contexts/analyzed-documents';
import { SourcesProvider } from '../contexts/sources';
import SourcesGalleryBar from '../components/analyzed-documents-viewer/SourcesGalleryBar';
import DetailsBar from '../components/analyzed-documents-viewer/DetailsBar';

export default () => (
  <main class="flex min-h-screen flex-col items-center bg-slate-900">
    <AnalyzedDocumentsProvider>
      <SourcesProvider>
        <section class="flex w-11/12 flex-col items-center">
          <ScanSourcesForm />
        </section>

        <section class="grid w-11/12 grid-cols-12 gap-x-4">
          <div class="col-span-4">
            <SourcesGalleryBar />
          </div>

          <div class="col-span-5 flex w-full flex-col gap-y-2">
            <Carousel />

            <div class="justify-self-center">
              <CarouselNavigationBtns />
            </div>
          </div>

          <div class="col-span-3">
            <DetailsBar />
          </div>
        </section>
      </SourcesProvider>
    </AnalyzedDocumentsProvider>
  </main>
);
