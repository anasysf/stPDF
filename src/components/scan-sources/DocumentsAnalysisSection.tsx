import { useSourcesContext } from "../../contexts/sources";
import { BranchContracts } from "../../contexts/sources/types";
import Input from "./forms/Input";
import Select from "./forms/Select";

const BRANCH_CONTRACT: Record<string, BranchContracts> = {
  'Contrat Automobile': 'c-auto',
  'Contrat Risque Divers': 'c-rd',
  'Contrat MRC': 'c-mrc',
} as const;

export default () => {
  const [{ sourcesFormData, updateSourcesFormData }] = useSourcesContext();

  return (
    <div class="inline-flex items-center w-full">
      <Input
        placeholder="Entrer le numero de conteneur..."
        value={sourcesFormData.reference}
        onInput={(e) => updateSourcesFormData('reference', e.currentTarget.value)}
      />

      <Select
        data={BRANCH_CONTRACT}
        defaultOption="Veuillez choisir le type de contrat"
        selected={sourcesFormData.branchContract}
        onChange={(e) => updateSourcesFormData('branchContract', e.currentTarget.value as BranchContracts)}
      />
    </div>
  );
};
