import { classifyItem } from "./classifier";
import { parseShoppingInput } from "./parser";
import type { FamilyRule, ShoppingItem, ShoppingSection } from "./types";

export function addInputToItems(input: string, currentItems: ShoppingItem[], rules: FamilyRule[], alias?: string): ShoppingItem[] {
  const now = new Date().toISOString();
  const next = [...currentItems];

  for (const parsed of parseShoppingInput(input)) {
    const existing = next.find((item) => item.status === "pending" && item.normalizedName === parsed.normalizedName);
    if (existing) {
      existing.quantity += parsed.quantity;
      existing.updatedAt = now;
      continue;
    }

    next.push({
      id: crypto.randomUUID(),
      name: parsed.name,
      normalizedName: parsed.normalizedName,
      section: classifyItem(parsed.normalizedName, rules),
      quantity: parsed.quantity,
      unit: parsed.unit,
      status: "pending",
      addedByAlias: alias,
      createdAt: now,
      updatedAt: now,
    });
  }

  return next;
}

export function updateItemSection(items: ShoppingItem[], itemId: string, section: ShoppingSection): ShoppingItem[] {
  const now = new Date().toISOString();
  return items.map((item) => (item.id === itemId ? { ...item, section, updatedAt: now } : item));
}

export function toggleBought(items: ShoppingItem[], itemId: string, alias?: string): ShoppingItem[] {
  const now = new Date().toISOString();
  return items.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    if (item.status === "bought") {
      return { ...item, status: "pending", boughtAt: undefined, boughtByAlias: undefined, updatedAt: now };
    }

    return { ...item, status: "bought", boughtAt: now, boughtByAlias: alias, updatedAt: now };
  });
}

export function deleteItem(items: ShoppingItem[], itemId: string): ShoppingItem[] {
  return items.filter((item) => item.id !== itemId);
}

export function archiveBought(items: ShoppingItem[]): ShoppingItem[] {
  const now = new Date().toISOString();
  return items.map((item) => (item.status === "bought" ? { ...item, status: "archived", archivedAt: now, updatedAt: now } : item));
}
