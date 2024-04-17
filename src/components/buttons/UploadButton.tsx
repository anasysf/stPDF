import { Match, Switch, type Component } from 'solid-js';

type Props = {
  readonly label: string;
  readonly uploaded: boolean;
  readonly onClick: () => Promise<string | string[] | null>;
};

const UploadButton: Component<Props> = (props) => (
  <label
    class={`block w-full truncate rounded px-4 py-2 text-white shadow outline-none transition-colors duration-150 ease-in hover:shadow-lg ${props.uploaded ? 'bg-teal-700 hover:bg-teal-600' : 'bg-blue-600 hover:bg-blue-500'}`}
    role="button"
    onClick={async () => props.onClick()}
  >
    <Switch
      fallback={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mr-2 inline w-6 fill-white"
          viewBox="0 0 32 32"
        >
          <path
            d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
            data-original="#000000"
          />
          <path
            d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
            data-original="#000000"
          />
        </svg>
      }
    >
      <Match when={props.uploaded}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mr-2 inline w-5 fill-white"
          viewBox="0 0 512 512"
        >
          <path
            d="M383.841 171.838c-7.881-8.31-21.02-8.676-29.343-.775L221.987 296.732l-63.204-64.893c-8.005-8.213-21.13-8.393-29.35-.387-8.213 7.998-8.386 21.137-.388 29.35l77.492 79.561a20.687 20.687 0 0 0 14.869 6.275 20.744 20.744 0 0 0 14.288-5.694l147.373-139.762c8.316-7.888 8.668-21.027.774-29.344z"
            data-original="#000000"
          />
          <path
            d="M256 0C114.84 0 0 114.84 0 256s114.84 256 256 256 256-114.84 256-256S397.16 0 256 0zm0 470.487c-118.265 0-214.487-96.214-214.487-214.487 0-118.265 96.221-214.487 214.487-214.487 118.272 0 214.487 96.221 214.487 214.487 0 118.272-96.215 214.487-214.487 214.487z"
            data-original="#000000"
          />
        </svg>
      </Match>
    </Switch>
    {props.label}
  </label>
);

export default UploadButton;
