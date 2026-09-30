import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils/cn";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", false, null, undefined, "b", "c")).toBe("a b c");
  });

  it("returns empty string when nothing is truthy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
