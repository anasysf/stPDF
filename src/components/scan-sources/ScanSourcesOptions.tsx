import { For } from 'solid-js';
import { type IdentifierTypes } from '../../contexts/sources/types';
import { useSourcesContext } from '../../contexts/sources';

export default () => {
  const barcodeTypes: Record<IdentifierTypes, string> = {
    'code-128': 'Code 128',
    'qr-code': 'QR Code',
  } as const;

  const [{ sourcesFormData, updateSourcesFormData }] = useSourcesContext();

  return (
    <section class="inline-flex w-2/3 items-center gap-x-4">
      <input
        type="text"
        placeholder="Entrer un filigrane..."
        class="w-full rounded border-2 border-blue-900 bg-slate-800 px-4 py-2 text-white focus:outline-none"
        value={sourcesFormData.watermark}
        onInput={(e) => {
          updateSourcesFormData('watermark', e.currentTarget.value);
        }}
      />

      <select
        class="w-full rounded bg-slate-800 px-3 py-2.5 text-lg text-white focus:outline-none"
        onChange={(e) => {
          updateSourcesFormData('identifierType', e.currentTarget.value as IdentifierTypes);
        }}
      >
        <option
          value=""
          disabled
        >
          Veuillez choisir le type de code-barres
        </option>

        <For each={Object.entries(barcodeTypes)}>
          {([key, value]) => (
            <option
              value={key}
              selected={sourcesFormData.identifierType === key}
            >
              {value}
            </option>
          )}
        </For>
      </select>
      {/* <div class='rounded border border-blue-500'>
        <span>Detecter les page blanches</span>
      </div> */}
    </section>
  );
};
