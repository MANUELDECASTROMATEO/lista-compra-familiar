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

  it("splits continuous dictated products without commas", () => {
    expect(parseShoppingInput("patatas huevos leche detergente pañales carne para guisar garbanzos servilletas")).toMatchObject([
      { normalizedName: "patata" },
      { normalizedName: "huevo" },
      { normalizedName: "leche" },
      { normalizedName: "detergente" },
      { normalizedName: "panal" },
      { normalizedName: "carne para guisar" },
      { normalizedName: "garbanzo" },
      { normalizedName: "servilleta" },
    ]);
  });

  it("keeps unknown modifiers with the previous known product", () => {
    expect(parseShoppingInput("pan integral leche sin lactosa")).toMatchObject([
      { normalizedName: "pan integral" },
      { normalizedName: "leche sin lactosa" },
    ]);
  });
});
