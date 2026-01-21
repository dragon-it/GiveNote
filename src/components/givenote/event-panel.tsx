"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import type { EventItem, EventType } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventFormValues } from "@/components/givenote/types";

type EventPanelProps = {
  events: EventItem[];
  selectedEventId: number | null;
  selectedEvent: EventItem | null;
  onSelectEvent: (value: number) => void;
  eventTypes: EventType[];
  eventForm: UseFormReturn<EventFormValues>;
  onCreateEvent: (values: EventFormValues) => void | Promise<void>;
};

export function EventPanel({
  events,
  selectedEventId,
  selectedEvent,
  onSelectEvent,
  eventTypes,
  eventForm,
  onCreateEvent,
}: EventPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">행사</h2>
          <p className="text-sm text-slate-500">
            행사 생성 후 해당 행사의 명단만 관리합니다.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label>선택된 행사</Label>
          <Select
            value={selectedEventId ? String(selectedEventId) : undefined}
            onValueChange={(value) => onSelectEvent(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="행사 선택" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={String(event.id)}>
                  {event.type} | {event.date} | {event.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEvent ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="font-medium text-slate-900">
              {selectedEvent.type}
            </div>
            <div>{selectedEvent.date}</div>
            <div>{selectedEvent.location}</div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              호스트: {selectedEvent.host}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">행사를 먼저 생성해 주세요.</p>
        )}
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="text-base font-semibold">행사 생성</h3>
        <form
          className="mt-4 grid gap-4"
          onSubmit={eventForm.handleSubmit(onCreateEvent)}
        >
          <div className="grid gap-2">
            <Label>행사 타입</Label>
            <Controller
              control={eventForm.control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="행사 타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {eventForm.formState.errors.type ? (
              <p className="text-xs text-red-500">
                {eventForm.formState.errors.type.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label>날짜</Label>
            <Input type="date" {...eventForm.register("date")} />
            {eventForm.formState.errors.date ? (
              <p className="text-xs text-red-500">
                {eventForm.formState.errors.date.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label>장소</Label>
            <Input placeholder="예식장/장소" {...eventForm.register("location")} />
            {eventForm.formState.errors.location ? (
              <p className="text-xs text-red-500">
                {eventForm.formState.errors.location.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label>호스트</Label>
            <Input placeholder="본인 이름" {...eventForm.register("host")} />
            {eventForm.formState.errors.host ? (
              <p className="text-xs text-red-500">
                {eventForm.formState.errors.host.message}
              </p>
            ) : null}
          </div>

          <Button type="submit">행사 추가</Button>
        </form>
      </div>
    </div>
  );
}
