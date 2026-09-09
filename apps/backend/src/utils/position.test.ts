import { describe, it, expect } from "vitest";
import { positionAtEnd, positionBetween, needsRebalance, rebalancedPositions } from "./position.js";

describe("positionAtEnd", () => {
  it("returns a positive gap for an empty list", () => {
    expect(positionAtEnd(null)).toBe(65536);
    expect(positionAtEnd(undefined)).toBe(65536);
  });

  it("adds a fixed gap after the last item", () => {
    expect(positionAtEnd(65536)).toBe(131072);
  });
});

describe("positionBetween", () => {
  it("picks the midpoint of two neighbors", () => {
    expect(positionBetween(10, 20)).toBe(15);
  });

  it("subtracts a gap when inserting before the first item", () => {
    expect(positionBetween(null, 100)).toBe(100 - 65536);
  });

  it("adds a gap when inserting after the last item", () => {
    expect(positionBetween(100, null)).toBe(100 + 65536);
  });

  it("returns a default gap for the very first item in an empty list", () => {
    expect(positionBetween(null, null)).toBe(65536);
  });
});

describe("needsRebalance", () => {
  it("is false for a normal gap", () => {
    expect(needsRebalance(10, 20)).toBe(false);
  });

  it("is true once the gap is smaller than floating-point precision allows", () => {
    expect(needsRebalance(10, 10 + 1e-9)).toBe(true);
  });
});

describe("rebalancedPositions", () => {
  it("produces evenly-spaced, strictly increasing positions", () => {
    const positions = rebalancedPositions(5);
    expect(positions).toHaveLength(5);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]!);
    }
  });

  it("returns an empty array for zero items", () => {
    expect(rebalancedPositions(0)).toEqual([]);
  });
});
