import { describe, expect, it } from "vitest";
import { addInputToItems, archiveBought, replaceItemWithInput, toggleBought } from "./shopping";

describe("shopping mutations", () => {
  it("adds and merges duplicate pending products", () => {
    const first = addInputToItems("leche", [], []);
    const second = addInputToItems("2 leches", first, []);

    expect(second).toHaveLength(1);
    expect(second[0].quantity).toBe(3);
  });

  it("toggles bought status and archives bought items", () => {
    const items = addInputToItems("pan", [], []);
    const bought = toggleBought(items, items[0].id, "Mama");
    const archived = archiveBought(bought);

    expect(bought[0].status).toBe("bought");
    expect(bought[0].boughtByAlias).toBe("Mama");
    expect(archived[0].status).toBe("archived");
  });

  it("replaces a badly recognized line with multiple parsed products", () => {
    const items = addInputToItems("ketchup mayonesa mostaza", [], []);
    const replaced = replaceItemWithInput(items, items[0].id, "ketchup\nmayonesa\nmostaza", [], "Mama");
    const names = replaced.map((item) => item.normalizedName).sort();

    expect(names).toEqual(["ketchup", "mayonesa", "mostaza"]);
    expect(replaced.every((item) => item.section === "Despensa")).toBe(true);
  });
});
