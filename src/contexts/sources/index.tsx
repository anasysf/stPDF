import { createContext, useContext, type ParentComponent } from 'solid-js';
import { createStore } from 'solid-js/store';
import { type SourcesFormData } from './types';

const makeSourcesContext = () => {
  const [sourcesFormData, setSourcesFormData] = createStore<SourcesFormData>({
    sources: [],
    targetDir: null,
    reference: '',
    watermark: 'UTILISATION INTERNE SEULEMENT.',
    identifierType: 'code-128',
    branchContract: 'c-auto',
  });

  const updateSourcesFormData = <K extends keyof SourcesFormData, V extends SourcesFormData[K]>(
    field: K,
    value: V,
  ): void => {
    setSourcesFormData({
      [field]: value,
    });
  };

  const resetSourcesFormData = () => {
    setSourcesFormData({
      sources: [],
      targetDir: null,
      reference: '',
      watermark: '',
      identifierType: 'code-128',
      branchContract: 'c-auto',
    });
  };

  return [
    {
      sourcesFormData,
      setSourcesFormData,
      updateSourcesFormData,
      resetSourcesFormData,
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
