import { describe, expect, it } from "vitest";
import { classifyItem, createFamilyRule } from "./classifier";

describe("classifyItem", () => {
  it("classifies known products by base dictionary", () => {
    expect(classifyItem("leche")).toBe("Lacteos y huevos");
    expect(classifyItem("papel higienico")).toBe("Hogar y papel");
    expect(classifyItem("detergente")).toBe("Limpieza");
  });

  it("uses family rules before the base dictionary", () => {
    const rules = [createFamilyRule("leche", "Bebidas")];
    expect(classifyItem("leche", rules)).toBe("Bebidas");
  });

  it("falls back to Otros for unknown products", () => {
    expect(classifyItem("salsa inventada rara")).toBe("Otros");
  });
});
