"use client";

import { useCallback } from "react";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type TradeLink } from "../schemas";

interface TradeLinksInputProps {
  /** Current links value */
  value: TradeLink[];
  /** Callback when links change */
  onChange: (links: TradeLink[]) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
}

/**
 * Input component for managing trade links array.
 * Each link has url (required), title (optional), and description (optional).
 */
export function TradeLinksInput({
  value,
  onChange,
  disabled = false,
}: TradeLinksInputProps) {
  const t = useTranslations("trades");

  const handleAddLink = useCallback(() => {
    onChange([...value, { url: "", title: "", description: "" }]);
  }, [value, onChange]);

  const handleRemoveLink = useCallback(
    (index: number) => {
      const updated = value.filter((_, i) => i !== index);
      onChange(updated);
    },
    [value, onChange]
  );

  const handleLinkChange = useCallback(
    (index: number, field: keyof TradeLink, fieldValue: string) => {
      const updated = value.map((link, i) =>
        i === index ? { ...link, [field]: fieldValue } : link
      );
      onChange(updated);
    },
    [value, onChange]
  );

  return (
    <div className="space-y-3">
      <Label>{t("fields.links")}</Label>

      {value.length > 0 && (
        <div className="space-y-3">
          {value.map((link, index) => (
            <div
              key={index}
              className="bg-muted/50 relative rounded-lg border p-3"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">
                    {t("fields.linkUrl")}
                  </Label>
                  <Input
                    value={link.url}
                    onChange={(e) =>
                      handleLinkChange(index, "url", e.target.value)
                    }
                    placeholder={t("fields.linkUrlPlaceholder")}
                    disabled={disabled}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">
                    {t("fields.linkTitle")}
                  </Label>
                  <Input
                    value={link.title ?? ""}
                    onChange={(e) =>
                      handleLinkChange(index, "title", e.target.value)
                    }
                    placeholder={t("fields.linkTitlePlaceholder")}
                    disabled={disabled}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">
                    {t("fields.linkDescription")}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={link.description ?? ""}
                      onChange={(e) =>
                        handleLinkChange(index, "description", e.target.value)
                      }
                      placeholder={t("fields.linkDescriptionPlaceholder")}
                      disabled={disabled}
                      className="h-9"
                    />
                    {!disabled && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive hover:text-background size-9 shrink-0"
                        onClick={() => handleRemoveLink(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddLink}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="mr-2 size-4" />
        {t("fields.addLink")}
      </Button>
    </div>
  );
}
