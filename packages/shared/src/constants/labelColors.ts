/**
 * The fixed label color palette (Trello-style). Stored as a `color` string key
 * on the Label model (never a DB enum, for MariaDB/Postgres dialect-neutrality —
 * see database/README.md). Each key has a light-mode and dark-mode hex so label
 * chips stay legible in both themes.
 */
export interface LabelColorDef {
  key: string;
  name: string;
  light: string;
  dark: string;
}

export const LABEL_COLORS: LabelColorDef[] = [
  { key: "green", name: "Green", light: "#4bce97", dark: "#1f845a" },
  { key: "yellow", name: "Yellow", light: "#f5cd47", dark: "#946f00" },
  { key: "orange", name: "Orange", light: "#fea362", dark: "#a54800" },
  { key: "red", name: "Red", light: "#f87168", dark: "#ae2e24" },
  { key: "purple", name: "Purple", light: "#9f8fef", dark: "#6e5dc6" },
  { key: "blue", name: "Blue", light: "#579dff", dark: "#0c66e4" },
  { key: "sky", name: "Sky", light: "#6cc3e0", dark: "#227d9b" },
  { key: "lime", name: "Lime", light: "#94c748", dark: "#4c6b1f" },
  { key: "pink", name: "Pink", light: "#e774bb", dark: "#943d73" },
  { key: "black", name: "Black", light: "#8590a2", dark: "#454f59" },
];

export const LABEL_COLOR_KEYS = LABEL_COLORS.map((c) => c.key) as [string, ...string[]];

export function getLabelColor(key: string): LabelColorDef {
  return LABEL_COLORS.find((c) => c.key === key) ?? LABEL_COLORS[0]!;
}
