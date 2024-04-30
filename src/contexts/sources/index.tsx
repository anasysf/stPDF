import { type ParentComponent, createContext, useContext, createSignal } from 'solid-js';

const makeSourcesContext = () => {
  const [sources, setSources] = createSignal<string[]>([]);

  return [
    {
      sources,
      setSources,
    },
  ] as const;
};

type SourcesContextType = ReturnType<typeof makeSourcesContext>;

const SourcesContext = createContext<SourcesContextType>();

export const SourcesProvider: ParentComponent = (props) => {
  const value = makeSourcesContext();

  return <SourcesContext.Provider value={value}>{props.children}</SourcesContext.Provider>;
};

export function useSourcesContext() {
  const context = useContext(SourcesContext);
  if (!context) throw new ReferenceError('useSourcesContext must be within a SourcesProvider.');

  return context;
}
