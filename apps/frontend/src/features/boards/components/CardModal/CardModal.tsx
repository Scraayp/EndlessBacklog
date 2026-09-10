import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X, Tag as TagIcon, CheckSquare, Paperclip as PaperclipIcon, Clock, Archive } from "lucide-react";
import { useCardDetail } from "../../cardHooks.js";
import { useUpdateCard, useAddCardLabel, useRemoveCardLabel, useAddCardMember, useRemoveCardMember } from "../../hooks.js";
import { Spinner } from "../../../../components/ui/Spinner.js";
import { Input } from "../../../../components/ui/Input.js";
import { LabelChip } from "../../../../components/ui/LabelChip.js";
import { AvatarStack } from "../../../../components/ui/Avatar.js";
import { Button } from "../../../../components/ui/Button.js";
import { CardDescriptionEditor } from "./CardDescriptionEditor.js";
import { CardDueDatePicker } from "./CardDueDatePicker.js";
import { CardLabelsPopover } from "./CardLabelsPopover.js";
import { CardMembersPopover } from "./CardMembersPopover.js";
import { CardChecklists } from "./CardChecklists.js";
import { CardAttachments } from "./CardAttachments.js";
import { CardComments } from "./CardComments.js";
import { CardActivityLog } from "./CardActivityLog.js";

export function CardModal() {
  const { boardId, cardId } = useParams<{ boardId: string; cardId: string }>();
  const navigate = useNavigate();
  const { data: card, isLoading } = useCardDetail(cardId);
  const updateCard = useUpdateCard(boardId!);
  const addLabel = useAddCardLabel(boardId!);
  const removeLabel = useRemoveCardLabel(boardId!);
  const addMember = useAddCardMember(boardId!);
  const removeMember = useRemoveCardMember(boardId!);

  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(card?.title ?? "");

  function close() {
    navigate(`/boards/${boardId}`);
  }

  return (
    <RadixDialog.Root open onOpenChange={(open) => !open && close()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <RadixDialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl focus:outline-none"
          aria-describedby={undefined}
        >
          {isLoading || !card ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size={24} />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                <div className="min-w-0 flex-1">
                  <RadixDialog.Title asChild>
                    {editingTitle ? (
                      <Input
                        autoFocus
                        value={title || card.title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                          const trimmed = title.trim();
                          setEditingTitle(false);
                          if (trimmed && trimmed !== card.title) updateCard.mutate({ cardId: card.id, data: { title: trimmed } });
                        }}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        className="text-lg font-semibold"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setTitle(card.title);
                          setEditingTitle(true);
                        }}
                        className="rounded px-1 py-0.5 text-left text-lg font-semibold text-foreground hover:bg-surface-hover"
                      >
                        {card.title}
                      </button>
                    )}
                  </RadixDialog.Title>
                </div>
                <RadixDialog.Close className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground">
                  <X size={18} />
                </RadixDialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <CardLabelsPopover
                    boardId={boardId!}
                    selectedLabels={card.labels}
                    onToggle={(label) => {
                      const has = card.labels.some((l) => l.id === label.id);
                      if (has) removeLabel.mutate({ cardId: card.id, labelId: label.id });
                      else addLabel.mutate({ cardId: card.id, labelId: label.id });
                    }}
                  />
                  <CardMembersPopover
                    boardId={boardId!}
                    selectedMembers={card.members}
                    onToggle={(userId) => {
                      const has = card.members.some((m) => m.id === userId);
                      if (has) removeMember.mutate({ cardId: card.id, userId });
                      else addMember.mutate({ cardId: card.id, userId });
                    }}
                  />
                  <CardDueDatePicker
                    dueDate={card.dueDate}
                    onChange={(iso) => updateCard.mutate({ cardId: card.id, data: { dueDate: iso } })}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateCard.mutate({ cardId: card.id, data: { isArchived: true } })}
                    className="ml-auto"
                  >
                    <Archive size={14} /> Archive
                  </Button>
                </div>

                {card.labels.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {card.labels.map((l) => (
                      <LabelChip key={l.id} color={l.color} name={l.name} />
                    ))}
                  </div>
                )}
                {card.members.length > 0 && (
                  <div className="mb-4">
                    <AvatarStack users={card.members} max={8} />
                  </div>
                )}

                <Section icon={<TagIcon size={15} />} title="Description">
                  <CardDescriptionEditor
                    descriptionHtml={card.descriptionHtml}
                    onSave={(html) => updateCard.mutate({ cardId: card.id, data: { descriptionHtml: html } })}
                  />
                </Section>

                <Section icon={<CheckSquare size={15} />} title="Checklists">
                  <CardChecklists boardId={boardId!} cardId={card.id} checklists={card.checklists} />
                </Section>

                <Section icon={<PaperclipIcon size={15} />} title="Attachments">
                  <CardAttachments
                    boardId={boardId!}
                    cardId={card.id}
                    attachments={card.attachments}
                    coverAttachmentId={card.coverAttachmentId}
                  />
                </Section>

                <Section icon={<Clock size={15} />} title="Activity">
                  <CardComments boardId={boardId!} cardId={card.id} comments={card.comments} />
                  <div className="mt-4 border-t border-border pt-3">
                    <CardActivityLog cardId={card.id} />
                  </div>
                </Section>
              </div>
            </>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </div>
      <div className="pl-1">{children}</div>
    </div>
  );
}
