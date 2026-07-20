export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  price: number;
  vatRate: number; // e.g., 21, 9, 0
  billingType?: 'eenmalig' | 'abonnement';
}

export interface CompanyDetails {
  name: string;
  address: string;
  zipCity: string;
  kvk: string;
  btwId: string;
  iban: string;
  logoUrl: string; // base64 or object URL
  email?: string;
}

export interface ClientDetails {
  id: string;
  name: string;
  address: string;
  zipCity: string;
  email: string;
  ccEmail?: string;
  bccEmail?: string;
}

export interface InvoiceSettings {
  prefix: string;
  nextNumber: number;
  invoiceDate: string;
  dueDate: string;
  paymentTermDays: number;
  paymentTermType: '7' | '14' | '30' | '60' | 'custom';
  notes: string;
  currency: string;
  colorTheme?: string;
}

export interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  clientName: string;
  clientDetails: ClientDetails;
  companyDetails: CompanyDetails;
  settings: InvoiceSettings;
  lines: InvoiceLine[];
  subtotal: number;
  totalVat: number;
  total: number;
  createdAt: string;
  status?: 'open' | 'geweigerd' | 'betaald';
}

export interface Product {
  id: string;
  description: string;
  price: number;
  vatRate: number; // e.g., 21, 9, 0
  billingType?: 'eenmalig' | 'abonnement';
}




