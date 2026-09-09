/**
 * Fractional-index positioning for lists / cards / checklist items.
 *
 * Instead of re-numbering every sibling row on every reorder (expensive,
 * chatty over sockets), each row stores a float `position`. Moving an item
 * between two neighbors just needs the midpoint of their positions, an O(1)
 * write. Positions are re-normalized (see `needsRebalance`/`rebalancedPositions`)
 * only when floating-point precision would otherwise be exhausted.
 */

const GAP = 65536;
const MIN_GAP = 1e-7;

/** Position for a brand new item appended to the end of a (possibly empty) list. */
export function positionAtEnd(lastPosition: number | null | undefined): number {
  return (lastPosition ?? 0) + GAP;
}

/** Position for inserting between two existing neighbors (either may be absent, i.e. start/end of list). */
export function positionBetween(
  before: number | null | undefined,
  after: number | null | undefined,
): number {
  if (before == null && after == null) return GAP;
  if (before == null) return after! - GAP;
  if (after == null) return before + GAP;
  return before + (after - before) / 2;
}

/** True once the gap between two adjacent positions is too small to safely subdivide again. */
export function needsRebalance(before: number, after: number): boolean {
  return after - before < MIN_GAP;
}

/** Recomputes evenly-spaced positions for an ordered array of ids — used by the
 *  rebalance routine when needsRebalance() fires for a list. */
export function rebalancedPositions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * GAP);
}
