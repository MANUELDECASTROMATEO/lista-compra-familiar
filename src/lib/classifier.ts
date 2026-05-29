import { DEFAULT_SECTION, SECTION_TERMS } from "./sections";
import { normalizeText, singularize } from "./normalize";
import { matchProductName } from "./product-catalog";
import type { FamilyRule, ShoppingSection } from "./types";

type TermIndexEntry = {
  term: string;
  section: ShoppingSection;
};

const TERM_INDEX: TermIndexEntry[] = Object.entries(SECTION_TERMS).flatMap(([section, terms]) =>
  terms.map((term) => ({
    term: singularize(term),
    section: section as ShoppingSection,
  })),
);

export function classifyItem(name: string, familyRules: FamilyRule[] = []): ShoppingSection {
  const normalized = singularize(name);
  const override = familyRules.find((rule) => rule.normalizedTerm === normalized);
  if (override) {
    return override.section;
  }

  const exact = TERM_INDEX.find((entry) => entry.term === normalized);
  if (exact) {
    return exact.section;
  }

  const catalogMatch = matchProductName(normalized);
  if (catalogMatch.confidence !== "unknown") {
    return catalogMatch.section;
  }

  const words = new Set(normalized.split(" "));
  const partial = TERM_INDEX
    .filter((entry) => words.has(entry.term) || (entry.term.length >= 4 && normalized.includes(entry.term)))
    .sort((a, b) => b.term.length - a.term.length)[0];

  return partial?.section ?? DEFAULT_SECTION;
}

export function createFamilyRule(name: string, section: ShoppingSection): FamilyRule {
  return {
    normalizedTerm: singularize(normalizeText(name)),
    section,
  };
}
