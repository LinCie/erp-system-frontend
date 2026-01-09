"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/shared/hooks";
import { cn } from "@/shared/lib";
import { SEARCH_DEBOUNCE_DELAY } from "@/shared/constants";
import { Check, ChevronsUpDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getTradeItemsAction } from "../actions/get-trade-items-action";
import { type TradeItem } from "../schemas";

interface TradeItemInputProps {
  /** Space ID for fetching items */
  spaceId: number;
  /** Current selected item ID */
  value?: number | null;
  /** Callback when selection changes - returns full item for price auto-fill */
  onSelect?: (item: TradeItem | null) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Combobox input for selecting an item in trade details.
 * Displays items as "{sku} - {name}" format.
 * Returns full TradeItem on selection for price auto-fill.
 */
export function TradeItemInput({
  spaceId,
  value,
  onSelect,
  disabled,
  placeholder,
}: TradeItemInputProps) {
  const t = useTranslations("trades");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<TradeItem[]>([]);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  const selectedItem = items.find((item) => item.id === value);

  // Format item display label
  const formatItemLabel = (item: TradeItem) => {
    if (item.sku) {
      return `${item.sku} - ${item.name}`;
    }
    return item.name;
  };

  useEffect(() => {
    async function fetchItems() {
      const result = await getTradeItemsAction({
        spaceId,
        search: debouncedSearch || undefined,
        status: "active",
        limit: 10,
      });

      setItems(result.data?.data ?? []);
    }

    fetchItems();
  }, [debouncedSearch, spaceId]);

  function handleSelect(selectedId: string) {
    const numericId = parseInt(selectedId, 10);
    const item = items.find((i) => i.id === numericId);

    if (numericId === value) {
      // Deselect
      onSelect?.(null);
    } else if (item) {
      onSelect?.(item);
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">
            {selectedItem
              ? formatItemLabel(selectedItem)
              : (placeholder ?? t("fields.itemPlaceholder"))}
          </span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={t("fields.itemSearchPlaceholder")}
          />
          <CommandList>
            <CommandEmpty>{t("fields.itemEmpty")}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id.toString()}
                  onSelect={handleSelect}
                >
                  {formatItemLabel(item)}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
