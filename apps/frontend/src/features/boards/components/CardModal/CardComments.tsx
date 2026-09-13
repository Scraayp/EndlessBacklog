import { useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import type { CommentWithAuthor, BoardMemberWithUser } from "@endlessbacklog/shared";
import { useBoardMembers } from "../../hooks.js";
import { useCreateComment, useRemoveComment } from "../../cardHooks.js";
import { useAuthStore } from "../../../../stores/authStore.js";
import { Avatar } from "../../../../components/ui/Avatar.js";
import { Textarea } from "../../../../components/ui/Input.js";
import { Button } from "../../../../components/ui/Button.js";

const EMPTY_MEMBERS: BoardMemberWithUser[] = [];

/** Lightweight @mention support: typing "@" opens a filtered dropdown of
 *  board members; picking one inserts "@Display Name " into the plain-text
 *  composer and records their id — no rich-text mention node needed. */
export function CardComments({ boardId, cardId, comments }: { boardId: string; cardId: string; comments: CommentWithAuthor[] }) {
  const currentUser = useAuthStore((s) => s.user);
  const members = useBoardMembers(boardId).data ?? EMPTY_MEMBERS;
  const createComment = useCreateComment(boardId, cardId);
  const removeComment = useRemoveComment(boardId, cardId);

  const [text, setText] = useState("");
  const [mentioned, setMentioned] = useState<Map<string, string>>(new Map()); // name -> userId
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = useMemo(() => {
    if (mentionQuery === null) return [];
    return members.filter((m) => m.user.displayName.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 6);
  }, [mentionQuery, members]);

  function handleChange(value: string) {
    setText(value);
    const cursor = textareaRef.current?.selectionStart ?? value.length;
    const upToCursor = value.slice(0, cursor);
    const match = /@([\w ]*)$/.exec(upToCursor);
    setMentionQuery(match ? match[1] ?? "" : null);
  }

  function pickMention(name: string, userId: string) {
    const cursor = textareaRef.current?.selectionStart ?? text.length;
    const upToCursor = text.slice(0, cursor);
    const replaced = upToCursor.replace(/@([\w ]*)$/, `@${name} `);
    setText(replaced + text.slice(cursor));
    setMentioned((prev) => new Map(prev).set(name, userId));
    setMentionQuery(null);
    textareaRef.current?.focus();
  }

  function submit() {
    const body = text.trim();
    if (!body) return;
    const mentionedUserIds = [...mentioned.entries()].filter(([name]) => body.includes(`@${name}`)).map(([, id]) => id);
    createComment.mutate(
      { bodyHtml: `<p>${escapeHtml(body)}</p>`, mentionedUserIds },
      { onSuccess: () => { setText(""); setMentioned(new Map()); } },
    );
  }

  return (
    <div>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          rows={2}
          placeholder="Write a comment… use @ to mention someone"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
        />
        {mentionQuery !== null && suggestions.length > 0 && (
          <div className="glass absolute z-10 mt-1 w-56 rounded-[var(--r-md)] p-1 shadow-[var(--shadow-lg)]">
            {suggestions.map((m) => (
              <button
                key={m.userId}
                onClick={() => pickMention(m.user.displayName, m.userId)}
                className="flex w-full items-center gap-2 rounded-[var(--r-sm)] px-2 py-1 text-left text-sm hover:bg-[var(--accent-soft)]"
              >
                <Avatar name={m.user.displayName} src={m.user.avatarUrl} size="sm" />
                {m.user.displayName}
              </button>
            ))}
          </div>
        )}
      </div>
      {text.trim() && (
        <Button size="sm" className="mt-2" onClick={submit} disabled={createComment.isPending}>
          Comment
        </Button>
      )}

      <div className="mt-4 space-y-3">
        {[...comments].reverse().map((c) => (
          <div key={c.id} className="group flex gap-2">
            <Avatar name={c.author.displayName} src={c.author.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-foreground">{c.author.displayName}</span>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                {c.author.id === currentUser?.id && (
                  <button
                    onClick={() => removeComment.mutate(c.id)}
                    className="ml-auto rounded p-0.5 text-muted-foreground opacity-0 hover:text-danger group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <div className="rounded-[var(--r-md)] bg-[var(--sunken)] px-2.5 py-1.5 text-sm text-foreground" dangerouslySetInnerHTML={{ __html: c.bodyHtml }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
}
