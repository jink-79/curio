import { describe, expect, it } from "vitest";
import { locateQuote, quoteAt } from "./quote";

const text = "Germany lost the war. The war left Europe exhausted, and the war debts grew.";

describe("locateQuote", () => {
  it("finds a unique quote", () => {
    expect(locateQuote(text, { exact: "Europe" })).toBe(text.indexOf("Europe"));
  });

  it("returns -1 when the quote is gone", () => {
    expect(locateQuote(text, { exact: "Versailles" })).toBe(-1);
    expect(locateQuote(text, { exact: "" })).toBe(-1);
  });

  it("uses context to pick between repeated phrases", () => {
    const second = text.indexOf("the war debts");
    const sel = quoteAt(text, second, second + "the war".length);
    expect(sel.exact).toBe("the war");
    expect(locateQuote(text, sel)).toBe(second);
  });

  it("still finds the right occurrence after nearby text changes slightly", () => {
    const second = text.indexOf("the war debts");
    const sel = quoteAt(text, second, second + "the war".length);
    const edited = text.replace("exhausted", "worn out");
    expect(locateQuote(edited, sel)).toBe(edited.indexOf("the war debts"));
  });
});
