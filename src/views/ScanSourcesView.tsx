import { AnalyzedDocumentsProvider } from '../contexts/analyzed-documents';
import { SourcesProvider } from '../contexts/sources';
import AnalyzedDocumentsSection from '../components/analyzed-documents-viewer/AnalyzedDocumentsSection';
import ScanSourcesForm from '../components/scan-sources/ScanSourcesForm';

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
