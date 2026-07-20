import { CompanyDetails, ClientDetails, InvoiceSettings, InvoiceLine, Product } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function generateInvoiceNumber(prefix: string, nextNumber: number): string {
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

export const defaultCompany: CompanyDetails = {
  name: '',
  address: '',
  zipCity: '',
  kvk: '',
  btwId: '',
  iban: '',
  logoUrl: '',
  email: '',
};

export const defaultClient: ClientDetails = {
  id: '',
  name: '',
  address: '',
  zipCity: '',
  email: '',
  ccEmail: '',
  bccEmail: '',
};

export const defaultClients: ClientDetails[] = [];

export const defaultSettings: InvoiceSettings = {
  prefix: 'FACT-',
  nextNumber: 1024,
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: (() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  })(),
  paymentTermDays: 14,
  paymentTermType: '14',
  notes: 'Wij verzoeken u vriendelijk het openstaande bedrag binnen 14 dagen over te maken naar IBAN onder vermelding van het factuurnummer. Dank voor de prettige samenwerking!',
  currency: 'EUR',
  colorTheme: '#7c3aed',
};

export const defaultInvoiceLines: InvoiceLine[] = [
  {
    id: 'line-1',
    description: 'VB eenmalig',
    quantity: 1,
    price: 150.00,
    vatRate: 21,
    billingType: 'eenmalig',
  },
  {
    id: 'line-2',
    description: 'VB maandelijks',
    quantity: 1,
    price: 49.95,
    vatRate: 21,
    billingType: 'abonnement',
  },
];

export const defaultProducts: Product[] = [
  {
    id: 'prod-v2',
    description: 'VB eenmalig',
    price: 150.00,
    vatRate: 21,
    billingType: 'eenmalig',
  },
  {
    id: 'prod-v1',
    description: 'VB maandelijks',
    price: 49.95,
    vatRate: 21,
    billingType: 'abonnement',
  }
];

