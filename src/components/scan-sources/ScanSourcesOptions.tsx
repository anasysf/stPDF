import { For, createSignal } from 'solid-js';
import { type BarcodeTypes } from './types';

export default () => {
  const barcodeTypes: Record<BarcodeTypes, string> = {
    'code-128': 'Code 128',
    'qr-code': 'QR Code',
  } as const;

  const [barcodeType, setBarcodeType] = createSignal<BarcodeTypes>('code-128');

  return (
    <section class="inline-flex items-center">
      <select
        class="w-[21.1rem] gap-x-4 rounded bg-slate-800 p-2 text-white focus:outline-none"
        onChange={(e) => setBarcodeType(e.currentTarget.value as BarcodeTypes)}
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
              selected={barcodeType() === key}
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
