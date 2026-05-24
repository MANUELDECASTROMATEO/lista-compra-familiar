import { describe, expect, it } from "vitest";
import { addInputToItems } from "./shopping";
import { calculateSupermarketTotals, upsertPriceEntry } from "./prices";

describe("price comparison", () => {
  it("calculates supermarket totals for pending items", () => {
    const items = addInputToItems("2 leche, pan", [], []);
    const prices = upsertPriceEntry(
      upsertPriceEntry([], { supermarket: "Mercadona", normalizedName: "leche", name: "Leche", price: 1.2 }),
      { supermarket: "Mercadona", normalizedName: "pan", name: "Pan", price: 0.9 },
    );

    expect(calculateSupermarketTotals(items, prices)).toMatchObject([
      { supermarket: "Mercadona", total: 3.3, matchedItems: 2, missingItems: [] },
    ]);
  });
});
