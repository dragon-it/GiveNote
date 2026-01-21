export type EventFormValues = {
  type: string;
  date: string;
  location: string;
  host: string;
};

export type InlineFormState = {
  name: string;
  amount: string;
  relation: string;
  companions: string;
  paymentMethod: string;
  memo: string;
};

export type Totals = {
  totalAmount: number;
  totalCount: number;
  totalCompanions: number;
  totalPeople: number;
  byRelation: Map<string, number>;
  byMethod: Map<string, number>;
};
