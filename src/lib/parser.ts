import { normalizeText, singularize } from "./normalize";
import { SECTION_TERMS } from "./sections";
import type { ParsedInputItem } from "./types";

const UNITS = new Set(["kg", "kilo", "kilos", "g", "gr", "litro", "litros", "l", "pack", "paquete", "paquetes", "caja", "cajas"]);
const KNOWN_TERMS = Object.values(SECTION_TERMS)
  .flat()
  .map((term) => singularize(term).split(" "))
  .sort((a, b) => b.length - a.length);

export function parseShoppingInput(input: string): ParsedInputItem[] {
  const cleaned = splitInput(input);

  return cleaned
    .map(parsePart)
    .filter((item): item is ParsedInputItem => item !== null && item.name.length > 0);
}

function splitInput(input: string): string[] {
  const hasExplicitSeparators = /,|\r?\n|\s+(y|e)\s+/i.test(input);
  const normalized = normalizeText(input);

  if (!normalized) {
    return [];
  }

  if (hasExplicitSeparators) {
    return input
      .replace(/\r?\n/g, ",")
      .replace(/\s+(y|e)\s+/gi, ",")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return splitContinuousDictation(normalized);
}

function splitContinuousDictation(normalized: string): string[] {
  const tokens = normalized.split(" ");
  const parts: string[] = [];
  let current: string[] = [];
  let index = 0;

  while (index < tokens.length) {
    const matchLength = findKnownTermLength(tokens, index);
    if (matchLength > 0) {
      if (current.length > 0 && !isQuantityPrefix(current)) {
        parts.push(current.join(" "));
        current = [];
      }
      current = [...current, ...tokens.slice(index, index + matchLength)];
      index += matchLength;
      continue;
    }

    current.push(tokens[index]);
    index += 1;
  }

  if (current.length > 0) {
    parts.push(current.join(" "));
  }

  return parts;
}

function findKnownTermLength(tokens: string[], start: number): number {
  for (const termTokens of KNOWN_TERMS) {
    const candidate = tokens.slice(start, start + termTokens.length).join(" ");
    if (singularize(candidate) === termTokens.join(" ")) {
      return termTokens.length;
    }
  }

  return 0;
}

function isQuantityPrefix(tokens: string[]): boolean {
  if (tokens.length === 0 || tokens.length > 2) {
    return false;
  }

  const first = Number(tokens[0]?.replace(",", "."));
  if (!Number.isFinite(first) || first <= 0) {
    return false;
  }

  return tokens.length === 1 || UNITS.has(tokens[1]);
}

function parsePart(part: string): ParsedInputItem | null {
  const normalized = normalizeText(part);
  if (!normalized) {
    return null;
  }

  const tokens = normalized.split(" ");
  let quantity = 1;
  let unit: string | undefined;
  let nameTokens = tokens;

  const first = Number(tokens[0]?.replace(",", "."));
  if (Number.isFinite(first) && first > 0) {
    quantity = first;
    nameTokens = tokens.slice(1);
  }

  if (nameTokens[0] && UNITS.has(nameTokens[0])) {
    unit = nameTokens[0];
    nameTokens = nameTokens.slice(1);
  } else if (nameTokens[1] && UNITS.has(nameTokens[1]) && quantity !== 1) {
    unit = nameTokens[1];
    nameTokens = [nameTokens[0], ...nameTokens.slice(2)];
  }

  const normalizedName = singularize(nameTokens.join(" "));
  if (!normalizedName) {
    return null;
  }

  return {
    name: titleCase(normalizedName),
    normalizedName,
    quantity,
    unit,
  };
}

function titleCase(value: string): string {
  return value.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}
