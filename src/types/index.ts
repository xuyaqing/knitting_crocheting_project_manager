export interface YarnDetail {
  yarnId: string;
  brand: string;
  yarnName: string;
  weight: string;
  yardage: string;
  fiber: string;
  photoUrl: string;
  availableColor: string;
  notes: string;
}

export interface YarnPurchase {
  purchaseId: string;
  yarnId: string;
  color: string;
  photoUrl: string;
  colorCodes: string[];
  date: string;
  quantity: string;
  gramsPerSkein: string;
  totalGrams: string;
  totalYardage: string;
  pricePaid: string;
  currency: string;
  source: string;
  status: string;
  pricePerGram: string;
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
  photoUrl: string;
  notes: string;
  tutorialLink: string;
  totalMaterialCost: string;
}

export interface YarnUsed {
  yarnId: string;
  projectId: string;
  plannedGrams: string;
  actualGramsUsed: string;
  cost: string;
  notes: string;
}

export interface AppData {
  yarnDetails: YarnDetail[];
  yarnPurchases: YarnPurchase[];
  projects: Project[];
  yarnUsed: YarnUsed[];
}
