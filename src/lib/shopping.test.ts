import { describe, expect, it } from "vitest";
import { addInputToItems, archiveBought, toggleBought } from "./shopping";

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
});
