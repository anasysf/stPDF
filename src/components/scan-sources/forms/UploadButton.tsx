import { Show, type Component, type JSX } from 'solid-js';

type Props = {
  readonly text: string;
  readonly isUploaded: boolean;
  readonly tabindex?: number | string;
  readonly onClick: JSX.EventHandlerUnion<HTMLLabelElement, MouseEvent>;
};

const UploadButton: Component<Props> = (props) => (
  <label
    class={`inline-flex w-full items-center gap-x-3 rounded border-2 border-transparent px-3 py-1 text-lg font-semibold transition-colors duration-200 ease-in focus:border-mauve focus:outline-none ${props.isUploaded ? 'bg-green text-white' : 'bg-mantle text-text hover:bg-surface0 active:bg-crust'}`}
    role="button"
    tabindex={props.tabindex}
    /* eslint-disable-next-line solid/reactivity */
    onClick={props.onClick}
  >
    <Show
      when={props.isUploaded}
      fallback={<i class="fa-solid fa-arrow-up-from-bracket" />}
    >
      <i class="fa-regular fa-circle-check" />
    </Show>

    {props.text}
  </label>
);

export default UploadButton;
