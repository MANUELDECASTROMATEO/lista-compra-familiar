import { normalizeText } from "./normalize";

export function mergeTranscript(prefix: string, addition: string): string {
  const cleanPrefix = prefix.replace(/\s+/g, " ").trim();
  const cleanAddition = addition.replace(/\s+/g, " ").trim();

  if (!cleanPrefix) {
    return dropRepeatedWords(cleanAddition);
  }
  if (!cleanAddition) {
    return dropRepeatedWords(cleanPrefix);
  }

  const additionWords = cleanAddition.split(" ");
  const normalizedPrefixWords = normalizeText(cleanPrefix).split(" ");
  const normalizedAdditionWords = normalizeText(cleanAddition).split(" ");
  const maxOverlap = Math.min(normalizedPrefixWords.length, normalizedAdditionWords.length);

  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    const prefixTail = normalizedPrefixWords.slice(-overlap).join(" ");
    const additionHead = normalizedAdditionWords.slice(0, overlap).join(" ");
    if (prefixTail === additionHead) {
      const remaining = additionWords.slice(overlap).join(" ");
      return dropRepeatedWords([cleanPrefix, remaining].filter(Boolean).join(" "));
    }
  }

  return dropRepeatedWords(`${cleanPrefix} ${cleanAddition}`);
}

function dropRepeatedWords(value: string): string {
  const words = value.split(" ");
  const normalizedWords = normalizeText(value).split(" ");
  const kept: string[] = [];
  let previousNormalized = "";

  for (let index = 0; index < words.length; index += 1) {
    if (normalizedWords[index] === previousNormalized) {
      continue;
    }
    kept.push(words[index]);
    previousNormalized = normalizedWords[index];
  }

  return kept.join(" ");
}
