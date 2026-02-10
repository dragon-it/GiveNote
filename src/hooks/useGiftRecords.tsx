"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useLiveQuery } from "dexie-react-hooks";
import dayjs from "dayjs";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  db,
  type EventItem,
  type EventType,
  type GiftRecord,
  type PaymentMethodType,
  type RelationType,
} from "@/lib/db";

export const eventSchema = z.object({
  type: z.string().min(1, "행사 타입을 선택해 주세요."),
  date: z.string().min(1, "날짜를 입력해 주세요."),
  location: z.string().min(1, "장소를 입력해 주세요."),
  host: z.string().min(1, "호스트 이름을 입력해 주세요."),
});

export const recordSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요."),
  amount: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number("금액을 입력해 주세요.").min(1, "금액을 입력해 주세요."),
  ),
  relation: z.string().optional(),
  companions: z.preprocess(
    (value) =>
      value === "" || value === undefined || value === null ? 1 : Number(value),
    z.number().int().min(0, "동반인 수는 0 이상이어야 합니다."),
  ),
  paymentMethod: z.string().optional(),
  memo: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

export type Totals = {
  totalAmount: number;
  totalCount: number;
  totalCompanions: number;
  totalPeople: number;
  byRelation: Map<string, number>;
  byMethod: Map<string, number>;
};

export const formatMoney = (value: number) => value.toLocaleString("ko-KR");

type EditingDraft = {
  name: string;
  amount: string;
  relation: string;
  companions: string;
  paymentMethod: string;
  memo: string;
};

type UseGiftRecordsParams = {
  eventTypes: EventType[];
  relations: RelationType[];
  paymentMethods: PaymentMethodType[];
};

export function useGiftRecords({
  eventTypes,
  relations,
  paymentMethods,
}: UseGiftRecordsParams) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [relationFilter, setRelationFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<EditingDraft | null>(null);
  const [editError, setEditError] = useState("");

  const eventsQuery = useLiveQuery(() => db.events.toArray(), []);
  const recordsQuery = useLiveQuery(
    () =>
      selectedEventId
        ? db.records.where("eventId").equals(selectedEventId).toArray()
        : [],
    [selectedEventId],
  );
  const events = useMemo(() => eventsQuery ?? [], [eventsQuery]);
  const records = useMemo(() => recordsQuery ?? [], [recordsQuery]);

  const selectedEvent = useMemo<EventItem | null>(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0]?.id ?? null);
    }
  }, [events, selectedEventId]);

  const eventForm = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: eventTypes[0],
      date: dayjs().format("YYYY-MM-DD"),
      location: "",
      host: "",
    },
  });

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return records.filter((record) => {
      if (relationFilter !== "all" && record.relation !== relationFilter) {
        return false;
      }
      if (paymentFilter !== "all" && record.paymentMethod !== paymentFilter) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }

      const nameMatch = record.name.toLowerCase().includes(normalizedSearch);
      const memoMatch = (record.memo ?? "")
        .toLowerCase()
        .includes(normalizedSearch);
      return nameMatch || memoMatch;
    });
  }, [records, search, relationFilter, paymentFilter]);

  const totals = useMemo<Totals>(() => {
    const totalAmount = filteredRecords.reduce(
      (sum, record) => sum + record.amount,
      0,
    );
    const totalCount = filteredRecords.length;
    const totalCompanions = filteredRecords.reduce(
      (sum, record) => sum + (record.companions ?? 1),
      0,
    );
    const totalPeople = totalCompanions;
    const byRelation = new Map<string, number>();
    const byMethod = new Map<string, number>();

    filteredRecords.forEach((record) => {
      if (record.relation) {
        byRelation.set(
          record.relation,
          (byRelation.get(record.relation) ?? 0) + record.amount,
        );
      }
      if (record.paymentMethod) {
        byMethod.set(
          record.paymentMethod,
          (byMethod.get(record.paymentMethod) ?? 0) + record.amount,
        );
      }
    });

    return {
      totalAmount,
      totalCount,
      totalCompanions,
      totalPeople,
      byRelation,
      byMethod,
    };
  }, [filteredRecords]);

  const handleEditStart = useCallback((record: GiftRecord) => {
    if (!record.id) {
      return;
    }
    setEditingRecordId(record.id);
    setEditingDraft({
      name: record.name,
      amount: String(record.amount),
      relation: record.relation ?? "기타",
      companions: String(record.companions ?? 1),
      paymentMethod: record.paymentMethod ?? "현금",
      memo: record.memo ?? "",
    });
    setEditError("");
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingRecordId(null);
    setEditingDraft(null);
    setEditError("");
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editingRecordId || !editingDraft) return;

    const parsed = recordSchema.safeParse({
      name: editingDraft.name,
      amount: editingDraft.amount,
      relation: editingDraft.relation || undefined,
      companions: editingDraft.companions,
      paymentMethod: editingDraft.paymentMethod || undefined,
      memo: editingDraft.memo?.trim() || undefined,
    });

    if (!parsed.success) {
      setEditError(
        parsed.error.issues[0]?.message ?? "입력값이 유효하지 않습니다.",
      );
      return;
    }

    await db.records.update(editingRecordId, {
      name: parsed.data.name,
      amount: Number(parsed.data.amount),
      relation: (parsed.data.relation as RelationType) || undefined,
      companions: parsed.data.companions,
      paymentMethod:
        (parsed.data.paymentMethod as PaymentMethodType) || undefined,
      memo: parsed.data.memo?.trim() || undefined,
    });

    handleEditCancel();
  }, [editingRecordId, editingDraft, handleEditCancel]);

  const handleEditKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.nativeEvent.isComposing) {
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        void handleEditSave();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        handleEditCancel();
      }
    },
    [handleEditCancel, handleEditSave],
  );

  const columns = useMemo<ColumnDef<GiftRecord>[]>(
    () => [
      {
        id: "index",
        header: "번호",
        cell: ({ row }) => (
          <div className="text-xs text-slate-500">{row.index + 1}</div>
        ),
      },

      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            이름
          </Button>
        ),
        cell: ({ row }) => {
          const isEditing = row.original.id === editingRecordId;
          const draft = editingDraft;

          if (!isEditing || !draft) {
            return (
              <div className="font-medium text-center">{row.original.name}</div>
            );
          }

          return (
            <Input
              value={draft.name}
              onChange={(event) =>
                setEditingDraft((prev) =>
                  prev ? { ...prev, name: event.target.value } : prev,
                )
              }
              onKeyDown={handleEditKeyDown}
              className="h-9 w-full min-w-[8rem] text-center"
            />
          );
        },
      },

      {
        accessorKey: "amount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-end px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            금액(만원)
          </Button>
        ),
        cell: ({ row }) => {
          const isEditing = row.original.id === editingRecordId;
          const draft = editingDraft;

          if (!isEditing || !draft) {
            return (
              <div className="text-right tabular-nums">
                {formatMoney(row.original.amount)}만원
              </div>
            );
          }

          return (
            <Input
              type="number"
              inputMode="numeric"
              value={draft.amount}
              onChange={(event) =>
                setEditingDraft((prev) =>
                  prev ? { ...prev, amount: event.target.value } : prev,
                )
              }
              onKeyDown={handleEditKeyDown}
              className="h-9 w-full min-w-[6rem] text-right"
            />
          );
        },
      },

      {
        accessorKey: "companions",
        header: "인원 수",
        cell: ({ row }) => {
          const isEditing = row.original.id === editingRecordId;
          const draft = editingDraft;

          if (!isEditing || !draft) return row.original.companions ?? 1;

          return (
            <Input
              type="number"
              inputMode="numeric"
              value={draft.companions}
              onChange={(event) =>
                setEditingDraft((prev) =>
                  prev ? { ...prev, companions: event.target.value } : prev,
                )
              }
              onKeyDown={handleEditKeyDown}
              className="h-9 w-full min-w-[5rem] text-center"
            />
          );
        },
      },
      {
        accessorKey: "relation",
        header: "관계",
        cell: ({ row }) => {
          const isEditing = row.original.id === editingRecordId;
          const draft = editingDraft;

          if (!isEditing || !draft) return row.original.relation ?? "-";

          return (
            <Select
              value={draft.relation || undefined}
              onValueChange={(value) =>
                setEditingDraft((prev) =>
                  prev ? { ...prev, relation: value } : prev,
                )
              }
            >
              <SelectTrigger className="h-9 w-full min-w-[7rem]">
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
          );
        },
      },
      {
        accessorKey: "paymentMethod",
        header: "전달방식",
        cell: ({ row }) => {
          const isEditing = row.original.id === editingRecordId;
          const draft = editingDraft;

          if (!isEditing || !draft) return row.original.paymentMethod ?? "-";

          return (
            <Select
              value={draft.paymentMethod || undefined}
              onValueChange={(value) =>
                setEditingDraft((prev) =>
                  prev ? { ...prev, paymentMethod: value } : prev,
                )
              }
            >
              <SelectTrigger className="h-9 w-full min-w-[7rem]">
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
          );
        },
      },
      {
        accessorKey: "memo",
        header: "메모",
        cell: ({ row }) => {
          const isEditing = row.original.id === editingRecordId;
          const draft = editingDraft;

          if (!isEditing || !draft) return row.original.memo ?? "-";

          return (
            <Input
              value={draft.memo}
              onChange={(event) =>
                setEditingDraft((prev) =>
                  prev ? { ...prev, memo: event.target.value } : prev,
                )
              }
              onKeyDown={handleEditKeyDown}
              className="h-9 w-full min-w-[10rem] text-center"
            />
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const isEditing = row.original.id === editingRecordId;

          if (isEditing) {
            return (
              <div className="mx-auto flex w-fit gap-1">
                <Button type="button" size="sm" onClick={handleEditSave}>
                  저장
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleEditCancel}
                >
                  취소
                </Button>
              </div>
            );
          }

          return (
            <div className="mx-auto flex w-fit gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleEditStart(row.original)}
              >
                수정
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (row.original.id) await db.records.delete(row.original.id);
                }}
              >
                삭제
              </Button>
            </div>
          );
        },
      },
    ],
    [
      editingRecordId,
      editingDraft,
      relations,
      paymentMethods,
      handleEditCancel,
      handleEditKeyDown,
      handleEditSave,
      handleEditStart,
    ],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleCreateEvent = async (values: EventFormValues) => {
    const id = await db.events.add({
      type: values.type as EventType,
      date: values.date,
      location: values.location,
      host: values.host,
      createdAt: Date.now(),
    });
    setSelectedEventId(id);
    eventForm.reset({
      type: values.type,
      date: values.date,
      location: "",
      host: "",
    });
  };

  return {
    events,
    records,
    selectedEvent,
    selectedEventId,
    setSelectedEventId,
    eventForm,
    handleCreateEvent,
    search,
    setSearch,
    relationFilter,
    setRelationFilter,
    paymentFilter,
    setPaymentFilter,
    filteredRecords,
    totals,
    columns,
    table,
    editError,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    handleEditKeyDown,
    editingRecordId,
    editingDraft,
    setEditingDraft,
  };
}
