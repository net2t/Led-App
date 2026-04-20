import { saveAs } from 'file-saver';

function csvEscape(v: unknown) {
  const s = String(v ?? '');
  if (/[\n\r,\"]/g.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Record<string, unknown>>) {
  const lines: string[] = [];
  lines.push(headers.map(csvEscape).join(','));

  for (const r of rows) {
    lines.push(headers.map((h) => csvEscape((r as any)[h])).join(','));
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, filename);
}
