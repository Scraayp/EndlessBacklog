/**
 * Curated per-board background palette. Boards store `backgroundType` +
 * `backgroundValue` (see types/board.ts):
 *  - "color": a hex string, rendered as a flat fill.
 *  - "gradient": a CSS `background-image` value (one of the curated presets
 *    below), rendered as-is — no user-authored CSS is ever accepted, only
 *    one of these fixed keys.
 *  - "image": an https:// URL to a background photo.
 *
 * Kept deliberately small and hand-picked (rather than a color wheel) so
 * every board looks intentional against both the light and dark app chrome.
 */
export interface BoardBackgroundColorDef {
  key: string;
  name: string;
  value: string;
}

export const BOARD_BACKGROUND_COLORS: BoardBackgroundColorDef[] = [
  { key: "meadow", name: "Meadow", value: "#4bce97" },
  { key: "ocean", name: "Ocean", value: "#579dff" },
  { key: "grape", name: "Grape", value: "#9f8fef" },
  { key: "sun", name: "Sun", value: "#f5cd47" },
  { key: "tangerine", name: "Tangerine", value: "#fea362" },
  { key: "coral", name: "Coral", value: "#f87168" },
  { key: "sky", name: "Sky", value: "#6cc3e0" },
  { key: "slate", name: "Slate", value: "#8590a2" },
];

export interface BoardBackgroundGradientDef {
  key: string;
  name: string;
  value: string;
}

export const BOARD_BACKGROUND_GRADIENTS: BoardBackgroundGradientDef[] = [
  { key: "forest", name: "Forest", value: "linear-gradient(135deg, #0f5132 0%, #4bce97 100%)" },
  { key: "dusk", name: "Dusk", value: "linear-gradient(135deg, #312e81 0%, #9f8fef 100%)" },
  { key: "sunset", name: "Sunset", value: "linear-gradient(135deg, #ae2e24 0%, #fea362 100%)" },
  { key: "aurora", name: "Aurora", value: "linear-gradient(135deg, #0c66e4 0%, #4bce97 100%)" },
  { key: "midnight", name: "Midnight", value: "linear-gradient(135deg, #0b1220 0%, #334155 100%)" },
  { key: "candy", name: "Candy", value: "linear-gradient(135deg, #e774bb 0%, #f5cd47 100%)" },
];

export function getBoardBackgroundColor(key: string): BoardBackgroundColorDef | undefined {
  return BOARD_BACKGROUND_COLORS.find((c) => c.key === key);
}

export function getBoardBackgroundGradient(key: string): BoardBackgroundGradientDef | undefined {
  return BOARD_BACKGROUND_GRADIENTS.find((g) => g.key === key);
}

/** Resolves a board's (backgroundType, backgroundValue) pair into CSS you can
 *  spread onto a style prop — used anywhere a board is rendered as a tile or
 *  page background. */
export function boardBackgroundStyle(
  backgroundType: string,
  backgroundValue: string | undefined | null,
): { backgroundColor?: string; backgroundImage?: string; backgroundSize?: string; backgroundPosition?: string } {
  if (!backgroundValue) return { backgroundColor: BOARD_BACKGROUND_COLORS[0]!.value };
  if (backgroundType === "gradient") {
    const gradient = getBoardBackgroundGradient(backgroundValue);
    return { backgroundImage: gradient?.value ?? BOARD_BACKGROUND_GRADIENTS[0]!.value };
  }
  if (backgroundType === "image") {
    return { backgroundImage: `url("${backgroundValue.replace(/["\\]/g, "")}")`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  return { backgroundColor: backgroundValue };
}
