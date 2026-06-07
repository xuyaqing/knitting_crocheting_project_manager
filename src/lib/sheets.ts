import type { AppData, YarnDetail, YarnPurchase, Project, Kit } from '../types';

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

function parsePhotoUrls(raw: string): string[] {
  // Links may be separated by ASCII or fullwidth commas/semicolons, newlines,
  // or whitespace. URLs never contain spaces, so splitting on whitespace is safe.
  return raw.split(/[\n,;，；、\s]+/).map(s => s.trim()).filter(Boolean);
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
  const [detailRows, purchaseRows, projectRows, kitRows] = await Promise.all([
    fetchSheet('Yarn Details'),
    fetchSheet('Yarn Purchases'),
    fetchSheet('Projects'),
    fetchSheet('Kit'),
  ]);

  // Each row from gviz has a `.c` array of cell objects
  const cells = (rows: any[][]) => rows.map(r => r && (r as any).c ? (r as any).c : r);

  const yarnDetails: YarnDetail[] = cells(detailRows)
    .map(r => ({
      yarnId: cell(r, 0),
      brand: cell(r, 1),
      yarnName: cell(r, 2),
      weight: cell(r, 3),
      fiber: cell(r, 6),
      notes: cell(r, 7),
    }))
    .filter(y => y.yarnId);

  const yarnPurchases: YarnPurchase[] = cells(purchaseRows)
    .map(r => ({
      purchaseId: cell(r, 0),
      yarnId: cell(r, 1),
      // cols 2 (Yarn Brand) and 3 (Yarn Name) are sheet-only VLOOKUP helpers
      color: cell(r, 4),
      photoUrls: parsePhotoUrls(cell(r, 5)),
      colorCodes: parseColorCodes(cell(r, 6)),
      date: cell(r, 7),
      quantity: cell(r, 8),
      gramsPerSkein: cell(r, 9),
      yardage: cell(r, 10),
      totalGrams: cell(r, 11),
      totalYardage: cell(r, 12),
      pricePaid: cell(r, 13),
      currency: cell(r, 14),
      source: cell(r, 15),
      status: cell(r, 16),
      pricePerGram: cell(r, 17),
      remainingGrams: cell(r, 18),
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
      photoUrls: parsePhotoUrls(cell(r, 8)),
      notes: cell(r, 9),
      tutorialLink: cell(r, 10),
      totalMaterialCost: cell(r, 11),
      yarn1: cell(r, 12),
      yarn1GUsed: cell(r, 13),
      yarn2: cell(r, 14),
      yarn2GUsed: cell(r, 15),
      yarn3: cell(r, 16),
      yarn3GUsed: cell(r, 17),
      yarn4: cell(r, 18),
      yarn4GUsed: cell(r, 19),
      yarn5: cell(r, 20),
      yarn5GUsed: cell(r, 21),
    }))
    .filter(p => p.projectId);

  const kits: Kit[] = cells(kitRows)
    .map(r => ({
      kitId: cell(r, 0),
      brand: cell(r, 1),
      kitName: cell(r, 2),
      photoUrl: cell(r, 3),
      price: cell(r, 4),
      currency: cell(r, 5),
    }))
    .filter(k => k.kitId);

  return { yarnDetails, yarnPurchases, projects, kits };
}
