import { type Component } from 'solid-js';

type Props = {
  readonly label: string;
  readonly validity: boolean;
  readonly onClick: () => Promise<string | null>;
};

const UploadButton: Component<Props> = (props) => (
  <label
    class={`block w-full truncate rounded px-4 py-2 text-white shadow outline-none transition-colors duration-150 ease-in hover:shadow-lg ${props.validity ? 'bg-blue-600 hover:bg-blue-500' : 'bg-red-600 hover:bg-red-600'}`}
    role="button"
    onClick={async () => props.onClick()}
  >
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
    {props.label}
  </label>
);

export default UploadButton;
