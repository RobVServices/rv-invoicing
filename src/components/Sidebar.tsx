import React, { useRef } from 'react';
import { 
  ChevronDown,
  RefreshCw,
  Building2, 
  User, 
  Settings as SettingsIcon, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Plus, 
  FileText, 
  Save, 
  UserPlus,
  HelpCircle,
  Hash,
  History,
  Copy,
  ExternalLink,
  Mail,
  Download,
  Package,
  Pencil
} from 'lucide-react';
import { CompanyDetails, ClientDetails, InvoiceSettings, SavedInvoice, Product } from '../types';
import { formatCurrency, defaultCompany } from '../utils';
import { AddressFetcher } from './AddressFetcher';

const colorPresets = [
  { name: 'Koninklijk Paars', value: '#7c3aed' },
  { name: 'Smaragdgroen', value: '#059669' },
  { name: 'Oceaanblauw', value: '#2563eb' },
  { name: 'Klassiek Indigo', value: '#4f46e5' },
  { name: 'Crimson Rood', value: '#e11d48' },
  { name: 'Gezellig Amber', value: '#d97706' },
  { name: 'Houtskool Grijs', value: '#475569' },
];

interface SidebarProps {
  company: CompanyDetails;
  setCompany: React.Dispatch<React.SetStateAction<CompanyDetails>>;
  client: ClientDetails;
  setClient: React.Dispatch<React.SetStateAction<ClientDetails>>;
  savedClients: ClientDetails[];
  onSaveClient: () => void;
  onSelectClient: (client: ClientDetails) => void;
  onDeleteSavedClient: (id: string) => void;
  savedProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  settings: InvoiceSettings;
  setSettings: React.Dispatch<React.SetStateAction<InvoiceSettings>>;
  onOpenInstallModal: () => void;
}

export default function Sidebar({
  company,
  setCompany,
  client,
  setClient,
  savedClients,
  onSaveClient,
  onSelectClient,
  onDeleteSavedClient,
  savedProducts,
  onSelectProduct,
  onSaveProduct,
  onDeleteProduct,
  settings,
  setSettings,
  onOpenInstallModal,
}: SidebarProps) {
  const [activeTab, setActiveTab] = React.useState<'company' | 'client' | 'products' | 'settings' | null>(null);
  const toggleTab = (tab: 'company' | 'client' | 'products' | 'settings') => {
    setActiveTab(prev => prev === tab ? null : tab);
  };
  const [showSaveOptions, setShowSaveOptions] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProdDesc, setNewProdDesc] = React.useState('');
  const [newProdPrice, setNewProdPrice] = React.useState('');
  const [newProdVat, setNewProdVat] = React.useState<number>(21);
  const [newProdBillingType, setNewProdBillingType] = React.useState<'eenmalig' | 'abonnement'>('eenmalig');
  const [editingProdId, setEditingProdId] = React.useState<string | null>(null);

  const handleCompanyChange = (field: keyof CompanyDetails, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (field: keyof ClientDetails, value: string) => {
    setClient(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (field: keyof InvoiceSettings, value: any) => {
    setSettings(prev => {
      const updated = { ...prev, [field]: value };
      
      // If we change invoice date or payment term, recalculate due date
      if (field === 'invoiceDate' || field === 'paymentTermType' || field === 'paymentTermDays') {
        const invDate = new Date(field === 'invoiceDate' ? value : prev.invoiceDate);
        let days = prev.paymentTermDays;
        
        if (field === 'paymentTermType') {
          if (value !== 'custom') {
            days = parseInt(value, 10);
            updated.paymentTermDays = days;
          }
        } else if (field === 'paymentTermDays') {
          days = parseInt(value, 10) || 0;
        }

        const dueDate = new Date(invDate);
        dueDate.setDate(dueDate.getDate() + days);
        updated.dueDate = dueDate.toISOString().split('T')[0];
      }
      return updated;
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleCompanyChange('logoUrl', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    handleCompanyChange('logoUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddOrUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdDesc.trim()) return;
    const priceNum = parseFloat(newProdPrice.replace(',', '.')) || 0;
    const productData: Product = {
      id: editingProdId || 'prod-' + Date.now(),
      description: newProdDesc,
      price: priceNum,
      vatRate: newProdVat,
      billingType: newProdBillingType
    };
    onSaveProduct(productData);
    // Reset form
    setNewProdDesc('');
    setNewProdPrice('');
    setNewProdVat(21);
    setNewProdBillingType('eenmalig');
    setEditingProdId(null);
  };

  const handleEditProductClick = (p: Product) => {
    setNewProdDesc(p.description);
    setNewProdPrice(p.price.toString());
    setNewProdVat(p.vatRate);
    setNewProdBillingType(p.billingType || 'eenmalig');
    setEditingProdId(p.id);
  };

  const handleCancelEdit = () => {
    setNewProdDesc('');
    setNewProdPrice('');
    setNewProdVat(21);
    setNewProdBillingType('eenmalig');
    setEditingProdId(null);
  };

  return (
    <div id="sidebar-panel" className="w-full lg:w-96 flex flex-col gap-5 no-print bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar">
      {/* Accordion Container */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar pb-4">
        {/* TAB 1: COMPANY DETAILS */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleTab('company')}
            className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-white dark:bg-slate-900 focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold text-[13px] text-slate-800 dark:text-slate-200 uppercase tracking-wider">Bedrijf</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${activeTab === 'company' ? 'rotate-180' : ''}`} />
          </button>
          
          {activeTab === 'company' && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Logo</label>
              <div className="flex items-center gap-3">
                {company.logoUrl ? (
                  <div className="relative group w-16 h-16 bg-white rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1 overflow-hidden">
                    <img src={company.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    <button 
                      onClick={removeLogo}
                      className="absolute inset-0 bg-red-600/80 text-slate-900 dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold rounded-lg"
                    >
                      Verwijder
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-500 rounded-lg flex flex-col items-center justify-center transition-all group"
                  >
                    <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:text-slate-200" />
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">Upload</span>
                  </button>
                )}
                <div className="flex-1">
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Bedrijfslogo</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Max 2MB (PNG, JPG). Wordt lokaal opgeslagen.</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

             <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Bedrijfsnaam <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={company.name} 
                  onChange={(e) => handleCompanyChange('name', e.target.value)}
                  placeholder="Bijv. Bedrijfsnaam"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <AddressFetcher 
                onAddressFound={(address, zipCity) => {
                  handleCompanyChange('address', address);
                  handleCompanyChange('zipCity', zipCity);
                }} 
              />
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Adres (Straat + Huisnummer) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={company.address} 
                  onChange={(e) => handleCompanyChange('address', e.target.value)}
                  placeholder="Bijv. Straatnaam 123"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Postcode + Plaats <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={company.zipCity} 
                  onChange={(e) => handleCompanyChange('zipCity', e.target.value)}
                  placeholder="Bijv. 1234 AB Plaats"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">KVK-nummer <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    maxLength={8}
                    value={company.kvk} 
                    onChange={(e) => handleCompanyChange('kvk', e.target.value.replace(/\D/g, ''))}
                    placeholder="8 cijfers"
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Btw-id <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={company.btwId} 
                    onChange={(e) => handleCompanyChange('btwId', e.target.value.toUpperCase())}
                    placeholder="NL000000000B01"
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">IBAN rekeningnummer <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={company.iban} 
                  onChange={(e) => handleCompanyChange('iban', e.target.value.toUpperCase())}
                  placeholder="NL91 ABNA 0123 4567 89"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">E-mailadres Bedrijf (Afzender) <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  value={company.email || ''} 
                  onChange={(e) => handleCompanyChange('email', e.target.value)}
                  placeholder="Bijv. e-mailadres@domein.nl"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Factuurnummering</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Prefix (bijv. 2026-)</label>
                    <input 
                      type="text" 
                      value={settings.prefix} 
                      onChange={(e) => handleSettingsChange('prefix', e.target.value)}
                      placeholder="Bijv. F-"
                      className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Volgend nummer</label>
                    <input 
                      type="number" 
                      min={1}
                      value={settings.nextNumber} 
                      onChange={(e) => handleSettingsChange('nextNumber', parseInt(e.target.value, 10) || 1)}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>

        {/* TAB 2: CLIENT DETAILS */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleTab('client')}
            className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-white dark:bg-slate-900 focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold text-[13px] text-slate-800 dark:text-slate-200 uppercase tracking-wider">Klant</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${activeTab === 'client' ? 'rotate-180' : ''}`} />
          </button>
          
          {activeTab === 'client' && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-4 animate-fadeIn">
            {/* Quick Select Client Template */}
            {savedClients.length > 0 && (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Opgeslagen Klanten</span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                  {savedClients.map(c => (
                    <div key={c.id} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-xs text-slate-900 dark:text-white pl-2 pr-1 py-1 rounded-lg transition-all">
                      <button 
                        onClick={() => onSelectClient(c)}
                        className="font-medium text-left truncate max-w-[120px]"
                        title={c.name}
                      >
                        {c.name}
                      </button>
                      <button 
                        onClick={() => onDeleteSavedClient(c.id)}
                        className="text-slate-500 dark:text-slate-400 hover:text-red-400 p-0.5"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

             <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Bedrijfsnaam klant <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={client.name} 
                  onChange={(e) => handleClientChange('name', e.target.value)}
                  placeholder="Bijv. Bedrijfsnaam"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <AddressFetcher 
                onAddressFound={(address, zipCity) => {
                  handleClientChange('address', address);
                  handleClientChange('zipCity', zipCity);
                }} 
              />
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Adres (Straat + Huisnummer) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={client.address} 
                  onChange={(e) => handleClientChange('address', e.target.value)}
                  placeholder="Bijv. Straatnaam 123"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Postcode + Plaats <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={client.zipCity} 
                  onChange={(e) => handleClientChange('zipCity', e.target.value)}
                  placeholder="Bijv. 1234 AB Plaats"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">E-mailadres klant <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  value={client.email || ''} 
                  onChange={(e) => handleClientChange('email', e.target.value)}
                  placeholder="Bijv. e-mailadres@domein.nl"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">CC E-mail (optioneel)</label>
                <input 
                  type="email" 
                  value={client.ccEmail || ''} 
                  onChange={(e) => handleClientChange('ccEmail', e.target.value)}
                  placeholder="CC e-mailadres"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">BCC E-mail (optioneel)</label>
                <input 
                  type="email" 
                  value={client.bccEmail || ''} 
                  onChange={(e) => handleClientChange('bccEmail', e.target.value)}
                  placeholder="BCC e-mailadres"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              {client.name && (
                <button
                  type="button"
                  onClick={onSaveClient}
                  className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-slate-800 dark:text-slate-200 mt-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Klant opslaan in sjablonen
                </button>
              )}
            </div>
            </div>
          )}
        </div>

        {/* TAB: PRODUCTS */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleTab('products')}
            className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-white dark:bg-slate-900 focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold text-[13px] text-slate-800 dark:text-slate-200 uppercase tracking-wider">Producten</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${activeTab === 'products' ? 'rotate-180' : ''}`} />
          </button>
          
          {activeTab === 'products' && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-4 animate-fadeIn">
            {/* Product list */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Opgeslagen Producten ({savedProducts.length})
              </span>

              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 leading-normal">
                Tik of klik op een product om deze direct als regel aan uw factuur toe te voegen.
              </p>

              {savedProducts.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                  <Package className="w-7 h-7 text-slate-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Geen opgeslagen producten</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Gebruik het formulier hieronder om uw eerste standaardproduct aan te maken.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar pr-0.5 mb-4">
                  {savedProducts.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-600 transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.98]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold truncate group-hover:text-violet-400 transition-colors">
                          {p.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="inline-block text-[9px] font-bold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800/80">
                            {p.vatRate}% Btw
                          </span>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            (p.billingType || 'eenmalig') === 'abonnement' 
                              ? 'bg-sky-950/80 text-sky-400 border-sky-900/60' 
                              : 'bg-indigo-950/80 text-indigo-400 border-indigo-900/60'
                          }`}>
                            {(p.billingType || 'eenmalig') === 'abonnement' ? 'maandelijks' : 'eenmalig'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                          {formatCurrency(p.price)}
                        </span>
                        <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleEditProductClick(p)}
                            style={{ color: settings.colorTheme || '#7c3aed' }}
                            className="p-1 hover:bg-slate-100 dark:bg-slate-800 rounded transition-all"
                            title="Bewerken"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1 hover:bg-red-950 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded transition-all"
                            title="Verwijderen"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product form */}
            <form onSubmit={handleAddOrUpdateProduct} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                {editingProdId ? 'Product bewerken' : 'Product toevoegen'}
              </span>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Omschrijving</label>
                  <input 
                    type="text"
                    required
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Bijv. Product of dienst omschrijving"
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Prijs (excl. btw)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold">€</span>
                      <input 
                        type="text"
                        required
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value.replace(/[^0-9.,]/g, ''))}
                        placeholder="0,00"
                        className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-slate-300 dark:border-slate-700 rounded-lg pl-6 pr-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Btw-tarief</label>
                    <select
                      value={newProdVat}
                      onChange={(e) => setNewProdVat(parseInt(e.target.value, 10))}
                      className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="21">21% (Hoog)</option>
                      <option value="9">9% (Laag)</option>
                      <option value="0">0% (Geen / Vrij)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Type kosten</label>
                  <select
                    value={newProdBillingType}
                    onChange={(e) => setNewProdBillingType(e.target.value as any)}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white outline-none transition-all"
                  >
                    <option value="eenmalig">eenmalig</option>
                    <option value="abonnement">maandelijks</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    style={{ backgroundColor: settings.colorTheme || '#7c3aed' }}
                    className="flex-1 text-slate-900 dark:text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {editingProdId ? 'Wijzigingen opslaan' : 'Product opslaan'}
                  </button>
                  {editingProdId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 px-3 rounded-lg active:scale-95 transition-all"
                    >
                      Annuleer
                    </button>
                  )}
                </div>
              </div>
            </form>
            </div>
          )}
        </div>

        {/* TAB 3: INVOICE SETTINGS */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleTab('settings')}
            className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-white dark:bg-slate-900 focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <SettingsIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold text-[13px] text-slate-800 dark:text-slate-200 uppercase tracking-wider">Instellingen</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${activeTab === 'settings' ? 'rotate-180' : ''}`} />
          </button>
          
          {activeTab === 'settings' && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-4 animate-fadeIn">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Factuurdatum</label>
                <input 
                  type="date" 
                  value={settings.invoiceDate} 
                  onChange={(e) => handleSettingsChange('invoiceDate', e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Betalingstermijn</label>
                <select 
                  value={settings.paymentTermType} 
                  onChange={(e) => handleSettingsChange('paymentTermType', e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                >
                  <option value="7">7 dagen</option>
                  <option value="14">14 dagen</option>
                  <option value="30">30 dagen</option>
                  <option value="60">60 dagen</option>
                  <option value="custom">Aangepast...</option>
                </select>
              </div>

              {settings.paymentTermType === 'custom' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Aantal dagen</label>
                  <input 
                    type="number" 
                    min={0}
                    value={settings.paymentTermDays} 
                    onChange={(e) => handleSettingsChange('paymentTermDays', e.target.value)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vervaldatum (berekend)</label>
                  <span className="text-[11px] font-mono" style={{ color: settings.colorTheme || '#7c3aed' }}>{settings.dueDate}</span>
                </div>
              </div>

              {/* Brand color option */}
              <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Factuur Kleurenthema</label>
                <div className="flex flex-wrap items-center gap-2">
                  {colorPresets.map((preset) => {
                    const isSelected = (settings.colorTheme || '#7c3aed').toLowerCase() === preset.value.toLowerCase();
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleSettingsChange('colorTheme', preset.value)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all relative border border-slate-300 dark:border-slate-700 hover:scale-110 active:scale-95 cursor-pointer"
                        style={{ backgroundColor: preset.value }}
                        title={preset.name}
                      >
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-white shadow-md" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Betalingsvoorwaarden / Voettekst</label>
                <textarea 
                  rows={4}
                  value={settings.notes} 
                  onChange={(e) => handleSettingsChange('notes', e.target.value)}
                  placeholder="Vermeld betalingsinstructies, IBAN, of een vriendelijke groet..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all resize-none mb-3"
                />
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3">
                <button
                  type="button"
                  onClick={onOpenInstallModal}
                  className="w-full bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-display font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  App installeren
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
