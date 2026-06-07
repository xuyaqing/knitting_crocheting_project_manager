export interface YarnDetail {
  yarnId: string;
  brand: string;
  yarnName: string;
  weight: string;
  fiber: string;
  notes: string;
}

export interface YarnPurchase {
  purchaseId: string;
  yarnId: string;
  color: string;
  photoUrls: string[];
  colorCodes: string[];
  date: string;
  quantity: string;
  gramsPerSkein: string;
  yardage: string;
  totalGrams: string;
  totalYardage: string;
  pricePaid: string;
  currency: string;
  source: string;
  status: string;
  pricePerGram: string;
  remainingGrams: string;
}

export interface Project {
  projectId: string;
  projectName: string;
  type: string;
  pattern: string;
  status: string;
  startDate: string;
  endDate: string;
  needleHookSize: string;
  photoUrls: string[];
  notes: string;
  tutorialLink: string;
  totalMaterialCost: string;
  yarn1: string;
  yarn1GUsed: string;
  yarn2: string;
  yarn2GUsed: string;
  yarn3: string;
  yarn3GUsed: string;
  yarn4: string;
  yarn4GUsed: string;
  yarn5: string;
  yarn5GUsed: string;
}

export interface Kit {
  kitId: string;
  brand: string;
  kitName: string;
  photoUrl: string;
  price: string;
  currency: string;
}

export interface AppData {
  yarnDetails: YarnDetail[];
  yarnPurchases: YarnPurchase[];
  projects: Project[];
  kits: Kit[];
}
