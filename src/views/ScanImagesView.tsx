import { DetailsBar } from '../components/DetailsBar';
import ScanImagesForm from '../components/ScanImagesForm';
import Carousel from '../components/analyzed-documents-viewer/Carousel';
import CarouselNavigationBtns from '../components/analyzed-documents-viewer/CarouselNavigationBtns';
import DocumentViewer from '../components/document-viewer/DocumentViewer';
import { AnalyzedDocumentsProvider } from '../stores/analyzed-documents';
import { DocumentsProvider } from '../stores/documents';

export default function ScanImagesView() {
  return (
    <main class="flex min-h-screen flex-col items-center gap-y-10 bg-slate-900">
      <AnalyzedDocumentsProvider>
        <ScanImagesForm />

        <section class="flex flex-col items-center">
          <Carousel />
          <CarouselNavigationBtns />
        </section>

        {/* <section class="mx-4 grid w-11/12 grid-cols-12 content-center gap-x-6 lg:w-2/3">
          <section class="col-span-4">
            <DocumentViewer />
          </section>

          <section class="col-span-4 h-fit w-full rounded-xl border border-blue-800 px-2 py-4">
            <DetailsBar />
          </section>
        </section> */}
      </AnalyzedDocumentsProvider>
    </main>
  );
}
