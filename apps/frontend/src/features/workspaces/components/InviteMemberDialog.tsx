import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteWorkspaceMemberSchema, type InviteWorkspaceMemberInput, WORKSPACE_ROLES } from "@endlessbacklog/shared";
import { useInviteMember } from "../hooks.js";
import { ApiError } from "../../../lib/apiClient.js";
import { Dialog } from "../../../components/ui/Dialog.js";
import { Button } from "../../../components/ui/Button.js";
import { Input, Label, FieldError } from "../../../components/ui/Input.js";

export function InviteMemberDialog({ workspaceId, open, onOpenChange }: { workspaceId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const invite = useInviteMember(workspaceId);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteWorkspaceMemberInput>({
    resolver: zodResolver(inviteWorkspaceMemberSchema),
    defaultValues: { role: "member" },
  });

  async function onSubmit(data: InviteWorkspaceMemberInput) {
    setFormError(null);
    try {
      await invite.mutateAsync(data);
      setSent(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not send invite.");
    }
  }

  function handleClose(o: boolean) {
    if (!o) {
      reset();
      setSent(false);
    }
    onOpenChange(o);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose} title="Invite a member" description="They'll get an email with a link to join.">
      {sent ? (
        <div className="py-2 text-center text-sm text-muted-foreground">
          Invite sent! It's valid for 7 days.
          <Button className="mt-4 w-full" variant="secondary" onClick={() => handleClose(false)}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              {...register("role")}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {WORKSPACE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send invite"}
          </Button>
        </form>
      )}
    </Dialog>
  );
}
