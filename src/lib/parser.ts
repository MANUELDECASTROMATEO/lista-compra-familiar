import { normalizeText, singularize } from "./normalize";
import type { ParsedInputItem } from "./types";

const UNITS = new Set(["kg", "kilo", "kilos", "g", "gr", "litro", "litros", "l", "pack", "paquete", "paquetes", "caja", "cajas"]);

export function parseShoppingInput(input: string): ParsedInputItem[] {
  const cleaned = input
    .replace(/\r?\n/g, ",")
    .replace(/\s+(y|e)\s+/gi, ",")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return cleaned
    .map(parsePart)
    .filter((item): item is ParsedInputItem => item !== null && item.name.length > 0);
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
