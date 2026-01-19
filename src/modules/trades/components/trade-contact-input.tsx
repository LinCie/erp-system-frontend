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
import { useEffect, useMemo, useState } from "react";
import { getTradeContactsAction } from "../actions/get-trade-contacts.action";
import { type TradeContact } from "../schemas";

interface TradeContactInputProps {
  spaceId: number;
  /** Current selected parent trade ID */
  value?: number | null;
  /** Callback when selection changes */
  onChange?: (value: number | null) => void;
  /** Input name for form submission */
  name?: string;
  receiver?: TradeContact | null;
}

/**
 * Combobox input for selecting a parent trade.
 * Fetches trades on open and excludes the current trade from selection.
 */
export function TradeContactInput({
  spaceId,
  value,
  onChange,
  name,
  receiver,
}: TradeContactInputProps) {
  const t = useTranslations("trades");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fetchedContacts, setFetchedContacts] = useState<TradeContact[]>([]);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  const contacts = useMemo(() => {
    const data = fetchedContacts.filter(
      (contact) => contact.id !== receiver?.id
    );
    return receiver ? data.concat(receiver) : data;
  }, [fetchedContacts, receiver]);

  const selectedTrade = contacts.find((t) => t.id === value);

  useEffect(() => {
    async function fetchContacts() {
      const result = await getTradeContactsAction({
        space_id: spaceId,
        search: debouncedSearch || undefined,
        status: "active",
        limit: 10,
        order: "desc",
        type: "all",
      });

      setFetchedContacts(result.data?.data || []);
    }

    fetchContacts();
  }, [debouncedSearch, spaceId]);

  function handleSelect(selectedId: string) {
    const numericId = parseInt(selectedId, 10);
    const newValue = numericId === value ? null : numericId;
    onChange?.(newValue);
    setOpen(false);
  }

  return (
    <div className="grid gap-2">
      <Label>{t("fields.contact")}</Label>
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
              ? selectedTrade.name
              : t("fields.contactPlaceholder")}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={t("fields.contactSearchPlaceholder")}
            />
            <CommandList>
              <CommandEmpty>{t("fields.contactEmpty")}</CommandEmpty>
              <CommandGroup>
                {contacts.map((contact) => (
                  <CommandItem
                    key={contact.id}
                    value={contact.id.toString()}
                    onSelect={handleSelect}
                  >
                    {contact.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === contact.id ? "opacity-100" : "opacity-0"
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
