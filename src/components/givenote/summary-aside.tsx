"use client";

import type { Totals } from "@/components/givenote/types";

type SummaryAsideProps = {
  totals: Totals;
  formatMoney: (value: number) => string;
};

export function SummaryAside({ totals, formatMoney }: SummaryAsideProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-700">결산 요약</div>
      <div className="mt-4 grid gap-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            총액
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {formatMoney(totals.totalAmount)}원
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            총 건수
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {formatMoney(totals.totalCount)}건
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            총 인원
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {formatMoney(totals.totalPeople)}명
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="text-xs uppercase tracking-widest text-slate-500">
          관계별 합계
        </div>
        <div className="mt-2 space-y-1 text-sm text-slate-700">
          {totals.byRelation.size === 0 ? (
            <div className="text-slate-500">데이터 없음</div>
          ) : (
            Array.from(totals.byRelation.entries()).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{key}</span>
                <span className="font-medium">{formatMoney(value)}원</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="text-xs uppercase tracking-widest text-slate-500">
          전달방식별 합계
        </div>
        <div className="mt-2 space-y-1 text-sm text-slate-700">
          {totals.byMethod.size === 0 ? (
            <div className="text-slate-500">데이터 없음</div>
          ) : (
            Array.from(totals.byMethod.entries()).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{key}</span>
                <span className="font-medium">{formatMoney(value)}원</span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
