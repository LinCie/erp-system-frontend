"use client";

import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { cn } from "@/shared/lib/utils";

/**
 * Props for the RichTextRenderer component.
 */
interface RichTextRendererProps {
  /** Lexical editor state as JSON string */
  editorState: string;
  /** Additional CSS classes for the content container */
  className?: string;
}

/**
 * Plugin to load editor state into the Lexical editor.
 * Parses and sets the editor state from JSON string.
 */
function LoadEditorStatePlugin({ editorState }: { editorState: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (editorState) {
      try {
        const state = editor.parseEditorState(editorState);
        editor.setEditorState(state);
      } catch (error) {
        console.error("Failed to parse editor state:", error);
      }
    }
  }, [editor, editorState]);

  return null;
}

/**
 * RichTextRenderer component for displaying Lexical editor content in read-only mode.
 * Renders rich text content with proper styling and formatting.
 *
 * @param props - Component props
 * @param props.editorState - Lexical editor state as JSON string
 * @param props.className - Additional CSS classes for styling
 * @returns Read-only Lexical editor displaying the content
 *
 * @example
 * ```tsx
 * <RichTextRenderer
 *   editorState={item.description}
 *   className="prose prose-sm"
 * />
 * ```
 */
export function RichTextRenderer({
  editorState,
  className,
}: RichTextRendererProps) {
  const initialConfig = {
    namespace: "ReadOnlyEditor",
    editable: false,
    theme: {
      paragraph: "mb-3 text-sm leading-relaxed",
      heading: {
        h1: "mb-4 text-2xl font-bold",
        h2: "mb-3 text-xl font-bold",
        h3: "mb-2 text-lg font-semibold",
        h4: "mb-2 text-base font-semibold",
        h5: "mb-2 text-sm font-semibold",
      },
      list: {
        ul: "mb-3 ml-4 list-disc space-y-1",
        ol: "mb-3 ml-4 list-decimal space-y-1",
        listitem: "text-sm",
        nested: {
          listitem: "list-none",
        },
      },
      link: "text-primary underline hover:no-underline",
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
        code: "bg-muted rounded px-1 py-0.5 font-mono text-sm",
      },
      quote: "border-muted-foreground/30 mb-3 border-l-4 pl-4 italic",
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <LoadEditorStatePlugin editorState={editorState} />
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className={cn(
              "text-muted-foreground focus:outline-none",
              className
            )}
          />
        }
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </LexicalComposer>
  );
}
