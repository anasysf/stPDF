import { Component, For, JSX } from "solid-js";

type Props = {
  readonly data: Record<PropertyKey, string>;
  readonly defaultOption: string;
  readonly selected: string;
  readonly onChange?: JSX.ChangeEventHandlerUnion<HTMLSelectElement, Event> | undefined;
};

const Select: Component<Props> = (props) => {
  return (
    <select onChange={props.onChange}>
      <option value="" disabled>{props.defaultOption}</option>

      <For each={Object.entries(props.data)}>
        {([key, value]) => (
          <option
            value={value}
            selected={key === props.selected}
          >
            {key}
          </option>
        )}
      </For>
    </select>
  );
};

export default Select;
