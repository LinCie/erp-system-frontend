"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { TradeItemInput } from "./trade-item-input";
import {
  TRADE_DETAIL_TYPES,
  type TradeDetailInput,
  type TradeItem,
} from "../schemas";

/**
 * Extended detail type for UI with selected item reference.
 */
interface DetailRow extends TradeDetailInput {
  /** Temporary field for UI - stores selected item for display */
  _selectedItem?: TradeItem;
  /** Temporary field for UI - stores unit price for calculations */
  _unitPrice?: number;
  /** Temporary field for UI - stable client key for new rows */
  _clientKey?: string;
}

interface TradeDetailsInputProps {
  /** Current detail rows */
  value: DetailRow[];
  /** Callback when details change */
  onChange: (details: DetailRow[]) => void;
  /** Space ID for fetching items */
  spaceId: number;
  /** Whether the input is disabled */
  disabled?: boolean;
}

/**
 * Creates a new empty detail row with default values.
 */
function createEmptyDetail(): DetailRow {
  return {
    item_id: null,
    model_type: "",
    quantity: 1,
    price: 0,
    discount: 0,
    sku: "",
    name: "",
    notes: "",
    _unitPrice: 0,
    _clientKey: `new-${Date.now()}-${Math.random()}`,
  };
}

/**
 * Table component for managing trade detail line items.
 * Supports adding, editing, and removing detail rows.
 */
export function TradeDetailsInput({
  value,
  onChange,
  spaceId,
  disabled,
}: TradeDetailsInputProps) {
  const t = useTranslations("trades");

  const handleAddDetail = useCallback(() => {
    onChange([...value, createEmptyDetail()]);
  }, [value, onChange]);

  const handleRemoveDetail = useCallback(
    (index: number) => {
      const newDetails = value.filter((_, i) => i !== index);
      onChange(newDetails);
    },
    [value, onChange]
  );

  const handleItemSelect = useCallback(
    (index: number, item: TradeItem | null) => {
      const newDetails = [...value];
      if (item) {
        const unitPrice = parseFloat(item.price) || 0;
        const quantity = newDetails[index].quantity || 1;
        newDetails[index] = {
          ...newDetails[index],
          item_id: item.id,
          sku: item.sku ?? "",
          name: item.name,
          price: unitPrice * quantity,
          _unitPrice: unitPrice,
          _selectedItem: item,
        };
      } else {
        newDetails[index] = {
          ...newDetails[index],
          item_id: null,
          sku: "",
          name: "",
          price: 0,
          _unitPrice: 0,
          _selectedItem: undefined,
        };
      }
      onChange(newDetails);
    },
    [value, onChange]
  );

  const handleTypeChange = useCallback(
    (index: number, type: string) => {
      const newDetails = [...value];
      newDetails[index] = { ...newDetails[index], model_type: type };
      onChange(newDetails);
    },
    [value, onChange]
  );

  const handleFieldChange = useCallback(
    (
      index: number,
      field: keyof TradeDetailInput,
      fieldValue: string | number
    ) => {
      const newDetails = [...value];
      newDetails[index] = { ...newDetails[index], [field]: fieldValue };

      // Recalculate price when quantity changes
      if (field === "quantity" && newDetails[index]._unitPrice) {
        const quantity =
          typeof fieldValue === "number"
            ? fieldValue
            : parseInt(String(fieldValue)) || 1;
        newDetails[index].price = newDetails[index]._unitPrice! * quantity;
      }

      onChange(newDetails);
    },
    [value, onChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{t("fields.details")}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddDetail}
          disabled={disabled}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          {t("actions.addDetail")}
        </Button>
      </div>

      {value.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="w-[300px]">{t("fields.item")}</TableHead>
                <TableHead className="w-[140px]">
                  {t("fields.detailType")}
                </TableHead>
                <TableHead className="w-[80px]">{t("fields.qty")}</TableHead>
                <TableHead className="w-[120px]">
                  {t("fields.detailPrice")}
                </TableHead>
                <TableHead className="w-[100px]">
                  {t("fields.detailDiscount")}
                </TableHead>
                <TableHead className="min-w-[150px]">
                  {t("fields.detailNotes")}
                </TableHead>
                <TableHead className="w-[80px]">
                  {t("actions.action")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {value.map((detail, index) => {
                // Use persisted id if available, otherwise use client key
                const rowKey = detail.id
                  ? `detail-${detail.id}`
                  : (detail._clientKey ?? `index-${index}`);
                return (
                  <TableRow key={rowKey}>
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <TradeItemInput
                        spaceId={spaceId}
                        value={detail.item_id}
                        onSelect={(item) => handleItemSelect(index, item)}
                        disabled={disabled}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={detail.model_type}
                        onValueChange={(val) => handleTypeChange(index, val)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("fields.detailTypePlaceholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {TRADE_DETAIL_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(`detailTypes.${type}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={detail.quantity}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        disabled={disabled}
                        className="w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={detail.price}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        disabled={disabled}
                        className="w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={detail.discount ?? 0}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "discount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        disabled={disabled}
                        className="w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={detail.notes ?? ""}
                        onChange={(e) =>
                          handleFieldChange(index, "notes", e.target.value)
                        }
                        disabled={disabled}
                        placeholder={t("fields.detailNotesPlaceholder")}
                        className="min-h-[40px] w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveDetail(index)}
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {value.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {t("fields.detailsEmpty")}
        </p>
      )}
    </div>
  );
}
