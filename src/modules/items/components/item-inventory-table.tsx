"use client";
"use no memo";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Package } from "lucide-react";
import { useTranslations } from "next-intl";

import { type InventoryItem } from "../schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 10;

/**
 * Props for the ItemInventoryTable component.
 */
interface ItemInventoryTableProps {
  /** Array of inventory items to display */
  inventories: InventoryItem[];
}

/**
 * ItemInventoryTable displays inventory data in a paginated table.
 * Shows space name, balance, cost per unit, status, and notes.
 *
 * @param props - Component props
 * @param props.inventories - Array of inventory items
 * @returns Paginated inventory table with TanStack Table
 */
export function ItemInventoryTable({ inventories }: ItemInventoryTableProps) {
  const t = useTranslations("items");
  const [pageIndex, setPageIndex] = useState(0);

  const totalStock = useMemo(
    () => inventories.reduce((sum, inv) => sum + inv.balance, 0),
    [inventories]
  );

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: "space_name",
        header: t("inventory.space"),
      },
      {
        accessorKey: "balance",
        header: t("inventory.balance"),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.getValue("balance")}</span>
        ),
      },
      {
        accessorKey: "cost_per_unit",
        header: t("inventory.costPerUnit"),
        cell: ({ row }) => {
          const cost = row.getValue("cost_per_unit") as number;
          return (
            <span className="tabular-nums">
              {new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "IDR",
              }).format(cost)}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("inventory.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const variant =
            status === "active"
              ? "default"
              : status === "inactive"
                ? "secondary"
                : "outline";
          return <Badge variant={variant}>{status}</Badge>;
        },
      },
      {
        accessorKey: "notes",
        header: t("inventory.notes"),
        cell: ({ row }) => {
          const notes = row.getValue("notes") as string | undefined;
          return notes ? (
            <span className="text-muted-foreground line-clamp-2 text-sm">
              {notes}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          );
        },
      },
    ],
    [t]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: inventories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex,
        pageSize: PAGE_SIZE,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize: PAGE_SIZE });
        setPageIndex(newState.pageIndex);
      }
    },
  });

  const pageCount = table.getPageCount();

  if (inventories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="text-muted-foreground mb-4 size-12" />
        <p className="text-muted-foreground text-sm">{t("inventory.empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 px-4">
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="px-4 py-3 font-medium">
                {t("inventory.totalStock")}
              </TableCell>
              <TableCell className="px-4 py-3 font-semibold tabular-nums">
                {totalStock}
              </TableCell>
              <TableCell colSpan={3} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                aria-disabled={!table.getCanPreviousPage()}
                className={
                  !table.getCanPreviousPage()
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setPageIndex(i)}
                  isActive={pageIndex === i}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                aria-disabled={!table.getCanNextPage()}
                className={
                  !table.getCanNextPage()
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
