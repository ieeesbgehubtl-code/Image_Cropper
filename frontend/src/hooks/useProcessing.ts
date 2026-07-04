import { useMutation } from "@tanstack/react-query";
import { processMultiple, processSingle, processZip } from "../services/api";
export function useProcessing(background: string) {
  return useMutation({
    mutationFn: async (files: File[]) => {
      if (files.length === 1 && files[0].name.toLowerCase().endsWith(".zip"))
        return processZip(files[0], background);
      if (files.length === 1)
        return {
          total: 1,
          succeeded: 1,
          failed: 0,
          results: [await processSingle(files[0], background)],
        };
      return processMultiple(files, background);
    },
  });
}
