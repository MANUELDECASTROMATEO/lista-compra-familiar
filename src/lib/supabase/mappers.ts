import type { FamilyRule, ShoppingItem, ShoppingState } from "../types";

type DbItem = {
  id: string;
  name: string;
  normalized_name: string;
  section: ShoppingItem["section"];
  quantity: number;
  unit: string | null;
  status: ShoppingItem["status"];
  added_by_alias: string | null;
  bought_by_alias: string | null;
  created_at: string;
  updated_at: string;
  bought_at: string | null;
  archived_at: string | null;
};

type DbRule = {
  normalized_term: string;
  section: FamilyRule["section"];
};

export function mapDbItem(item: DbItem): ShoppingItem {
  return {
    id: item.id,
    name: item.name,
    normalizedName: item.normalized_name,
    section: item.section,
    quantity: Number(item.quantity),
    unit: item.unit ?? undefined,
    status: item.status,
    addedByAlias: item.added_by_alias ?? undefined,
    boughtByAlias: item.bought_by_alias ?? undefined,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    boughtAt: item.bought_at ?? undefined,
    archivedAt: item.archived_at ?? undefined,
  };
}

export function mapDbRule(rule: DbRule): FamilyRule {
  return {
    normalizedTerm: rule.normalized_term,
    section: rule.section,
  };
}

export function itemToDb(item: ShoppingItem, familyId: string) {
  return {
    id: item.id,
    family_id: familyId,
    name: item.name,
    normalized_name: item.normalizedName,
    section: item.section,
    quantity: item.quantity,
    unit: item.unit ?? null,
    status: item.status,
    added_by_alias: item.addedByAlias ?? null,
    bought_by_alias: item.boughtByAlias ?? null,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    bought_at: item.boughtAt ?? null,
    archived_at: item.archivedAt ?? null,
  };
}

export function ruleToDb(rule: FamilyRule, familyId: string) {
  return {
    family_id: familyId,
    normalized_term: rule.normalizedTerm,
    section: rule.section,
  };
}

export function sanitizeRemoteState(input: ShoppingState): ShoppingState {
  return {
    familyName: String(input.familyName || "Compra familiar"),
    items: Array.isArray(input.items) ? input.items : [],
    rules: Array.isArray(input.rules) ? input.rules : [],
    hideBought: Boolean(input.hideBought),
    alias: typeof input.alias === "string" ? input.alias : "",
  };
}
