"use client";
"use no memo";

import { useState, useEffect, useMemo } from "react";
import { Link } from "@/shared/infrastructure/i18n";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { AlertCircle, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

import { useDebounce } from "@/shared/hooks/use-debounce";
import { getPageNumbers } from "@/shared/lib/pagination";
import {
  DEFAULT_PAGINATION_META,
  LIMIT_OPTIONS,
} from "@/shared/constants/pagination";
import { SEARCH_DEBOUNCE_DELAY } from "@/shared/constants/ui";
import { getSpacesAction } from "../actions/get-spaces-action";
import { type Space, type PaginationMeta } from "../types/schemas";
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
 * SpaceList component displays a data table of spaces with search and pagination controls.
 * Implements debounced search input and limit selector for customizing the view.
 * Provides View action for navigating to individual space detail pages.
 *
 * @param props - Component props
 * @param props.initialData - Initial paginated spaces data fetched server-side
 * @returns SpaceList component with data table, search, and pagination controls
 *
 * @example
 * ```tsx
 * <SpaceList initialData={spacesResponse} />
 * ```
 */
export function SpaceList() {
  const t = useTranslations("spaces");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [limit, setLimit] = useState<number>(LIMIT_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // Define table columns with stable reference
  const columns = useMemo<ColumnDef<Space>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("columns.name"),
      },
      {
        accessorKey: "code",
        header: "Code",
      },
      {
        accessorKey: "status",
        header: t("columns.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as Space["status"];
          const variant =
            status === "active"
              ? "default"
              : status === "inactive"
                ? "secondary"
                : "outline";
          return <Badge variant={variant}>{t(`status.${status}`)}</Badge>;
        },
      },
      {
        id: "actions",
        header: t("columns.actions"),
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/space/${row.original.id}`}>
              <Eye className="mr-1 size-4" />
              {t("actions.view")}
            </Link>
          </Button>
        ),
      },
    ],
    [t]
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- React Compiler automatically skips memoization for TanStack Table
  const table = useReactTable({
    data: spaces,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Fetch spaces when search, status, limit, or page changes (skip initial render)
  useEffect(() => {
    const fetchSpaces = async () => {
      setIsLoading(true);
      setError(null);

      const result = await getSpacesAction({
        search: debouncedSearch || undefined,
        status,
        limit,
        page,
      });

      if (result.success && result.data) {
        setSpaces(result.data.data);
        setMeta(result.data.metadata);
      } else {
        setError(result.message ?? "Failed to fetch spaces");
      }

      setIsLoading(false);
    };

    fetchSpaces();
  }, [debouncedSearch, status, limit, page]);

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
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-8 w-16" />
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
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-muted-foreground text-sm">
            {t("pagination.showing", {
              from: (page - 1) * limit + 1,
              to: Math.min(page * limit, meta.totalItems),
              total: meta.totalItems,
            })}
          </p>
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
