import Dexie, { type Table } from "dexie";

export type EventType = "결혼식" | "조의" | "돌잔치" | "생일" | "기타";

export type RelationType = "친구" | "회사" | "가족" | "지인" | "이웃" | "기타";

export type PaymentMethodType = "현금" | "계좌이체" | "카드" | "페이" | "기타";

export type StatusType = "수납완료" | "미수납" | "반환예정";

export interface EventItem {
  id?: number;
  type: EventType;
  date: string;
  location: string;
  host: string;
  createdAt: number;
}

export interface GiftRecord {
  id?: number;
  eventId: number;
  name: string;
  amount: number;
  relation?: RelationType;
  companions?: number;
  paymentMethod?: PaymentMethodType;
  status?: StatusType;
  memo?: string;
  createdAt: number;
}

class GiftDB extends Dexie {
  events!: Table<EventItem, number>;
  records!: Table<GiftRecord, number>;

  constructor() {
    super("gift-ledger");
    this.version(2).stores({
      events: "++id, type, date, host, createdAt",
      records:
        "++id, eventId, name, amount, relation, paymentMethod, status, createdAt",
    });
  }
}

export const db = new GiftDB();
