import AnalyzedDocumentsSection from '../components/analyzed-documents-viewer/AnalyzedDocumentsSection';
import ScanSourcesForm from '../components/scan-sources/ScanSourcesForm';
import { AnalyzedDocumentsProvider } from '../contexts/analyzed-documents';
import { SourcesProvider } from '../contexts/sources';

export default () => (
  <main class="flex min-h-screen flex-col items-center gap-y-4 bg-base">
    <AnalyzedDocumentsProvider>
      <SourcesProvider>
        <ScanSourcesForm />

        <AnalyzedDocumentsSection />
      </SourcesProvider>
    </AnalyzedDocumentsProvider>
  </main>
);
