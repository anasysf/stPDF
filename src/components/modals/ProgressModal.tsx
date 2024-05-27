import { Show, type Component } from 'solid-js';
import { Portal } from 'solid-js/web';

type Props = {
  readonly title: string;
  readonly isOpen: boolean;
  readonly current: number | null;
  readonly len: number | null;
};

const ProgressModal: Component<Props> = (props) => (
  <Portal>
    <Show when={props.isOpen}>
      <div class="absolute inset-0 flex items-center justify-center bg-overlay0/70">
        <div
          class="flex w-full flex-col items-center justify-center"
          role="dialog"
        >
          <progress
            id="progress-bar"
            class="w-1/2 [&::-webkit-progress-bar]:rounded [&::-webkit-progress-bar]:bg-mauve [&::-webkit-progress-bar]:duration-200 [&::-webkit-progress-value]:rounded [&::-webkit-progress-value]:bg-blue [&::-webkit-progress-value]:transition-all"
            value={props.current!}
            max={props.len!}
          />

          <p class="text-2xl font-semibold text-white">
            {props.current}/{props.len}
          </p>
        </div>
      </div>
    </Show>
  </Portal>
);

export default ProgressModal;
