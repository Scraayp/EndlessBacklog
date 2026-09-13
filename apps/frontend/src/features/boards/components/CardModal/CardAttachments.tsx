import { useRef } from "react";
import { Paperclip, Trash2, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { AttachmentWithUrl } from "@endlessbacklog/shared";
import { useUploadAttachment, useRemoveAttachment } from "../../cardHooks.js";
import { useUpdateCard } from "../../hooks.js";
import { Button } from "../../../../components/ui/Button.js";
import { Spinner } from "../../../../components/ui/Spinner.js";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CardAttachments({
  boardId,
  cardId,
  attachments,
  coverAttachmentId,
}: {
  boardId: string;
  cardId: string;
  attachments: AttachmentWithUrl[];
  coverAttachmentId: string | null;
}) {
  const upload = useUploadAttachment(boardId, cardId);
  const remove = useRemoveAttachment(boardId, cardId);
  const updateCard = useUpdateCard(boardId);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload.mutate(file);
          e.target.value = "";
        }}
      />
      <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
        {upload.isPending ? <Spinner size={14} /> : <Paperclip size={14} />}
        Add attachment
      </Button>

      <div className="mt-2 space-y-1.5">
        {attachments.map((a) => (
          <div key={a.id} className="group flex items-center gap-2 rounded-[var(--r-sm)] border border-[var(--rule)] p-2 transition-colors hover:border-[var(--accent)]">
            {a.mimeType.startsWith("image/") ? (
              <img src={a.url} alt={a.fileName} className="size-10 rounded-[var(--r-sm)] object-cover" />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-[var(--r-sm)] bg-[var(--sunken)]">
                <Paperclip size={16} className="text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <a href={a.url} target="_blank" rel="noreferrer" className="block truncate text-sm text-foreground hover:underline">
                {a.fileName}
              </a>
              <p className="text-xs text-muted-foreground">
                {formatBytes(a.sizeBytes)} · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </p>
            </div>
            <button
              title="Set as cover"
              onClick={() => updateCard.mutate({ cardId, data: { coverAttachmentId: coverAttachmentId === a.id ? null : a.id } })}
              className={`rounded-full p-1 opacity-0 group-hover:opacity-100 ${coverAttachmentId === a.id ? "text-primary-500 opacity-100" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Star size={14} fill={coverAttachmentId === a.id ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => remove.mutate(a.id)}
              className="rounded-full p-1 text-muted-foreground opacity-0 hover:text-danger group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
