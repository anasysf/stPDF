import ScanSourcesForm from '../components/scan-sources/ScanSourcesForm';
import { AnalyzedDocumentsProvider } from '../contexts/analyzed-documents';
import { SourcesProvider } from '../contexts/sources';
import AnalyzedDocumentsSection from '../components/analyzed-documents-viewer/AnalyzedDocumentsSection';

export default () => (
  <main class="flex min-h-screen flex-col items-center bg-slate-900">
    <AnalyzedDocumentsProvider>
      <SourcesProvider>
        <section class="flex w-11/12 flex-col items-center">
          <ScanSourcesForm />
        </section>

        <AnalyzedDocumentsSection />
      </SourcesProvider>
    </AnalyzedDocumentsProvider>
  </main>
);
