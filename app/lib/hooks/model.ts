import type { Models } from "~/server/chat";
import { atom, useAtom } from "jotai";

const providerAtom = atom<keyof Models | undefined>(undefined);

const modelsAtom = atom<Record<string, string>>({});

export function useProvider() {
  return useAtom(providerAtom);
}

export function useModel() {
  const provider = useAtom(providerAtom)[0];
  const [models, setModels] = useAtom(modelsAtom);

  const setModel = (model: string) => {
    setModels((prev: Record<string, string>) => {
      return { ...prev, [provider!]: model };
    });
  };

  const currentModel = models[provider!];
  return [currentModel, setModel] as const;
}
