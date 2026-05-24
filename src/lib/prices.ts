import type { PriceEntry, ShoppingItem } from "./types";

export type SupermarketTotal = {
  supermarket: string;
  total: number;
  matchedItems: number;
  missingItems: string[];
};

export function calculateSupermarketTotals(items: ShoppingItem[], prices: PriceEntry[] = []): SupermarketTotal[] {
  const pendingItems = items.filter((item) => item.status === "pending");
  const supermarkets = Array.from(new Set(prices.map((price) => price.supermarket))).sort((a, b) => a.localeCompare(b, "es"));

  return supermarkets.map((supermarket) => {
    let total = 0;
    let matchedItems = 0;
    const missingItems: string[] = [];

    for (const item of pendingItems) {
      const price = prices.find((entry) => entry.supermarket === supermarket && entry.normalizedName === item.normalizedName);
      if (!price) {
        missingItems.push(item.name);
        continue;
      }

      matchedItems += 1;
      total += price.price * item.quantity;
    }

    return { supermarket, total, matchedItems, missingItems };
  });
}

export function upsertPriceEntry(prices: PriceEntry[], entry: Omit<PriceEntry, "id" | "updatedAt">): PriceEntry[] {
  const now = new Date().toISOString();
  const existing = prices.find((price) => price.supermarket === entry.supermarket && price.normalizedName === entry.normalizedName);

  if (existing) {
    return prices.map((price) => (price.id === existing.id ? { ...price, ...entry, updatedAt: now } : price));
  }

  return [...prices, { ...entry, id: crypto.randomUUID(), updatedAt: now }];
}
