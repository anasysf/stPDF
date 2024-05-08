import { type Component } from 'solid-js';

type Props = {
  readonly text: string;
};

const Title: Component<Props> = (props) => (
  <div class="relative">
    <h1 class="inline-block border-b-4 border-b-mauve pb-0.5 text-2xl font-bold text-text">
      {props.text}
    </h1>
  </div>
);

export default Title;
