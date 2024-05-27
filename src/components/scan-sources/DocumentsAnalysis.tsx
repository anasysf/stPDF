import { message } from '@tauri-apps/plugin-dialog';
import { createMemo } from 'solid-js';
import { useSourcesContext } from '../../contexts/sources';
import { type BranchContracts } from '../../contexts/sources/types';
import { openImageDialog } from '../../services/dialogService';
import Input from './forms/Input';
import Select from './forms/Select';
import UploadButton from './forms/UploadButton';

const branchContract: Record<BranchContracts, string> = {
  'c-auto': 'Contrat Automobile',
  'c-rd': 'Contrat Risque Divers',
  'c-mrc': 'Contrat MRC',
} as const;

export default () => {
  const [{ sourcesFormData, updateSourcesFormData }] = useSourcesContext();

  const sourcesLen = createMemo(() => sourcesFormData.sources.length);

  const handleSourceSelect = async () => {
    try {
      const sources = await openImageDialog();
      if (!sources || sources.length === 0) return;

      updateSourcesFormData(
        'sources',
        sources.map((source) => source.path),
      );
    } catch (error) {
      await message('Could not open file dialog.', {
        title: 'Oops..!',
        kind: 'error',
      });
    }
  };

  return (
    <section class="inline-flex w-full items-center gap-x-4">
      <Input
        placeholder="Entrer le numero de conteneur..."
        value={sourcesFormData.reference}
        onInput={(e) => {
          updateSourcesFormData('reference', e.currentTarget.value);
        }}
        autofocus
        tabindex="1"
        title="Numero de conteneur"
        required
      />

      <Select
        data={branchContract}
        defaultOption="Veuillez choisir le type de contrat"
        selected={sourcesFormData.branchContract}
        onChange={(e) => {
          updateSourcesFormData('branchContract', e.currentTarget.value as BranchContracts);
        }}
        tabindex="2"
        required
      />

      <UploadButton
        text={
          sourcesFormData.sources.length === 0 ?
            'Sélectionner les sources'
          : `Sélectionné (${sourcesLen()})`
        }
        isUploaded={sourcesFormData.sources.length !== 0}
        tabindex="3"
        onClick={async () => handleSourceSelect()}
      />
    </section>
  );
};
