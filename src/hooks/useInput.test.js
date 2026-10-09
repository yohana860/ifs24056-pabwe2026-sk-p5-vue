import { describe, it, expect } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("uses empty string by default and updates on input", () => {
    const { value, onInput } = useInput();
    expect(value.value).toBe("");
    onInput({ target: { value: "halo" } });
    expect(value.value).toBe("halo");
  });

  it("accepts an initial value", () => {
    expect(useInput("x").value.value).toBe("x");
  });
});