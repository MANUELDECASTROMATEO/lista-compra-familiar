import { describe, expect, it } from "vitest";
import { mergeTranscript } from "./transcript";

describe("mergeTranscript", () => {
  it("avoids duplicating words repeated when speech recognition restarts", () => {
    expect(mergeTranscript("leche pan tomates", "tomates huevos")).toBe("leche pan tomates huevos");
  });

  it("returns the addition when there is no prefix yet", () => {
    expect(mergeTranscript("", "leche pan")).toBe("leche pan");
  });

  it("concatenates without overlap when nothing repeats", () => {
    expect(mergeTranscript("leche pan", "huevos")).toBe("leche pan huevos");
  });

  it("collapses a word repeated right at the merge boundary", () => {
    expect(mergeTranscript("hola patatas", "patatas patatas huevos")).toBe("hola patatas huevos");
  });

  it("never keeps the same word twice in a row", () => {
    expect(mergeTranscript("", "patatas patatas leche")).toBe("patatas leche");
  });
});
