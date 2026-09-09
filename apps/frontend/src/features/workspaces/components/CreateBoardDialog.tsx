import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { boardApi } from "../../boards/api.js";
import { queryKeys } from "../../../lib/queryKeys.js";
import { Dialog } from "../../../components/ui/Dialog.js";
import { Button } from "../../../components/ui/Button.js";
import { Input, Label } from "../../../components/ui/Input.js";
import { clsx } from "clsx";

const BACKGROUND_COLORS = ["#4bce97", "#579dff", "#9f8fef", "#f5cd47", "#fea362", "#f87168", "#6cc3e0", "#8590a2"];

export function CreateBoardDialog({
  workspaceId,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [color, setColor] = useState(BACKGROUND_COLORS[0]!);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const { board } = await boardApi.create({ workspaceId, name: name.trim(), backgroundType: "color", backgroundValue: color });
      await qc.invalidateQueries({ queryKey: queryKeys.workspaceBoards(workspaceId) });
      setName("");
      onOpenChange(false);
      navigate(`/boards/${board.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Create board">
      <div className="space-y-4">
        <div
          className="flex h-24 items-center justify-center rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: color }}
        >
          {name || "Board preview"}
        </div>
        <div className="flex gap-1.5">
          {BACKGROUND_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={clsx("size-7 rounded", color === c && "ring-2 ring-offset-2 ring-offset-background ring-primary-500")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div>
          <Label htmlFor="board-name">Board name</Label>
          <Input
            id="board-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <Button className="w-full" onClick={submit} disabled={!name.trim() || submitting}>
          {submitting ? "Creating…" : "Create board"}
        </Button>
      </div>
    </Dialog>
  );
}
