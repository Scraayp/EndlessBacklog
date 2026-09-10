import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { BOARD_BACKGROUND_COLORS } from "@endlessbacklog/shared";
import type { BoardBackgroundType } from "@endlessbacklog/shared";
import { boardApi } from "../../boards/api.js";
import { BoardBackgroundPicker } from "../../boards/components/BoardBackgroundPicker.js";
import { queryKeys } from "../../../lib/queryKeys.js";
import { ApiError } from "../../../lib/apiClient.js";
import { Dialog } from "../../../components/ui/Dialog.js";
import { Button } from "../../../components/ui/Button.js";
import { Input, Label } from "../../../components/ui/Input.js";

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
  const [backgroundType, setBackgroundType] = useState<BoardBackgroundType>("color");
  const [backgroundValue, setBackgroundValue] = useState(BOARD_BACKGROUND_COLORS[0]!.value);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const { board } = await boardApi.create({ workspaceId, name: name.trim(), backgroundType, backgroundValue });
      await qc.invalidateQueries({ queryKey: queryKeys.workspaceBoards(workspaceId) });
      setName("");
      onOpenChange(false);
      navigate(`/boards/${board.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create board.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Create board">
      <div className="space-y-4">
        <BoardBackgroundPicker
          backgroundType={backgroundType}
          backgroundValue={backgroundValue}
          onChange={(type, value) => {
            setBackgroundType(type);
            setBackgroundValue(value);
          }}
        />
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
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button className="w-full" onClick={submit} disabled={!name.trim() || submitting}>
          {submitting ? "Creating…" : "Create board"}
        </Button>
      </div>
    </Dialog>
  );
}
