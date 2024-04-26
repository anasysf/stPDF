import { type Component, createMemo } from 'solid-js';
import { type AnalyzedDocumentsRes } from '../../entities/analyzed-documents/types';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useDocumentsContext } from '../../stores/documents';

type Props = { parent: AnalyzedDocumentsRes<'Parent'> };

const ParentViewer: Component<Props> = (props) => {
  const { currentParentDocumentImageIdx, previousParentDocumentImage, nextParentDocumentImage } =
    useDocumentsContext();

  const currentImagePosition = createMemo(() => currentParentDocumentImageIdx() + 1);

  const images = createMemo(() =>
    Array.from([props.parent.imagePath, ...props.parent.children.map((child) => child.imagePath)]),
  );

  const currentImagePositionTitle = createMemo(
    () => `${currentImagePosition()}/${images().length}`,
  );

  const currentParentDocumentImageByIdx = createMemo(
    () => images()[currentParentDocumentImageIdx()],
  );

  return (
    <section class="flex flex-col items-center gap-y-2">
      <section>
        <img
          class="rounded border-2 border-blue-700"
          src={convertFileSrc(currentParentDocumentImageByIdx())}
        />
      </section>

      <section class="inline-flex w-full items-center justify-center gap-x-4 lg:gap-x-6">
        <button
          class={`rounded bg-slate-800 px-3 py-1 font-semibold text-white transition duration-75 ease-out hover:bg-slate-700 active:text-slate-900 ${currentParentDocumentImageIdx() - 1 === 0 ? 'visible' : 'invisible'}`}
          onClick={() => previousParentDocumentImage()}
        >
          <i class="fa-solid fa-arrow-left" />
        </button>

        <strong class="text-xl font-bold text-slate-200">{currentImagePositionTitle()}</strong>

        <button
          class={`rounded bg-blue-600 px-3 py-1 font-semibold text-slate-200 transition duration-75 ease-out hover:bg-blue-500 active:bg-blue-900 ${currentParentDocumentImageIdx() + 1 < images().length ? 'visible' : 'invisible'}`}
          onClick={() => nextParentDocumentImage(images())}
        >
          <i class="fa-solid fa-arrow-right" />
        </button>
      </section>
    </section>
  );
};

export default ParentViewer;
