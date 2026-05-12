import type { AppData, YarnDetail, YarnPurchase, Project, YarnUsed } from '../types';

const SHEET_ID = import.meta.env.VITE_SHEET_ID as string;

async function fetchSheet(sheetName: string): Promise<any[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet "${sheetName}" (${res.status})`);
  const text = await res.text();
  // Strip JSONP wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const parsed = JSON.parse(jsonStr);
  if (parsed.status === 'error') {
    throw new Error(`Sheet error: ${parsed.errors?.[0]?.message ?? 'unknown'}`);
  }
  return (parsed.table?.rows ?? []) as any[][];
}

function cell(row: any[], index: number): string {
  const c = row?.[index];
  if (!c || c.v === null || c.v === undefined) return '';
  // Date values come as "Date(2024,0,15)" — use the formatted string instead
  if (typeof c.v === 'string' && c.v.startsWith('Date(')) return c.f ?? '';
  return String(c.v).trim();
}

function parseColorCodes(raw: string): string[] {
  return raw
    .split(/[,;]+/)
    .map(s => {
      const hex = s.trim().replace(/^#/, '');
      return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex) ? `#${hex}` : '';
    })
    .filter(Boolean);
}

export async function fetchAllData(): Promise<AppData> {
  const [detailRows, purchaseRows, projectRows, usedRows] = await Promise.all([
    fetchSheet('Yarn Details'),
    fetchSheet('Yarn Purchases'),
    fetchSheet('Projects'),
    fetchSheet('Yarn Used'),
  ]);

  // Each row from gviz has a `.c` array of cell objects
  const cells = (rows: any[][]) => rows.map(r => r && (r as any).c ? (r as any).c : r);

  const yarnDetails: YarnDetail[] = cells(detailRows)
    .map(r => ({
      yarnId: cell(r, 0),
      brand: cell(r, 1),
      yarnName: cell(r, 2),
      weight: cell(r, 3),
      yardage: cell(r, 4),
      fiber: cell(r, 5),
      photoUrl: cell(r, 6),
      availableColor: cell(r, 7),
      notes: cell(r, 8),
    }))
    .filter(y => y.yarnId);

  const yarnPurchases: YarnPurchase[] = cells(purchaseRows)
    .map(r => ({
      purchaseId: cell(r, 0),
      yarnId: cell(r, 1),
      color: cell(r, 2),
      photoUrl: cell(r, 3),
      colorCodes: parseColorCodes(cell(r, 4)),
      date: cell(r, 5),
      quantity: cell(r, 6),
      gramsPerSkein: cell(r, 7),
      totalGrams: cell(r, 8),
      totalYardage: cell(r, 9),
      pricePaid: cell(r, 10),
      currency: cell(r, 11),
      source: cell(r, 12),
      status: cell(r, 13),
      pricePerGram: cell(r, 14),
    }))
    .filter(p => p.purchaseId);

  const projects: Project[] = cells(projectRows)
    .map(r => ({
      projectId: cell(r, 0),
      projectName: cell(r, 1),
      type: cell(r, 2),
      pattern: cell(r, 3),
      status: cell(r, 4),
      startDate: cell(r, 5),
      endDate: cell(r, 6),
      needleHookSize: cell(r, 7),
      photoUrl: cell(r, 8),
      notes: cell(r, 9),
      tutorialLink: cell(r, 10),
      totalMaterialCost: cell(r, 11),
    }))
    .filter(p => p.projectId);

  const yarnUsed: YarnUsed[] = cells(usedRows)
    .map(r => ({
      yarnId: cell(r, 0),
      projectId: cell(r, 1),
      plannedGrams: cell(r, 2),
      actualGramsUsed: cell(r, 3),
      cost: cell(r, 4),
      notes: cell(r, 5),
    }))
    .filter(u => u.yarnId && u.projectId);

  return { yarnDetails, yarnPurchases, projects, yarnUsed };
}
