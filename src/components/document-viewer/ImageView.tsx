import { Match, Switch } from "solid-js";
import { useDocumentsContext } from "../../contexts/documents/documentsContext";

export default () => {
  const { currentDocumentByIdx } = useDocumentsContext();

  return (
    <section class="flex flex-col">
      <div class="basis-11/12">
        <Switch>
          <Match when={currentDocumentByIdx().type === 'Parent'}>
            <img src="" />
          </Match>
        </Switch>
        <img />
      </div>
    </section>
  );
};
