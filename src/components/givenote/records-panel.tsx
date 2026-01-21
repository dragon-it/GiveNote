"use client";

import type {
  Dispatch,
  KeyboardEvent,
  RefObject,
  SetStateAction,
} from "react";
import { flexRender, type ColumnDef, type Table } from "@tanstack/react-table";
import type {
  GiftRecord,
  PaymentMethodType,
  RelationType,
} from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table as DataTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InlineFormState } from "@/components/givenote/types";

type RecordsPanelProps = {
  search: string;
  onSearchChange: (value: string) => void;
  relationFilter: string;
  onRelationFilterChange: (value: string) => void;
  paymentFilter: string;
  onPaymentFilterChange: (value: string) => void;
  relations: RelationType[];
  paymentMethods: PaymentMethodType[];
  filteredCount: number;
  totalCount: number;
  editError: string;
  table: Table<GiftRecord>;
  columns: ColumnDef<GiftRecord>[];
  onEditStart: (record: GiftRecord) => void;
  inlineError: string;
  inlineForm: InlineFormState;
  setInlineForm: Dispatch<SetStateAction<InlineFormState>>;
  onInlineKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onInlineAdd: () => void | Promise<void>;
  isEventSelected: boolean;
  nameInputRef: RefObject<HTMLInputElement>;
};

export function RecordsPanel({
  search,
  onSearchChange,
  relationFilter,
  onRelationFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  relations,
  paymentMethods,
  filteredCount,
  totalCount,
  editError,
  table,
  columns,
  onEditStart,
  inlineError,
  inlineForm,
  setInlineForm,
  onInlineKeyDown,
  onInlineAdd,
  isEventSelected,
  nameInputRef,
}: RecordsPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">명단 리스트</h2>
          <p className="text-sm text-slate-500">
            {filteredCount} / {totalCount} 건
          </p>
          {editError ? <p className="text-xs text-red-500">{editError}</p> : null}
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
        <DataTable className="border-collapse text-[13px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-100">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
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
                  onDoubleClick={() => onEditStart(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="border-b border-slate-200 px-3"
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
        </DataTable>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-700">
            명단 바로 추가
          </div>
          {inlineError ? (
            <div className="text-xs text-red-500">{inlineError}</div>
          ) : null}
        </div>
        <div className="mt-3 grid gap-2 lg:grid-cols-[1.1fr_0.8fr_0.9fr_0.8fr_0.9fr_1.2fr_auto]">
          <div className="grid gap-1">
            <span className="text-[11px] font-medium text-slate-600">이름</span>
            <Input
              key="inline-name"
              placeholder="이름"
              ref={nameInputRef}
              value={inlineForm.name}
              onChange={(event) =>
                setInlineForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              onKeyDown={onInlineKeyDown}
            />
          </div>
          <div className="grid gap-1">
            <span className="text-[11px] font-medium text-slate-600">금액</span>
            <Input
              key="inline-amount"
              type="number"
              inputMode="numeric"
              placeholder="금액"
              value={inlineForm.amount}
              onChange={(event) =>
                setInlineForm((prev) => ({
                  ...prev,
                  amount: event.target.value,
                }))
              }
              onKeyDown={onInlineKeyDown}
            />
          </div>
          <div className="grid gap-1">
            <span className="text-[11px] font-medium text-slate-600">관계</span>
            <Select
              key="inline-relation"
              value={inlineForm.relation || undefined}
              onValueChange={(value) =>
                setInlineForm((prev) => ({ ...prev, relation: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="관계" />
              </SelectTrigger>
              <SelectContent>
                {relations.map((relation) => (
                  <SelectItem key={relation} value={relation}>
                    {relation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <span className="text-[11px] font-medium text-slate-600">
              인원 수
            </span>
            <Input
              key="inline-companions"
              type="number"
              inputMode="numeric"
              placeholder="인원 수"
              value={inlineForm.companions}
              onChange={(event) =>
                setInlineForm((prev) => ({
                  ...prev,
                  companions: event.target.value,
                }))
              }
              onKeyDown={onInlineKeyDown}
            />
          </div>
          <div className="grid gap-1">
            <span className="text-[11px] font-medium text-slate-600">
              전달방식
            </span>
            <Select
              key="inline-payment-method"
              value={inlineForm.paymentMethod || undefined}
              onValueChange={(value) =>
                setInlineForm((prev) => ({ ...prev, paymentMethod: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="전달 방식" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <span className="text-[11px] font-medium text-slate-600">메모</span>
            <Input
              key="inline-memo"
              placeholder="메모"
              value={inlineForm.memo}
              onChange={(event) =>
                setInlineForm((prev) => ({
                  ...prev,
                  memo: event.target.value,
                }))
              }
              onKeyDown={onInlineKeyDown}
            />
          </div>
          <div className="grid items-end">
            <Button type="button" onClick={onInlineAdd} disabled={!isEventSelected}>
              추가
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
