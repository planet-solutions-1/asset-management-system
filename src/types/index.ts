export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string; // Admin has no companyId or 'all'
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  logo?: string;
}

export type AssetType = 'AC' | 'FAN' | 'GENERATOR' | 'COMPUTER' | 'OTHER';
export type AssetStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'BROKEN';

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  date: string; // Date reported
  type: 'AMC' | 'REPAIR' | 'ROUTINE' | 'COMPLAINT';
  description: string;
  cost?: number;
  performedBy: string; // Or "Reported By"
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  resolvedDate?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  companyId: string;
  status: AssetStatus;
  location: string; // e.g., "Building A, Room 101"
  purchaseDate: string;
  warrantyExpiry: string;
  amcExpiry?: string;
  image?: string; // URL or base64
  isPowered?: boolean; // [NEW] Status
  specifications?: Record<string, string>; // e.g., { "Power": "1.5 Ton", "Brand": "Voltas" }
  maintenanceHistory: MaintenanceRecord[];
}

export interface Bill {
  id: string;
  amount: number;
  date: string;
  type: string;
  fileUrl?: string; // Base64
  assetId?: string;
  companyId: string;
  asset?: { name: string };
}
