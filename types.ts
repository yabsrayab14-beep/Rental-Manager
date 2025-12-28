export enum PropertyStatus {
  OCCUPIED = 'Occupied',
  VACANT = 'Vacant',
  MAINTENANCE = 'Maintenance'
}

// PaymentStatus is no longer used for single status, keeping enum if needed for other logic or removing usage
export enum PaymentStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  OVERDUE = 'Overdue'
}

export interface Property {
  id: string;
  name: string;
  address: string;
  rentAmount: number;
  status: PropertyStatus;
  description: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl?: string;
}

export interface PaymentHistoryEntry {
  date: string;
  action: string;
}

export interface Tenant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rentAmount: number;
  startDate?: string; // When they started renting
  photoUrl?: string;
  payments: Record<string, boolean>; // e.g. { 'Jan': true, 'Feb': false }
  paymentHistory?: PaymentHistoryEntry[]; // Log of actions
  propertyId?: string;
  leaseEnd?: string;
  notes?: string;
}

export interface Stats {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  collectedRevenue: number;
  monthlyIncome: Record<string, number>;
}