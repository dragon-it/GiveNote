"use client";

import {
  flexRender,
  type ColumnDef,
  type Table as TanTable,
} from "@tanstack/react-table";

import { InlineForm, type InlineFormProps } from "@/components/InlineForm";
import { Input } from "@/components/ui/input";
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
import type { GiftRecord, PaymentMethodType, RelationType } from "@/lib/db";

type GiftTableProps = {
  table: TanTable<GiftRecord>;
  columns: ColumnDef<GiftRecord>[];
  filteredCount: number;
  totalCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  relationFilter: string;
  onRelationFilterChange: (value: string) => void;
  paymentFilter: string;
  onPaymentFilterChange: (value: string) => void;
  relations: RelationType[];
  paymentMethods: PaymentMethodType[];
  editError: string;
  onRowDoubleClick: (record: GiftRecord) => void;
  inlineFormProps: InlineFormProps;
};

export function GiftTable({
  table,
  columns,
  filteredCount,
  totalCount,
  search,
  onSearchChange,
  relationFilter,
  onRelationFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  relations,
  paymentMethods,
  editError,
  onRowDoubleClick,
  inlineFormProps,
}: GiftTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">명단 리스트</h2>
          <p className="text-sm text-slate-500">
            {filteredCount} / {totalCount} 건
          </p>
          {editError ? (
            <p className="text-xs text-red-500">{editError}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            className="w-44"
            placeholder="이름/메모 검색"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Select value={relationFilter} onValueChange={onRelationFilterChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="관계" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 관계</SelectItem>
              {relations.map((relation) => (
                <SelectItem key={relation} value={relation}>
                  {relation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={onPaymentFilterChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="전달 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 방식</SelectItem>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <Table className="min-w-[900px] border-collapse text-[13px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-100">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 ${
                      header.column.id === "amount"
                        ? "text-right"
                        : "text-center"
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="even:bg-slate-50"
                  onDoubleClick={() => onRowDoubleClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`border-b border-slate-200 px-3 py-2 align-middle ${
                        cell.column.id === "amount"
                          ? "text-right"
                          : "text-center"
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-slate-500"
                >
                  아직 등록된 명단이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <InlineForm {...inlineFormProps} />
    </div>
  );
}
