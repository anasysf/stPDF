import { type Component, type JSX } from 'solid-js';

type InputTypes = 'string' | 'number';

type Props<T extends InputTypes> = {
  readonly id?: string;
  readonly type?: T;
  readonly placeholder: string;
  readonly required?: boolean;
  readonly value: T extends 'string' ? string : number;
  readonly autofocus?: boolean;
  readonly tabindex?: number | string;
  readonly disabled?: boolean;
  readonly readonly?: boolean;
  readonly onInput: JSX.InputEventHandlerUnion<HTMLInputElement, InputEvent>;
};

const Input: Component<Props<InputTypes>> = (props) => (
  <input
    id={props.id}
    type={props.type ?? 'text'}
    placeholder={props.placeholder}
    class="w-full rounded border-2 border-surface2 bg-mantle px-3 py-1.5 text-text shadow transition duration-300 ease-in-out placeholder:text-slate-400 focus:border-mauve focus:shadow-lg focus:outline-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface0 disabled:shadow-none"
    required={props.required}
    value={props.value}
    /* eslint-disable-next-line solid/reactivity */
    onInput={props.onInput}
    autofocus={props.autofocus ?? false}
    tabindex={props.tabindex}
    pattern=".*\S+.*"
    disabled={props.disabled}
    readonly={props.readonly}
  />
);

export default Input;
