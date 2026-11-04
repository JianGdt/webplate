import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ArticleSchema, useContentStore, type Article } from "./store";
import { Panel } from "@/components/dashboard/Widgets";
export default function Editor({
  article,
  onClose,
  onSaved,
}: {
  article?: Article;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const save = useContentStore((s) => s.save);
  return (
    <Panel title={article ? "Edit article" : "New article"}>
      <form
        className="grid gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const result = ArticleSchema.safeParse(
            Object.fromEntries(new FormData(e.currentTarget)),
          );
          if (!result.success) {
            setError(result.error.issues[0].message);
            return;
          }
          if (save(result.data, article?.id)) onSaved();
        }}
      >
        <Label className="grid gap-2 text-xs font-medium">
          Article title
          <Input
            name="title"
            defaultValue={article?.title}
            maxLength={100}

            required
          />
        </Label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Label className="grid gap-2 text-xs font-medium">
            Category
            <NativeSelect
              name="category"
              defaultValue={article?.category ?? "Stories"}
            >
              {ArticleSchema.shape.category.options.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </NativeSelect>
          </Label>
          <Label className="grid gap-2 text-xs font-medium">
            Publication status
            <NativeSelect
              name="status"
              defaultValue={article?.status ?? "Draft"}
            >
              {ArticleSchema.shape.status.options.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </NativeSelect>
          </Label>
        </div>
        <Label className="grid gap-2 text-xs font-medium">
          Article content
          <Textarea
            name="body"
            defaultValue={article?.body}
            maxLength={5000}
            required
          />
        </Label>
        {error && (
          <p
            role="alert"
            className="border-destructive text-destructive rounded-lg border p-3"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" className="min-h-11 px-4">
            Save article
          </Button>
          <Button
            type="button"
            className="border-border bg-card text-foreground hover:bg-accent min-h-11 border px-4"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Panel>
  );
}
