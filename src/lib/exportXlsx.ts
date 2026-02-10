import * as XLSX from "xlsx-js-style";

import type { EventItem, GiftRecord } from "@/lib/db";
import type { Totals } from "@/hooks/useGiftRecords";

type ExportRow = {
  번호: number | string;
  이름: string;
  금액: number | string;
  인원수: number | string;
};

const makeEmptyRow = (): ExportRow => ({
  번호: "",
  이름: "",
  금액: "",
  인원수: "",
});

const makeRows = (
  selectedEvent: EventItem | null,
  filteredRecords: GiftRecord[],
): ExportRow[] => {
  if (!selectedEvent) return [];

  return filteredRecords.map((record, index) => ({
    번호: index + 1,
    이름: record.name,
    금액: record.amount,
    인원수: record.companions ?? 1,
  }));
};

const makeSummaryRows = (totals: Totals): ExportRow[] => [
  makeEmptyRow(),
  { ...makeEmptyRow(), 번호: "총 금액", 금액: totals.totalAmount },
  { ...makeEmptyRow(), 번호: "총 인원수", 인원수: totals.totalPeople },
];

export const exportToXlsx = ({
  selectedEvent,
  filteredRecords,
  totals,
}: {
  selectedEvent: EventItem | null;
  filteredRecords: GiftRecord[];
  totals: Totals;
}) => {
  if (!selectedEvent) return;

  const rows = makeRows(selectedEvent, filteredRecords);
  const headers: Array<keyof ExportRow> = ["번호", "이름", "금액", "인원수"];
  const dataRows = rows.map((row) => [
    row.번호,
    row.이름,
    row.금액,
    row.인원수,
  ]);
  const aoa = [headers, ...dataRows];

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      ["총 금액", totals.totalAmount],
      ["총 인원수", totals.totalPeople],
    ],
    { origin: "F3" },
  );

  const applyCellStyles = (rangeRef: string) => {
    const range = XLSX.utils.decode_range(rangeRef);
    for (let row = range.s.r; row <= range.e.r; row += 1) {
      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress] ?? { t: "s", v: "" };
        cell.s = {
          ...(cell.s ?? {}),
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "CBD5E1" } },
            bottom: { style: "thin", color: { rgb: "CBD5E1" } },
            left: { style: "thin", color: { rgb: "CBD5E1" } },
            right: { style: "thin", color: { rgb: "CBD5E1" } },
          },
        };
        worksheet[cellAddress] = cell;
      }
    }
  };

  if (aoa.length > 0) {
    applyCellStyles(`A1:D${aoa.length}`);
  }
  applyCellStyles("F3:G4");

  const columnWidths = headers.map((key) => {
    const headerLen = String(key).length;
    const maxValueLen = rows.reduce(
      (max, row) => Math.max(max, String(row[key] ?? "").length),
      0,
    );
    const maxLen = Math.max(headerLen, maxValueLen);
    return { wch: Math.min(40, maxLen * 2 + 2) };
  });
  worksheet["!cols"] = [
    ...columnWidths,
    { wch: 4 },
    { wch: 10 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "명단");
  XLSX.writeFile(workbook, `givenote-${selectedEvent.date}.xlsx`);
};

export const exportToCsv = ({
  selectedEvent,
  filteredRecords,
  totals,
}: {
  selectedEvent: EventItem | null;
  filteredRecords: GiftRecord[];
  totals: Totals;
}) => {
  if (!selectedEvent) return;

  const rowsWithSummary: ExportRow[] = makeRows(
    selectedEvent,
    filteredRecords,
  ).concat(makeSummaryRows(totals));

  const worksheet = XLSX.utils.json_to_sheet(rowsWithSummary);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "명단");
  XLSX.writeFile(workbook, `givenote-${selectedEvent.date}.csv`, {
    bookType: "csv",
  });
};
