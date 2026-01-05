"use client";
"use no memo";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { AlertCircle, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

import { useDebounce } from "@/shared/hooks/use-debounce";
import { getPageNumbers } from "@/shared/lib/pagination";
import {
  DEFAULT_PAGINATION_META,
  LIMIT_OPTIONS,
} from "@/shared/constants/pagination";
import { SEARCH_DEBOUNCE_DELAY } from "@/shared/constants/ui";
import { getManyTradesAction } from "../actions/get-trades-action";
import { type Trade, type TradeStatus, TRADE_STATUSES } from "../schemas";
import { type PaginationMeta } from "@/shared/types/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DeleteTradeDialog } from "./delete-trade-dialog";
import { Link } from "@/shared/infrastructure/i18n";
import { CreateTradeModal } from "./create-trade-modal";

/** Model type filter options */
const MODEL_TYPE_OPTIONS = [
  { value: "all", labelKey: "modelType.all" },
  { value: "interaction", labelKey: "modelType.interaction" },
  { value: "PO", labelKey: "modelType.purchaseOrder" },
  { value: "SO", labelKey: "modelType.salesOrder" },
] as const;

/**
 * Props for the TradeList component.
 */
interface TradeListProps {
  /** Space ID for filtering trades */
  spaceId: number;
}

/**
 * Returns badge variant based on trade status.
 */
function getStatusVariant(
  status: TradeStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "TX_COMPLETED":
      return "default";
    case "TX_DRAFT":
    case "TX_READY":
      return "secondary";
    case "TX_CANCELED":
    case "TX_RETURN":
      return "destructive";
    default:
      return "outline";
  }
}

/**
 * TradeList component displays a data table of trades with search, filters, and pagination.
 * Fetches data on mount and when filters change.
 *
 * @param props - Component props
 * @param props.spaceId - Space ID for filtering trades
 * @returns TradeList component with data table, search, filters, and pagination
 */
export function TradeList({ spaceId }: TradeListProps) {
  const t = useTranslations("trades");
  const router = useRouter();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TradeStatus | "all">("all");
  const [modelType, setModelType] = useState<string>("all");
  const [limit, setLimit] = useState<number>(LIMIT_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  /**
   * Handles deleted trade by removing it from the list.
   */
  const handleTradeDeleted = useCallback(
    (tradeId: number) => {
      setTrades((prev) => prev.filter((trade) => trade.id !== tradeId));
      setMeta((prev) => ({
        ...prev,
        totalItems: prev.totalItems - 1,
        totalPages: Math.ceil((prev.totalItems - 1) / limit),
      }));
    },
    [limit]
  );

  // Define table columns
  const columns = useMemo<ColumnDef<Trade>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: t("columns.date"),
        size: 100,
        minSize: 80,
        maxSize: 120,
        cell: ({ row }) => {
          const date = row.getValue("created_at") as string | null;
          if (!date) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="tabular-nums">
              {new Date(date).toLocaleDateString("id-ID")}
            </span>
          );
        },
      },
      {
        accessorKey: "number",
        header: t("columns.number"),
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => {
          const number = row.getValue("number") as string;
          const trade = row.original;
          return (
            <Link
              href={`/space/${spaceId}/trades/${trade.id}`}
              prefetch={false}
              className="text-primary hover:underline"
            >
              {number}
            </Link>
          );
        },
      },
      {
        id: "team",
        header: t("columns.team"),
        size: 100,
        minSize: 80,
        maxSize: 120,
        cell: ({ row }) => {
          const sender = row.original.sender;
          if (!sender) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <div className="flex flex-col">
              <span className="font-medium">{sender.name}</span>
              {sender.code && (
                <span className="text-muted-foreground text-xs">
                  {sender.code}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "contact",
        header: t("columns.contact"),
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => {
          const receiver = row.original.receiver;
          if (!receiver) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <div className="flex flex-col">
              <span className="font-medium">{receiver.name}</span>
              {receiver.code && (
                <span className="text-muted-foreground text-xs">
                  {receiver.code}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: t("columns.description"),
        size: 150,
        minSize: 100,
        maxSize: 200,
        cell: ({ row }) => {
          const description = row.getValue("description") as string | undefined;
          return description ? (
            <span className="line-clamp-2 text-wrap">{description}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        id: "sku",
        header: t("columns.sku"),
        size: 200,
        minSize: 150,
        maxSize: 300,
        cell: ({ row }) => {
          // Use aggregated sku field from backend
          const details = row.original.details;
          const sku = details?.map((d) => d.item?.sku);
          return sku ? (
            <span className="line-clamp-2 text-wrap">{sku.join(", ")}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("columns.status"),
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => {
          const status = row.getValue("status") as TradeStatus;

          if ((TRADE_STATUSES as readonly string[]).includes(status)) {
            return (
              <Badge variant={getStatusVariant(status)}>
                {t(`status.${status}`)}
              </Badge>
            );
          }
          return <span className="line-clamp-3 text-wrap">{status}</span>;
        },
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 80,
        minSize: 60,
        maxSize: 100,
        cell: ({ row }) => {
          const trade = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onMouseEnter={() =>
                    router.prefetch(`/space/${spaceId}/trades/${trade.id}`)
                  }
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">{t("actions.openMenu")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("actions.title")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/space/${spaceId}/trades/${trade.id}`}
                    prefetch={false}
                  >
                    {t("actions.view")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {t("actions.edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DeleteTradeDialog
                  trade={trade}
                  onSuccess={handleTradeDeleted}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                    >
                      {t("actions.delete")}
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, spaceId, handleTradeDeleted, router]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: trades,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Fetch trades when filters change
  useEffect(() => {
    const fetchTrades = async () => {
      setIsLoading(true);
      setError(null);

      const result = await getManyTradesAction({
        spaceId,
        search: debouncedSearch || undefined,
        status: status === "all" ? undefined : status,
        modelType: modelType === "all" ? undefined : modelType,
        order: "desc",
        limit,
        page,
        withDetails: "true",
        withPlayers: "true",
      });

      if (result.success && result.data) {
        setTrades(result.data.data);
        setMeta(result.data.metadata);
      } else {
        setError(result.message ?? t("fetchError"));
      }

      setIsLoading(false);
    };

    fetchTrades();
  }, [debouncedSearch, status, modelType, limit, page, spaceId, t]);

  // Reset page when filters change
  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as TradeStatus | "all");
    setPage(1);
  };

  const handleModelTypeChange = (value: string) => {
    setModelType(value);
    setPage(1);
  };

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  const pageNumbers = getPageNumbers(page, meta.totalPages);

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1"
          aria-label={t("searchPlaceholder")}
        />

        {/* Model Type Filter */}
        <Select value={modelType} onValueChange={handleModelTypeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODEL_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("status.all")}</SelectItem>
            {TRADE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Settings Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0 gap-2">
              <Settings2 className="size-4" />
              <span className="hidden sm:inline">
                {t("show")} {limit}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("show")}</label>
              <Select value={String(limit)} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIMIT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        {/* Create Button */}
        <CreateTradeModal spaceId={spaceId} />
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 px-4"
                    style={{
                      width: header.getSize(),
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
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
            {isLoading ? (
              // Loading State
              Array.from({ length: limit }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell
                      key={`skeleton-${index}-${colIndex}`}
                      className="px-4 py-3"
                    >
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
                  className="text-muted-foreground h-24 px-4 text-center"
                >
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows
              table.getRowModel().rows.map((row) => (
                <TableRow key={`trade-${row.original.id}-row`}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-3 wrap-break-word"
                      style={{
                        width: cell.column.getSize(),
                        maxWidth: cell.column.columnDef.maxSize,
                      }}
                    >
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
        </Table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center gap-4">
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
        </div>
      )}
    </div>
  );
}
