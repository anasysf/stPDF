import { convertFileSrc } from '@tauri-apps/api/core';
import { useAnalyzedDocumentsContext } from '../../contexts/analyzed-documents';
import { Show, createSignal } from 'solid-js';
import './styles/index.css';

type DragEvent = MouseEvent & {
    currentTarget: HTMLDivElement;
    target: Element;
}

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
    <Show when={Boolean(currentAnalyzedDocumentByIdx())}>
      <div
        ref={container}
        class="scroller h-[28rem] w-full overflow-hidden relative"
        onMouseDown={(e) => mouseDown(e)}
        onMouseUp={() => mouseUp()}
        onMouseMove={(e) => mouseMove(e)}
      >
        <img
          ref={img}
          src={convertFileSrc(currentAnalyzedDocumentByIdx()!.imagePath)}
          class="w-full max-w-none h-auto absolute"
        />
      </div>
    </Show>
  );
};
