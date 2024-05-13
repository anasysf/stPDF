import { type Component, For, type JSX } from 'solid-js';

type Props = {
  readonly data: Record<PropertyKey, string>;
  readonly defaultOption: string;
  readonly selected: string;
  readonly tabindex?: number | string;
  readonly required?: boolean;
  readonly onChange: JSX.ChangeEventHandlerUnion<HTMLSelectElement, Event>;
};

const Select: Component<Props> = (props) => (
  <select
    /* eslint-disable-next-line solid/reactivity */
    onChange={props.onChange}
    class="w-full rounded border-2 border-transparent bg-mantle px-2 py-1.5 text-text shadow transition duration-300 ease-in-out focus:border-mauve focus:shadow-lg focus:outline-none"
    tabindex={props.tabindex}
    required={props.required}
  >
    <option
      value=""
      disabled
    >
      {props.defaultOption}
    </option>

    <For each={Object.entries(props.data)}>
      {([key, value]) => (
        <option
          value={key}
          selected={key === props.selected}
        >
          {value}
        </option>
      )}
    </For>
  </select>
);

export default Select;
