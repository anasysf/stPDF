import { Component, For, JSX } from "solid-js";

type Props = {
  readonly data: Record<PropertyKey, string>;
  readonly defaultOption: string;
  readonly selected: string;
  readonly onChange?: JSX.ChangeEventHandlerUnion<HTMLSelectElement, Event> | undefined;
};

const UploadButton: Component<Props> = (props) => {
  return (
    <label for=""></label>
  );
};

export default UploadButton;
