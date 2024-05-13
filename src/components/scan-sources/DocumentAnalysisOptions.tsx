import { message } from '@tauri-apps/plugin-dialog';
import { useSourcesContext } from '../../contexts/sources';
import { type IdentifierTypes } from '../../contexts/sources/types';
import { openDirectoryDialog } from '../../services/dialogService';
import Input from './forms/Input';
import Select from './forms/Select';
import UploadButton from './forms/UploadButton';

const identifierTypes: Record<IdentifierTypes, string> = {
  'code-128': 'Code 128',
  'qr-code': 'QR Code',
} as const;

export default () => {
  const [{ sourcesFormData, updateSourcesFormData }] = useSourcesContext();

  const handleTargetDirSelect = async () => {
    try {
      const targetDir = await openDirectoryDialog();
      if (!targetDir) return;

      updateSourcesFormData('targetDir', targetDir);
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
        placeholder="Entrer un filigrane..."
        value={sourcesFormData.watermark}
        onInput={(e) => {
          updateSourcesFormData('watermark', e.currentTarget.value);
        }}
        tabindex="4"
        title="Filigrane"
        required
      />

      <Select
        data={identifierTypes}
        defaultOption="Veuillez choisir le type de code-barres"
        selected={sourcesFormData.identifierType}
        onChange={(e) => {
          updateSourcesFormData('identifierType', e.currentTarget.value as IdentifierTypes);
        }}
        tabindex="5"
        required
      />

      <UploadButton
        text={sourcesFormData.targetDir ?? 'Sélectionner le répertoire cible'}
        isUploaded={Boolean(sourcesFormData.targetDir)}
        tabindex="6"
        onClick={async () => handleTargetDirSelect()}
      />
    </section>
  );
};
