import { useEffect, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "../../../../components/ui/Button.js";

interface Props {
  descriptionHtml: string | null;
  onSave: (html: string) => void;
}

export function CardDescriptionEditor({ descriptionHtml, onSave }: Props) {
  const [editing, setEditing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Add a more detailed description…" }),
    ],
    content: descriptionHtml ?? "",
    editable: editing,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-24 focus:outline-none dark:prose-invert",
      },
    },
  });

  useEffect(() => {
    editor?.setEditable(editing);
  }, [editing, editor]);

  useEffect(() => {
    if (!editing) editor?.commands.setContent(descriptionHtml ?? "");
  }, [descriptionHtml, editing, editor]);

  function save() {
    if (!editor) return;
    onSave(editor.getHTML());
    setEditing(false);
  }

  return (
    <div>
      {editing && (
        <div className="mb-1.5 flex gap-1 rounded-full border border-[var(--rule)] bg-[var(--sunken)] p-1">
          <ToolbarButton active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={14} />
          </ToolbarButton>
        </div>
      )}
      <div
        onClick={() => !editing && setEditing(true)}
        className={clsx(
          "rounded-[var(--r-md)] border px-3 py-2 transition-colors",
          editing ? "border-[var(--accent)] bg-[var(--bg)]" : "cursor-text border-transparent bg-[var(--sunken)] hover:bg-[var(--rule)]",
        )}
      >
        <EditorContent editor={editor} />
        {!descriptionHtml && !editing && <p className="text-sm text-muted-foreground">Add a more detailed description…</p>}
      </div>
      {editing && (
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={save}>
            Save
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx("rounded-full p-1.5", active ? "bg-[var(--accent)] text-white" : "text-muted-foreground hover:bg-[var(--rule)]")}
    >
      {children}
    </button>
  );
}
