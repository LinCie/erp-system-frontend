"use client";

import { useEffect, useCallback, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { FORMAT_TEXT_COMMAND, type EditorState } from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "./ui/button";

/**
 * Editor theme configuration for Tailwind CSS styling.
 */
const editorTheme = {
  paragraph: "mb-2 last:mb-0",
  heading: {
    h1: "text-2xl font-bold mb-3",
    h2: "text-xl font-bold mb-2",
    h3: "text-lg font-semibold mb-2",
  },
  list: {
    ul: "list-disc ml-4 mb-2",
    ol: "list-decimal ml-4 mb-2",
    listitem: "mb-1",
  },
  link: "text-primary underline cursor-pointer",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
  quote:
    "border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground",
};

/**
 * Props for the RichTextEditor component.
 */
interface RichTextEditorProps {
  /** Initial editor state as JSON string */
  initialValue?: string;
  /** Callback when editor content changes, receives JSON string */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Additional class names for the container */
  className?: string;
  /** Aria label for accessibility */
  ariaLabel?: string;
}

/**
 * Plugin to initialize editor with existing content (runs only once on mount).
 */
function InitialValuePlugin({ initialValue }: { initialValue?: string }) {
  const [editor] = useLexicalComposerContext();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current || !initialValue) return;

    try {
      const editorState = editor.parseEditorState(initialValue);
      editor.setEditorState(editorState);
      isInitialized.current = true;
    } catch {
      // Invalid JSON, ignore
    }
  }, [editor, initialValue]);

  return null;
}

/**
 * Toolbar component with formatting buttons.
 */
function ToolbarPlugin({ disabled }: { disabled?: boolean }) {
  const [editor] = useLexicalComposerContext();

  const formatBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  }, [editor]);

  const formatItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  }, [editor]);

  const formatUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  }, [editor]);

  const insertBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const insertNumberedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  return (
    <div className="border-input bg-muted/30 flex flex-wrap gap-1 border-b p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatBold}
        disabled={disabled}
        className="h-8 w-8 p-0"
        aria-label="Bold"
      >
        <Bold className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatItalic}
        disabled={disabled}
        className="h-8 w-8 p-0"
        aria-label="Italic"
      >
        <Italic className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatUnderline}
        disabled={disabled}
        className="h-8 w-8 p-0"
        aria-label="Underline"
      >
        <Underline className="size-4" />
      </Button>
      <div className="bg-border mx-1 w-px" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertBulletList}
        disabled={disabled}
        className="h-8 w-8 p-0"
        aria-label="Bullet list"
      >
        <List className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertNumberedList}
        disabled={disabled}
        className="h-8 w-8 p-0"
        aria-label="Numbered list"
      >
        <ListOrdered className="size-4" />
      </Button>
    </div>
  );
}

/**
 * Rich text editor component using Lexical.
 * Supports bold, italic, underline, lists, and links.
 * Stores content as JSON string for database persistence.
 *
 * @param props - Component props
 * @returns RichTextEditor component
 *
 * @example
 * ```tsx
 * <RichTextEditor
 *   initialValue={existingContent}
 *   onChange={(json) => setDescription(json)}
 *   placeholder="Enter description..."
 * />
 * ```
 */
export function RichTextEditor({
  initialValue,
  onChange,
  placeholder = "Enter text...",
  disabled = false,
  className,
  ariaLabel,
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: "RichTextEditor",
    theme: editorTheme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
    editable: !disabled,
  };

  const handleChange = useCallback(
    (editorState: EditorState) => {
      const json = JSON.stringify(editorState.toJSON());
      onChange?.(json);
    },
    [onChange]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={cn(
          "border-input bg-background overflow-hidden rounded-md border",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <ToolbarPlugin disabled={disabled} />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn(
                  "min-h-[120px] p-3 text-sm outline-none",
                  "focus:ring-0 focus:outline-none",
                  disabled && "pointer-events-none"
                )}
                aria-label={ariaLabel}
                aria-placeholder={placeholder}
                placeholder={
                  <div className="text-muted-foreground pointer-events-none absolute top-3 left-3 text-sm">
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin onChange={handleChange} />
        <InitialValuePlugin initialValue={initialValue} />
      </div>
    </LexicalComposer>
  );
}
