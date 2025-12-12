"use client";
"use no memo";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { useDebounce } from "@/shared/hooks/use-debounce";
import { getPageNumbers } from "@/shared/lib/pagination";
import {
  DEFAULT_PAGINATION_META,
  LIMIT_OPTIONS,
} from "@/shared/constants/pagination";
import { SEARCH_DEBOUNCE_DELAY } from "@/shared/constants/ui";
import { getManyItemsAction } from "../actions/get-items-action";
import {
  type Item,
  type GetManyItemsPaginatedResponse,
} from "../types/schemas";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/**
 * Props for the ItemList component.
 */
interface ItemListProps {
  /** Initial paginated items data fetched server-side */
  initialData: GetManyItemsPaginatedResponse;
  /** Space ID for filtering items */
  spaceId?: number;
}

/**
 * ItemList component displays a data table of items with search and pagination controls.
 * Implements debounced search input and limit selector for customizing the view.
 *
 * @param props - Component props
 * @param props.initialData - Initial paginated items data fetched server-side
 * @param props.spaceId - Optional space ID for filtering items
 * @returns ItemList component with data table, search, and pagination controls
 *
 * @example
 * ```tsx
 * <ItemList initialData={itemsResponse} spaceId={123} />
 * ```
 */
export function ItemList({ initialData, spaceId }: ItemListProps) {
  const t = useTranslations("items");
  const [items, setItems] = useState<Item[]>(initialData.data);
  const [meta, setMeta] = useState<PaginationMeta>(
    initialData.metadata ?? DEFAULT_PAGINATION_META
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [limit, setLimit] = useState<number>(LIMIT_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // Track initial render to skip first fetch (data already provided via initialData)
  const isInitialRender = useRef(true);

  // Define table columns with stable reference
  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      { accessorKey: "sku", header: "SKU" },
      {
        accessorKey: "name",
        header: t("columns.name"),
      },
      {
        accessorKey: "price",
        header: t("columns.price"),
        cell: ({ row }) => {
          const price = row.getValue("price") as number;
          return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "IDR",
          }).format(price);
        },
      },
      {
        accessorKey: "notes",
        header: t("columns.notes"),
        cell: ({ row }) => {
          const notes = row.getValue("notes") as string | null;
          return notes ? (
            <span className="text-muted-foreground line-clamp-2 text-sm">
              {notes}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("columns.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as Item["status"];
          const variant =
            status === "active"
              ? "default"
              : status === "inactive"
                ? "secondary"
                : "outline";
          return <Badge variant={variant}>{t(`status.${status}`)}</Badge>;
        },
      },
    ],
    [t]
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- React Compiler automatically skips memoization for TanStack Table
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Fetch items when search, status, limit, or page changes (skip initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);

      const result = await getManyItemsAction({
        search: debouncedSearch || undefined,
        status,
        limit,
        page,
        spaceId,
        type: "full",
      });

      if (result.success && result.data) {
        setItems(result.data.data);
        setMeta(result.data.metadata);
      } else {
        setError(result.message ?? "Failed to fetch items");
      }

      setIsLoading(false);
    };

    fetchItems();
  }, [debouncedSearch, status, limit, page, spaceId]);

  // Reset page when search, status, or limit changes
  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as "active" | "inactive");
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
      <div className="flex items-center gap-3">
        <Input
          type="search"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
          aria-label={t("searchPlaceholder")}
        />
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
            <div className="space-y-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("columns.status")}
                </label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("status.active")}</SelectItem>
                    <SelectItem value="inactive">
                      {t("status.inactive")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Limit Filter */}
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
            </div>
          </PopoverContent>
        </Popover>
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
                  <TableHead key={header.id} className="h-12 px-4">
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
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
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
