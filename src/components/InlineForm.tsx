"use client";

import type { Dispatch, KeyboardEvent, RefObject, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentMethodType, RelationType } from "@/lib/db";

type InlineFormState = {
  name: string;
  amount: string;
  relation: string;
  companions: string;
  paymentMethod: string;
  memo: string;
};

export type InlineFormProps = {
  inlineForm: InlineFormState;
  setInlineForm: Dispatch<SetStateAction<InlineFormState>>;
  inlineError: string;
  onAdd: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  nameInputRef: RefObject<HTMLInputElement>;
  relations: RelationType[];
  paymentMethods: PaymentMethodType[];
  selectedEventId: number | null;
};

export function InlineForm({
  inlineForm,
  setInlineForm,
  inlineError,
  onAdd,
  onKeyDown,
  nameInputRef,
  relations,
  paymentMethods,
  selectedEventId,
}: InlineFormProps) {
  return (
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
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="grid gap-1">
          <span className="text-[11px] font-medium text-slate-600">
            금액(만원)
          </span>
          <Input
            key="inline-amount"
            type="number"
            inputMode="numeric"
            placeholder="만원"
            value={inlineForm.amount}
            onChange={(event) =>
              setInlineForm((prev) => ({
                ...prev,
                amount: event.target.value,
              }))
            }
            onKeyDown={onKeyDown}
          />
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
            onKeyDown={onKeyDown}
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
              setInlineForm((prev) => ({
                ...prev,
                paymentMethod: value,
              }))
            }
          >
            <SelectTrigger className="w-full">
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
          <span className="text-[11px] font-medium text-slate-600">관계</span>
          <Select
            key="inline-relation"
            value={inlineForm.relation || undefined}
            onValueChange={(value) =>
              setInlineForm((prev) => ({ ...prev, relation: value }))
            }
          >
            <SelectTrigger className="w-full">
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
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="grid items-end">
          <Button type="button" onClick={onAdd} disabled={!selectedEventId}>
            추가
          </Button>
        </div>
      </div>
    </div>
  );
}
