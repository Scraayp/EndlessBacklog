import { useMemo, useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { isPast, isWithinInterval, addDays } from "date-fns";
import type { CardSummary } from "@endlessbacklog/shared";
import { useBoardLabels, useBoardMembers } from "../hooks.js";
import { Input } from "../../../components/ui/Input.js";
import { Popover } from "../../../components/ui/Popover.js";
import { Button } from "../../../components/ui/Button.js";
import { LabelChip } from "../../../components/ui/LabelChip.js";
import { Avatar } from "../../../components/ui/Avatar.js";
import { clsx } from "clsx";

interface FilterState {
  text: string;
  labelIds: Set<string>;
  memberIds: Set<string>;
  dueFilter: "overdue" | "due_soon" | "no_due_date" | null;
}

function matches(card: CardSummary, filter: FilterState): boolean {
  if (filter.text && !card.title.toLowerCase().includes(filter.text.toLowerCase())) return false;
  if (filter.labelIds.size > 0 && !card.labels.some((l) => filter.labelIds.has(l.id))) return false;
  if (filter.memberIds.size > 0 && !card.members.some((m) => filter.memberIds.has(m.id))) return false;
  if (filter.dueFilter === "no_due_date" && card.dueDate) return false;
  if (filter.dueFilter === "overdue" && !(card.dueDate && isPast(new Date(card.dueDate)))) return false;
  if (
    filter.dueFilter === "due_soon" &&
    !(card.dueDate && isWithinInterval(new Date(card.dueDate), { start: new Date(), end: addDays(new Date(), 3) }))
  ) {
    return false;
  }
  return true;
}

export function useCardFilter(boardId: string) {
  const [filter, setFilter] = useState<FilterState>({
    text: "",
    labelIds: new Set(),
    memberIds: new Set(),
    dueFilter: null,
  });

  const applyFilter = useCallback((cards: CardSummary[]) => cards.filter((c) => matches(c, filter)), [filter]);

  const isActive = filter.text || filter.labelIds.size > 0 || filter.memberIds.size > 0 || filter.dueFilter;

  const FilterBar = useMemo(
    () =>
      function FilterBarInner() {
        const labels = useBoardLabels(boardId).data ?? [];
        const members = useBoardMembers(boardId).data ?? [];
        const [open, setOpen] = useState(false);

        function toggle(set: Set<string>, id: string) {
          const next = new Set(set);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }

        return (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search cards…"
                value={filter.text}
                onChange={(e) => setFilter((f) => ({ ...f, text: e.target.value }))}
                className="h-8 w-48 pl-8"
              />
            </div>
            <Popover
              open={open}
              onOpenChange={setOpen}
              trigger={
                <Button variant={isActive ? "primary" : "secondary"} size="sm">
                  <SlidersHorizontal size={14} /> Filter
                </Button>
              }
            >
              <div className="space-y-3">
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Labels</p>
                  <div className="flex flex-wrap gap-1.5">
                    {labels.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setFilter((f) => ({ ...f, labelIds: toggle(f.labelIds, l.id) }))}
                        className={clsx("rounded", filter.labelIds.has(l.id) && "ring-2 ring-primary-500")}
                      >
                        <LabelChip color={l.color} name={l.name} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Members</p>
                  <div className="flex flex-wrap gap-1.5">
                    {members.map((m) => (
                      <button
                        key={m.userId}
                        onClick={() => setFilter((f) => ({ ...f, memberIds: toggle(f.memberIds, m.userId) }))}
                        className={clsx("rounded-full", filter.memberIds.has(m.userId) && "ring-2 ring-primary-500")}
                      >
                        <Avatar name={m.user.displayName} src={m.user.avatarUrl} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Due date</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["overdue", "due_soon", "no_due_date"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setFilter((f) => ({ ...f, dueFilter: f.dueFilter === d ? null : d }))}
                        className={clsx(
                          "rounded-md border border-border px-2 py-1 text-xs",
                          filter.dueFilter === d ? "bg-primary-500 text-white" : "hover:bg-surface-hover",
                        )}
                      >
                        {d === "overdue" ? "Overdue" : d === "due_soon" ? "Due soon" : "No due date"}
                      </button>
                    ))}
                  </div>
                </div>
                {isActive && (
                  <button
                    onClick={() => setFilter({ text: "", labelIds: new Set(), memberIds: new Set(), dueFilter: null })}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>
            </Popover>
          </div>
        );
      },
    [boardId, filter, isActive],
  );

  return { FilterBar, applyFilter };
}
