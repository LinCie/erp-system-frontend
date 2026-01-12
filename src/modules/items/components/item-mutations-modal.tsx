"use client";
"use no memo";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { subMonths, format as formatDate } from "date-fns";
import { type DateRange } from "react-day-picker";

import { useIsMobile } from "@/shared/hooks";
import { getPageNumbers } from "@/shared/lib/pagination";
import {
  DEFAULT_PAGINATION_META,
  LIMIT_OPTIONS,
} from "@/shared/constants/pagination";
import { getItemMutationsAction } from "../actions/get-item-mutations-action";
import type { GetMutationsQuery } from "../schemas/get-item-mutations.schema";
import { type PaginationMeta } from "@/shared/types/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface MutationItem {
  id: number;
  transaction_id: number;
  sent_time?: string;
  number?: string;
  sender_notes?: string;
  handler_notes?: string;
  notes?: string;
  model_type?: string;
  cost_per_unit: string;
  debit: string;
  credit: string;
}

interface MutationSummary {
  initialBalance: number;
  initialDebit: number;
  initialCredit: number;
  pageDebit: number;
  pageCredit: number;
}

interface MutationWithRunningBalance extends MutationItem {
  runningBalance: number;
}

/**
 * Props for the ItemMutationsModal component.
 */
interface ItemMutationsModalProps {
  /** The inventory ID to fetch mutations for */
  inventoryId: number;
  /** The item name for the modal title */
  itemName: string;
  /** The space name for the modal title */
  spaceName: string;
  /** The trigger element that opens the modal */
  trigger: ReactNode;
}

/**
 * Modal component for displaying inventory mutations.
 * Shows a table with date range filter and pagination.
 *
 * @param props - Component props
 * @returns ItemMutationsModal component
 */
export function ItemMutationsModal({
  inventoryId,
  itemName,
  spaceName,
  trigger,
}: ItemMutationsModalProps) {
  const t = useTranslations("items");
  const format = useFormatter();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 12),
    to: new Date(),
  });
  const [data, setData] = useState<MutationItem[]>([]);
  const [summary, setSummary] = useState<MutationSummary | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(LIMIT_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate running balance for each row
  const dataWithRunningBalance = useMemo<MutationWithRunningBalance[]>(() => {
    if (!summary) return [];
    let runningBalance = summary.initialBalance;
    return data.map((item) => {
      runningBalance =
        runningBalance + parseFloat(item.debit) - parseFloat(item.credit);
      return { ...item, runningBalance };
    });
  }, [data, summary]);

  // Calculate closing balance
  const closingBalance = useMemo(() => {
    if (!summary) return 0;
    return summary.initialBalance + summary.pageDebit - summary.pageCredit;
  }, [summary]);

  const fetchMutations = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    setIsLoading(true);
    setError(null);

    const params: GetMutationsQuery = {
      start_date: formatDate(dateRange.from, "yyyy-MM-dd"),
      end_date: formatDate(dateRange.to, "yyyy-MM-dd"),
      page,
      limit,
    };

    const result = await getItemMutationsAction(inventoryId, params);

    if (result.success && result.data) {
      setData(result.data.data);
      setMeta(result.data.metadata);
      setSummary(result.data.summary);
    } else {
      setError(result.message ?? t("mutations.fetchError"));
    }

    setIsLoading(false);
  }, [inventoryId, dateRange, page, limit, t]);

  // Fetch data when modal opens or filters change
  useEffect(() => {
    if (open && dateRange?.from && dateRange?.to) {
      fetchMutations();
    }
  }, [open, dateRange, page, limit, fetchMutations]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1);
    // Auto-close when both dates are selected
    if (range?.from && range?.to) {
      setPopoverOpen(false);
    }
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  const pageNumbers = getPageNumbers(page, meta.totalPages);

  const columns = useMemo<ColumnDef<MutationWithRunningBalance>[]>(
    () => [
      {
        accessorKey: "sent_time",
        header: t("mutations.columns.date"),
        cell: ({ row }) => {
          const sentTime = row.getValue("sent_time") as string | undefined;
          if (!sentTime) return "—";
          return format.dateTime(new Date(sentTime), {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        },
      },
      {
        accessorKey: "number",
        header: t("mutations.columns.number"),
        cell: ({ row }) => {
          const number = row.getValue("number") as string | undefined;
          return number ? (
            <span className="text-primary font-medium">{number}</span>
          ) : (
            "—"
          );
        },
      },
      {
        accessorKey: "sender_notes",
        header: t("mutations.columns.description"),
        cell: ({ row }) => {
          const senderNotes = row.getValue("sender_notes") as
            | string
            | undefined;
          return senderNotes ? (
            <span className="line-clamp-2">{senderNotes}</span>
          ) : (
            "—"
          );
        },
      },
      {
        accessorKey: "notes",
        header: t("mutations.columns.notes"),
        cell: ({ row }) => {
          const notes = row.getValue("notes") as string | undefined;
          return notes ? (
            <span className="text-muted-foreground line-clamp-2 text-sm">
              {notes}
            </span>
          ) : (
            "—"
          );
        },
      },
      {
        accessorKey: "model_type",
        header: t("mutations.columns.type"),
        cell: ({ row }) => {
          const modelType = row.getValue("model_type") as string | undefined;
          return modelType ?? "—";
        },
      },
      {
        accessorKey: "cost_per_unit",
        header: t("mutations.columns.cost"),
        cell: ({ row }) => {
          const cost = parseFloat(row.getValue("cost_per_unit") as string);
          return (
            <span className="tabular-nums">
              {format.number(cost, {
                style: "decimal",
                minimumFractionDigits: 0,
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "debit",
        header: t("mutations.columns.debit"),
        cell: ({ row }) => {
          const debit = parseFloat(row.getValue("debit") as string);
          return (
            <span className="tabular-nums">
              {debit > 0 ? format.number(debit, { style: "decimal" }) : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "credit",
        header: t("mutations.columns.credit"),
        cell: ({ row }) => {
          const credit = parseFloat(row.getValue("credit") as string);
          return (
            <span className="tabular-nums">
              {credit > 0 ? format.number(credit, { style: "decimal" }) : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "runningBalance",
        header: t("mutations.columns.runningBalance"),
        cell: ({ row }) => {
          const balance = row.getValue("runningBalance") as number;
          return (
            <span className="font-medium tabular-nums">
              {format.number(balance, { style: "decimal" })}
            </span>
          );
        },
      },
    ],
    [t, format]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: dataWithRunningBalance,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {t("mutations.title", { itemName, spaceName })}
          </DialogTitle>
        </DialogHeader>

        {/* Date Range Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal sm:w-auto"
              >
                <CalendarIcon className="mr-2 size-4" />
                {dateRange?.from && dateRange?.to ? (
                  format.dateTimeRange(dateRange.from, dateRange.to, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                ) : (
                  <span className="text-muted-foreground">
                    {t("mutations.pickDateRange")}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={isMobile ? 1 : 2}
              />
            </PopoverContent>
          </Popover>

          <Select value={String(limit)} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} / {t("mutations.page")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-10 px-3 text-xs">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {/* Opening Balance Row */}
              {summary && (
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell
                    colSpan={6}
                    className="px-3 py-2 text-sm font-semibold"
                  >
                    {t("mutations.openingBalance")}
                  </TableCell>
                  <TableCell className="px-3 py-2 tabular-nums">
                    {format.number(summary.initialDebit, { style: "decimal" })}
                  </TableCell>
                  <TableCell className="px-3 py-2 tabular-nums">
                    {format.number(summary.initialCredit, { style: "decimal" })}
                  </TableCell>
                  <TableCell className="px-3 py-2 font-semibold tabular-nums">
                    {format.number(summary.initialBalance, {
                      style: "decimal",
                    })}
                  </TableCell>
                </TableRow>
              )}

              {isLoading ? (
                // Loading State
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex} className="px-3 py-2">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-muted-foreground h-24 px-3 text-center"
                  >
                    {t("mutations.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                // Data Rows
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-2 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>

            {/* Closing Balance Row */}
            {summary && (
              <TableFooter>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableCell
                    colSpan={6}
                    className="px-3 py-2 text-sm font-semibold"
                  >
                    {t("mutations.closingBalance")}
                  </TableCell>
                  <TableCell className="px-3 py-2 tabular-nums">
                    {format.number(summary.pageDebit, { style: "decimal" })}
                  </TableCell>
                  <TableCell className="px-3 py-2 tabular-nums">
                    {format.number(summary.pageCredit, { style: "decimal" })}
                  </TableCell>
                  <TableCell className="px-3 py-2 font-bold tabular-nums">
                    {format.number(closingBalance, { style: "decimal" })}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            {t("mutations.totalTransactions", { count: meta.totalItems })}
          </p>

          {meta.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    aria-disabled={page === 1}
                    className={
                      page === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {pageNumbers.map((pageNum, index) =>
                  pageNum === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={page === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    aria-disabled={page === meta.totalPages}
                    className={
                      page === meta.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
