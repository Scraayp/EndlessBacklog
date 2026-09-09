import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { createWorkspaceSchema, type CreateWorkspaceInput } from "@endlessbacklog/shared";
import { useCreateWorkspace } from "../hooks.js";
import { Dialog } from "../../../components/ui/Dialog.js";
import { Button } from "../../../components/ui/Button.js";
import { Input, Label, FieldError } from "../../../components/ui/Input.js";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CreateWorkspaceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const [slugTouched, setSlugTouched] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateWorkspaceInput>({ resolver: zodResolver(createWorkspaceSchema) });

  const name = watch("name");

  async function onSubmit(data: CreateWorkspaceInput) {
    const result = await createWorkspace.mutateAsync(data);
    reset();
    onOpenChange(false);
    navigate(`/workspaces/${result.workspace.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Create a workspace" description="Boards, members, and permissions live inside a workspace.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="ws-name">Workspace name</Label>
          <Input
            id="ws-name"
            {...register("name", {
              onChange: (e) => {
                if (!slugTouched) setValue("slug", slugify(e.target.value));
              },
            })}
          />
          <FieldError>{errors.name?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="ws-slug">URL slug</Label>
          <Input id="ws-slug" {...register("slug", { onChange: () => setSlugTouched(true) })} />
          <FieldError>{errors.slug?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="ws-desc">Description (optional)</Label>
          <Input id="ws-desc" {...register("description")} />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || !name}>
          {isSubmitting ? "Creating…" : "Create workspace"}
        </Button>
      </form>
    </Dialog>
  );
}
