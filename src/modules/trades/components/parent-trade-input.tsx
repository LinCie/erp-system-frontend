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
import { Label } from "@/components/ui/label";
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
import { getManyTradesAction } from "../actions/get-trades-action";

interface ParentTrade {
  id: number;
  label: string;
}

interface ParentTradeInputProps {
  spaceId: number;
  /** Current trade ID to exclude from the list */
  tradeId: number;
  /** Current selected parent trade ID */
  value?: number | null;
  /** Callback when selection changes */
  onChange?: (value: number | null) => void;
  /** Input name for form submission */
  name?: string;
}

/**
 * Combobox input for selecting a parent trade.
 * Fetches trades on open and excludes the current trade from selection.
 */
export function ParentTradeInput({
  spaceId,
  tradeId,
  value,
  onChange,
  name,
}: ParentTradeInputProps) {
  const t = useTranslations("trades");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [trades, setTrades] = useState<ParentTrade[]>([]);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  const selectedTrade = trades.find((t) => t.id === value);

  useEffect(() => {
    async function fetchTrades() {
      const result = await getManyTradesAction({
        spaceId,
        search: debouncedSearch || undefined,
        limit: 10,
        order: "desc",
      });

      setTrades(
        result.data
          ? result.data.data
              .filter((trade) => trade.id !== tradeId)
              .map((trade) => ({
                id: trade.id,
                label: trade.number,
              }))
          : []
      );
    }

    fetchTrades();
  }, [debouncedSearch, spaceId, tradeId]);

  function handleSelect(selectedId: string) {
    const numericId = parseInt(selectedId, 10);
    const newValue = numericId === value ? null : numericId;
    onChange?.(newValue);
    setOpen(false);
  }

  return (
    <div className="grid gap-2">
      <Label>{t("fields.parentTrade")}</Label>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTrade
              ? selectedTrade.label
              : t("fields.parentTradePlaceholder")}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={t("fields.parentTradeSearchPlaceholder")}
            />
            <CommandList>
              <CommandEmpty>{t("fields.parentTradeEmpty")}</CommandEmpty>
              <CommandGroup>
                {trades.map((trade) => (
                  <CommandItem
                    key={trade.id}
                    value={trade.id.toString()}
                    onSelect={handleSelect}
                  >
                    {trade.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === trade.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
