import { convertFileSrc } from '@tauri-apps/api/core';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import { createSignal } from 'solid-js';

type DragEvent = MouseEvent & {
  currentTarget: HTMLDivElement;
  target: Element;
};

export default () => {
  let img!: HTMLImageElement;
  let container!: HTMLDivElement;

  const [isDragging, setIsDragging] = createSignal(false);
  const [startX, setStartX] = createSignal(0);
  const [startY, setStartY] = createSignal(0);
  const [offsetX, setOffsetX] = createSignal(0);
  const [offsetY, setOffsetY] = createSignal(0);

  const [{ currentAnalyzedDocumentByIdx }] = useAnalyzedDocumentsContext();

  const mouseDown = (e: DragEvent) => {
    setIsDragging(true);

    setStartX(e.clientX - offsetX());
    setStartY(e.clientY - offsetY());
  };

  const mouseUp = () => {
    setIsDragging(false);
  };

  const mouseMove = (e: DragEvent) => {
    if (isDragging()) {
      e.preventDefault();

      const x = e.clientX - startX();
      const y = e.clientY - startY();

      setOffsetX(x);
      setOffsetY(y);

      img.style.left = `${offsetX()}px`;
      img.style.top = `${offsetY()}px`;
    }
  };

  return (
    <div
      ref={container}
      class="relative h-[31.3rem] w-full overflow-hidden rounded bg-crust shadow-xl"
      onMouseDown={(e) => {
        mouseDown(e);
      }}
      onMouseUp={() => {
        mouseUp();
      }}
      onMouseMove={(e) => {
        mouseMove(e);
      }}
    >
      <img
        ref={img}
        src={convertFileSrc(currentAnalyzedDocumentByIdx()!.metadata.imagePath)}
        class="absolute h-auto w-full max-w-none"
      />
    </div>
  );
};
