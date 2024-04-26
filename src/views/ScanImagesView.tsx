import { DetailsBar } from '../components/DetailsBar';
import ScanImagesForm from '../components/ScanImagesForm';
import DocumentViewer from '../components/document-viewer/DocumentViewer';
import { DocumentsProvider } from '../stores/documents';

export default function ScanImagesView() {
  return (
    <main class="flex min-h-screen flex-col items-center gap-y-10 bg-slate-900">
      <DocumentsProvider>
        <ScanImagesForm />

        <section class="mx-4 grid w-11/12 grid-cols-12 content-center gap-x-6 lg:w-2/3">
          <section class="col-span-4">
            <DocumentViewer />
          </section>

          <section class="col-span-4 h-fit w-full rounded-xl border border-blue-800 px-2 py-4">
            <DetailsBar />
          </section>
        </section>
      </DocumentsProvider>
    </main>
  );
}
