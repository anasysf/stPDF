import { Component, JSX } from "solid-js";

type InputTypes = 'string' | 'number';

type Props<T extends InputTypes> = {
  readonly type?: T;
  readonly placeholder: string;
  readonly required?: boolean;
  readonly value: T extends 'string' ? string : number;
  readonly onInput: JSX.InputEventHandlerUnion<HTMLInputElement, InputEvent> | undefined;
};

const Input: Component<Props<InputTypes>> = (props) => {
  return (
      <input
        type={props.type ?? 'string'}
        placeholder={props.placeholder}
        class="w-full rounded border-2 border-teal-800 bg-slate-800 px-4 py-1 text-white focus:outline-none"
        required={props.required}
        value={props.value}
        onInput={props.onInput}
      />
  );
};

export default Input;
