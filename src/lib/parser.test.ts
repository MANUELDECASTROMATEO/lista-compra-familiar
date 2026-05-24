import { describe, expect, it } from "vitest";
import { parseShoppingInput } from "./parser";

describe("parseShoppingInput", () => {
  it("splits comma and connector separated products", () => {
    expect(parseShoppingInput("leche, pan y tomates")).toMatchObject([
      { normalizedName: "leche", quantity: 1 },
      { normalizedName: "pan", quantity: 1 },
      { normalizedName: "tomate", quantity: 1 },
    ]);
  });

  it("detects simple quantities and units", () => {
    expect(parseShoppingInput("2 leches, 3 kg patatas")).toMatchObject([
      { normalizedName: "leche", quantity: 2 },
      { normalizedName: "patata", quantity: 3, unit: "kg" },
    ]);
  });
});
