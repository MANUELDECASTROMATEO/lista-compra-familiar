import { describe, expect, it } from "vitest";
import { addInputToItems } from "./shopping";
import { formatShoppingListForShare } from "./share";
import type { ShoppingState } from "./types";

describe("formatShoppingListForShare", () => {
  it("formats pending products grouped by section", () => {
    const state: ShoppingState = {
      familyName: "Compra casa",
      items: addInputToItems("leche, pan, tomates", [], []),
      rules: [],
      hideBought: false,
    };

    expect(formatShoppingListForShare(state)).toContain("Compra casa");
    expect(formatShoppingListForShare(state)).toContain("Fruta y verdura\n- Tomate");
    expect(formatShoppingListForShare(state)).toContain("Lacteos y huevos\n- Leche");
    expect(formatShoppingListForShare(state)).toContain("Panaderia\n- Pan");
  });
});
