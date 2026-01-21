"use client";

import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  onExportCsv: () => void;
  onExportXlsx: () => void;
  disableExport: boolean;
};

export function PageHeader({
  onExportCsv,
  onExportXlsx,
  disableExport,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
          GiveNote
        </div>
        <span className="text-sm text-slate-600">하객 및 축의금 관리</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">GiveNote</h1>
          <p className="text-sm text-slate-600">
            행사별 명단을 관리하고 엑셀 또는 CSV로 내보내기.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={onExportCsv}
            disabled={disableExport}
          >
            CSV 다운로드
          </Button>
          <Button onClick={onExportXlsx} disabled={disableExport}>
            XLSX 다운로드
          </Button>
        </div>
      </div>
    </header>
  );
}
