"use client";

import { useCallback, useRef, useState, type KeyboardEvent } from "react";

import {
  db,
  type PaymentMethodType,
  type RelationType,
} from "@/lib/db";
import { recordSchema } from "@/hooks/useGiftRecords";

type InlineFormState = {
  name: string;
  amount: string;
  relation: string;
  companions: string;
  paymentMethod: string;
  memo: string;
};

type UseInlineFormParams = {
  selectedEventId: number | null;
};

export function useInlineForm({ selectedEventId }: UseInlineFormParams) {
  const [inlineForm, setInlineForm] = useState<InlineFormState>({
    name: "",
    amount: "",
    relation: "기타",
    companions: "1",
    paymentMethod: "현금",
    memo: "",
  });
  const [inlineError, setInlineError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleInlineAdd = useCallback(async () => {
    if (!selectedEventId) {
      setInlineError("행사를 먼저 선택해 주세요.");
      return;
    }

    const parsed = recordSchema.safeParse({
      name: inlineForm.name,
      amount: inlineForm.amount,
      relation: inlineForm.relation || undefined,
      companions: inlineForm.companions,
      paymentMethod: inlineForm.paymentMethod || undefined,
      memo: inlineForm.memo,
    });

    if (!parsed.success) {
      setInlineError(
        parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
      );
      return;
    }

    await db.records.add({
      eventId: selectedEventId,
      name: parsed.data.name,
      amount: Number(parsed.data.amount),
      relation: (parsed.data.relation as RelationType) || undefined,
      companions: parsed.data.companions,
      paymentMethod:
        (parsed.data.paymentMethod as PaymentMethodType) || undefined,
      memo: parsed.data.memo?.trim() || undefined,
      createdAt: Date.now(),
    });

    setInlineForm((prev) => ({
      name: "",
      amount: "",
      relation: prev.relation || "기타",
      companions: "1",
      paymentMethod: prev.paymentMethod || "현금",
      memo: "",
    }));
    setInlineError("");
    requestAnimationFrame(() => nameInputRef.current?.focus());
  }, [inlineForm, selectedEventId]);

  const handleInlineKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter" || event.nativeEvent.isComposing) {
        return;
      }
      event.preventDefault();
      void handleInlineAdd();
    },
    [handleInlineAdd],
  );

  return {
    inlineForm,
    setInlineForm,
    inlineError,
    handleInlineAdd,
    handleInlineKeyDown,
    nameInputRef,
  };
}
