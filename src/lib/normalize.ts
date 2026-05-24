const IRREGULAR_PLURALS: Record<string, string> = {
  panales: "panal",
  yogures: "yogur",
};

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function singularize(value: string): string {
  const normalized = normalizeText(value);
  const words = normalized.split(" ");
  const last = words.at(-1);

  if (!last || last.length <= 3) {
    return normalized;
  }

  if (IRREGULAR_PLURALS[last]) {
    words[words.length - 1] = IRREGULAR_PLURALS[last];
    return words.join(" ");
  }

  if (last.endsWith("s") && last.length > 4) {
    words[words.length - 1] = last.slice(0, -1);
    return words.join(" ");
  }

  return normalized;
}
