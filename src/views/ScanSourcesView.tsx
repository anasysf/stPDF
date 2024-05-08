import { AnalyzedDocumentsProvider } from '../contexts/analyzed-documents';
import { SourcesProvider } from '../contexts/sources';
import AnalyzedDocumentsSection from '../components/analyzed-documents-viewer/AnalyzedDocumentsSection';
import Form from '../components/scan-sources/Form';

export default () => (
  <main class="flex min-h-screen flex-col items-center gap-y-4 bg-base">
    <AnalyzedDocumentsProvider>
      <SourcesProvider>
        <Form />
        {/* <section class="flex w-11/12 flex-col items-center">
          <ScanSourcesForm />
        </section> */}

        <AnalyzedDocumentsSection />
      </SourcesProvider>
    </AnalyzedDocumentsProvider>
  </main>
);
