import { normalizeText } from "./normalize";

export function mergeTranscript(prefix: string, addition: string): string {
  const cleanPrefix = prefix.replace(/\s+/g, " ").trim();
  const cleanAddition = addition.replace(/\s+/g, " ").trim();

  if (!cleanPrefix) {
    return cleanAddition;
  }
  if (!cleanAddition) {
    return cleanPrefix;
  }

  const prefixWords = cleanPrefix.split(" ");
  const additionWords = cleanAddition.split(" ");
  const normalizedPrefixWords = normalizeText(cleanPrefix).split(" ");
  const normalizedAdditionWords = normalizeText(cleanAddition).split(" ");
  const maxOverlap = Math.min(normalizedPrefixWords.length, normalizedAdditionWords.length);

  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    const prefixTail = normalizedPrefixWords.slice(-overlap).join(" ");
    const additionHead = normalizedAdditionWords.slice(0, overlap).join(" ");
    if (prefixTail === additionHead) {
      const remaining = additionWords.slice(overlap).join(" ");
      return [cleanPrefix, remaining].filter(Boolean).join(" ");
    }
  }

  return `${cleanPrefix} ${cleanAddition}`;
}
