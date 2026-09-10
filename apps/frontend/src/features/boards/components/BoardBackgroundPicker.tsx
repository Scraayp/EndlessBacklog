import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { BOARD_BACKGROUND_COLORS, BOARD_BACKGROUND_GRADIENTS, boardBackgroundStyle } from "@endlessbacklog/shared";
import type { BoardBackgroundType } from "@endlessbacklog/shared";
import { Input } from "../../../components/ui/Input.js";
import { clsx } from "clsx";

interface Props {
  backgroundType: BoardBackgroundType;
  backgroundValue: string;
  onChange: (type: BoardBackgroundType, value: string) => void;
}

const TABS: { key: BoardBackgroundType; label: string }[] = [
  { key: "color", label: "Colors" },
  { key: "gradient", label: "Gradients" },
  { key: "image", label: "Photo" },
];

/** Shared per-board background picker — used on create and from Board
 *  details. Boards can only ever hold one of a curated color, a curated
 *  gradient, or an https:// photo URL (see schemas/board.ts), so the tabs
 *  here map 1:1 onto BoardBackgroundType. */
export function BoardBackgroundPicker({ backgroundType, backgroundValue, onChange }: Props) {
  const [tab, setTab] = useState<BoardBackgroundType>(backgroundType);
  const [imageUrl, setImageUrl] = useState(backgroundType === "image" ? backgroundValue : "");

  // The image URL commits on blur/Enter (not per keystroke) to avoid firing
  // a save on every character typed; color/gradient swatches commit
  // instantly since picking one is already the intended action.
  const previewStyle =
    tab === "image" ? boardBackgroundStyle("image", imageUrl || backgroundValue) : boardBackgroundStyle(backgroundType, backgroundValue);

  return (
    <div className="space-y-3">
      <div
        className="flex h-24 items-center justify-center rounded-lg text-sm font-medium text-white shadow-inner"
        style={previewStyle}
      >
        {tab === "image" && !imageUrl && <ImageIcon size={20} className="text-white/70" />}
      </div>

      <div className="flex gap-1 rounded-md bg-surface p-1 text-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            // Switching tabs only changes what's browsable below — it must
            // never commit a background on its own (this picker is also
            // used to edit an already-live board from Board details).
            onClick={() => setTab(t.key)}
            className={clsx(
              "flex-1 rounded px-2 py-1.5 font-medium transition-colors",
              tab === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "color" && (
        <div className="flex flex-wrap gap-1.5">
          {BOARD_BACKGROUND_COLORS.map((c) => (
            <button
              key={c.key}
              type="button"
              title={c.name}
              onClick={() => onChange("color", c.value)}
              className={clsx(
                "size-8 rounded-md transition-transform hover:scale-105",
                backgroundType === "color" && backgroundValue === c.value && "ring-2 ring-offset-2 ring-offset-background ring-primary-500",
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      )}

      {tab === "gradient" && (
        <div className="flex flex-wrap gap-1.5">
          {BOARD_BACKGROUND_GRADIENTS.map((g) => (
            <button
              key={g.key}
              type="button"
              title={g.name}
              onClick={() => onChange("gradient", g.key)}
              className={clsx(
                "size-8 rounded-md transition-transform hover:scale-105",
                backgroundType === "gradient" && backgroundValue === g.key && "ring-2 ring-offset-2 ring-offset-background ring-primary-500",
              )}
              style={{ backgroundImage: g.value }}
            />
          ))}
        </div>
      )}

      {tab === "image" && (
        <Input
          placeholder="https://images.example.com/photo.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          onBlur={() => imageUrl.trim() && onChange("image", imageUrl.trim())}
          onKeyDown={(e) => e.key === "Enter" && imageUrl.trim() && onChange("image", imageUrl.trim())}
        />
      )}
    </div>
  );
}
