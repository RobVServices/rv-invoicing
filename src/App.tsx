import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  Building2, 
  Users, 
  Settings as SettingsIcon, 
  Trash2, 
  RotateCcw, 
  FileText, 
  Check, 
  ChevronRight,
  Sparkles,
  Info,
  Archive,
  PlusCircle,
  Moon,
  Sun,
  ExternalLink
} from 'lucide-react';
import { CompanyDetails, ClientDetails, InvoiceSettings, InvoiceLine, SavedInvoice, Product } from './types';
import { 
  defaultCompany, 
  defaultClient,
  defaultClients, 
  defaultSettings, 
  defaultInvoiceLines,
  generateInvoiceNumber,
  defaultProducts
} from './utils';
import Sidebar from './components/Sidebar';
import InvoicePreview from './components/InvoicePreview';
import InvoiceArchive from './components/InvoiceArchive';
import SendInvoiceModal from './components/SendInvoiceModal';
import InstallModal from './components/InstallModal';
import Logo from './components/Logo';

export default function App() {
  // --- STATE INITIALIZATION ---
  const [activeView, setActiveView] = useState<'generator' | 'archive'>('generator');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const [company, setCompany] = useState<CompanyDetails>(() => {
    const saved = localStorage.getItem('zzp_company');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (parsed.name === 'Voorbeeld B.V.' || parsed.name === 'Jansen Marketing B.V.' || parsed.name === 'RV Services Invoicing' || parsed.name === 'RV Invoices') {
            return defaultCompany;
          }
          if (parsed.logoUrl === '/regenerated_image_1784377447777.png' || parsed.logoUrl === '/regenerated_image_1784377447777.png?v=3' || parsed.logoUrl === '/logo-pwa.png') {
            parsed.logoUrl = '/regenerated_image_1784377448417.png';
          }
          return parsed;
        }
        return defaultCompany;
      } catch (e) {
        return defaultCompany;
      }
    }
    return defaultCompany;
  });

  const [client, setClient] = useState<ClientDetails>(() => {
    const saved = localStorage.getItem('zzp_client');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (parsed.name === 'Jansen Marketing B.V.' || parsed.name === 'Bakker & Zonen') {
            return defaultClient;
          }
          return parsed;
        }
        return defaultClient;
      } catch (e) {
        return defaultClient;
      }
    }
    return defaultClient;
  });

  const [savedClients, setSavedClients] = useState<ClientDetails[]>(() => {
    const saved = localStorage.getItem('zzp_saved_clients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.some((c: any) => c && (c.name === 'Jansen Marketing B.V.' || c.name === 'Bakker & Zonen'))) {
            return defaultClients;
          }
          return parsed;
        }
        return defaultClients;
      } catch (e) {
        return defaultClients;
      }
    }
    return defaultClients;
  });

  const [settings, setSettings] = useState<InvoiceSettings>(() => {
    const saved = localStorage.getItem('zzp_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed && typeof parsed === 'object' ? parsed : defaultSettings;
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [lines, setLines] = useState<InvoiceLine[]>(() => {
    const saved = localStorage.getItem('zzp_lines');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.some((l: any) => l && l.description === 'Ontwikkeling van maatwerk WordPress website (Fase 1)')) {
            return defaultInvoiceLines;
          }
          return parsed;
        }
        return defaultInvoiceLines;
      } catch (e) {
        return defaultInvoiceLines;
      }
    }
    return defaultInvoiceLines;
  });

  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>(() => {
    const saved = localStorage.getItem('zzp_saved_invoices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [savedProducts, setSavedProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('zzp_saved_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.some((p: any) => p && (p.description === 'Voorbeeld 1' || p.description === 'Consultancy / Adviesgesprek (per uur)'))) {
            return defaultProducts;
          }
          return parsed;
        }
        return defaultProducts;
      } catch (e) {
        return defaultProducts;
      }
    }
    return defaultProducts;
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('Bedankt voor het installeren van RV Invoices!');
    }
    setDeferredPrompt(null);
  };

  // --- LOCALSTORAGE PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('zzp_company', JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    localStorage.setItem('zzp_client', JSON.stringify(client));
  }, [client]);

  useEffect(() => {
    localStorage.setItem('zzp_saved_clients', JSON.stringify(savedClients));
  }, [savedClients]);

  useEffect(() => {
    localStorage.setItem('zzp_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('zzp_lines', JSON.stringify(lines));
  }, [lines]);

  useEffect(() => {
    localStorage.setItem('zzp_saved_invoices', JSON.stringify(savedInvoices));
  }, [savedInvoices]);

  useEffect(() => {
    localStorage.setItem('zzp_saved_products', JSON.stringify(savedProducts));
  }, [savedProducts]);

  // --- HELPER HANDLERS ---
  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSaveClient = () => {
    if (!client.name || !client.address || !client.zipCity || !client.email) {
      showToast("Vul alle verplichte klantgegevens in (inclusief e-mail) om op te slaan.");
      return;
    }
    if (!client.name.trim()) return;
    
    // Check if client with same name already exists to prevent duplicates
    const exists = savedClients.find(c => c.name.toLowerCase() === client.name.toLowerCase());
    if (exists) {
      setSavedClients(prev => prev.map(c => c.name.toLowerCase() === client.name.toLowerCase() ? { ...client, id: c.id } : c));
      showToast(`Klant "${client.name}" is bijgewerkt.`);
    } else {
      const newClient = { ...client, id: 'client-' + Date.now() };
      setSavedClients(prev => [...prev, newClient]);
      showToast(`Klant "${client.name}" is opgeslagen.`);
    }
  };

  const handleSelectClient = (selectedClient: ClientDetails) => {
    setClient(selectedClient);
    showToast(`Klantgegevens geladen voor "${selectedClient.name}"`);
  };

  const handleDeleteSavedClient = (id: string) => {
    const target = savedClients.find(c => c.id === id);
    setSavedClients(prev => prev.filter(c => c.id !== id));
    if (target) {
      showToast(`Klant "${target.name}" is verwijderd.`);
    }
  };



  const handleSelectProduct = (product: Product) => {
    setLines(prev => {
      const lastLine = prev[prev.length - 1];
      // If there is only one line and it is blank, overwrite it.
      if (prev.length === 1 && !lastLine.description && lastLine.price === 0) {
        return [{
          id: lastLine.id,
          description: product.description,
          quantity: 1,
          price: product.price,
          vatRate: product.vatRate,
          billingType: product.billingType || 'eenmalig'
        }];
      } else {
        // Otherwise, append.
        return [
          ...prev,
          {
            id: 'line-' + Date.now() + Math.floor(Math.random() * 1000),
            description: product.description,
            quantity: 1,
            price: product.price,
            vatRate: product.vatRate,
            billingType: product.billingType || 'eenmalig'
          }
        ];
      }
    });
    showToast(`"${product.description}" toegevoegd aan de factuur.`);
  };

  const handleSaveProduct = (product: Product) => {
    setSavedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? product : p);
      } else {
        return [...prev, product];
      }
    });
    showToast(`Product "${product.description}" opgeslagen.`);
  };

  const handleDeleteProduct = (id: string) => {
    const target = savedProducts.find(p => p.id === id);
    setSavedProducts(prev => prev.filter(p => p.id !== id));
    if (target) {
      showToast(`Product "${target.description}" is verwijderd.`);
    }
  };

  const handleLoadDefaults = () => {
    if (window.confirm('Weet u zeker dat u de voorbeeldgegevens wilt herstellen? Uw huidige invoer zal worden overschreven.')) {
      setCompany(defaultCompany);
      setClient(defaultClient);
      setSettings(defaultSettings);
      setLines(defaultInvoiceLines);
      setSavedProducts(defaultProducts);
      showToast('Voorbeeldgegevens succesvol hersteld.');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Weet u zeker dat u alle velden wilt wissen om een lege factuur te starten?')) {
      setCompany({
        name: '',
        address: '',
        zipCity: '',
        kvk: '',
        btwId: '',
        iban: '',
        logoUrl: '',
      });
      setClient({
        id: 'client-empty',
        name: '',
        address: '',
        zipCity: '',
        email: '',
      });
      setSettings({
        prefix: 'F-',
        nextNumber: 1,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        paymentTermDays: 14,
        paymentTermType: '14',
        notes: 'Wij verzoeken u vriendelijk dit bedrag binnen 14 dagen over te maken o.v.v. het factuurnummer. Dank voor de samenwerking!',
        currency: 'EUR',
        colorTheme: '#7c3aed',
      });
      setLines([
        {
          id: 'line-new-1',
          description: '',
          quantity: 1,
          price: 0,
          vatRate: 21,
        }
      ]);
      showToast('Alle velden zijn leeggemaakt.');
    }
  };

  const handleSaveInvoice = () => {
    let subtotal = 0;
    let totalVat = 0;
    lines.forEach(line => {
      const lineTotal = line.quantity * line.price;
      subtotal += lineTotal;
      totalVat += lineTotal * (line.vatRate / 100);
    });
    const total = subtotal + totalVat;
    const invNumber = generateInvoiceNumber(settings.prefix, settings.nextNumber);

    const newInvoice: SavedInvoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invNumber,
      invoiceDate: settings.invoiceDate,
      dueDate: settings.dueDate,
      clientName: client.name || 'Naamloze Klant',
      clientDetails: { ...client },
      companyDetails: { ...company },
      settings: { ...settings },
      lines: [...lines],
      subtotal,
      totalVat,
      total,
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    const existsIndex = savedInvoices.findIndex(inv => inv.invoiceNumber === invNumber);
    if (existsIndex > -1) {
      if (window.confirm(`Factuurnummer "${invNumber}" bestaat al in de historie. Wilt u deze overschrijven met de huidige gegevens?`)) {
        setSavedInvoices(prev => prev.map((inv, idx) => idx === existsIndex ? { ...newInvoice, id: inv.id, status: inv.status || 'open' } : inv));
        showToast(`Factuur ${invNumber} is succesvol bijgewerkt!`);
      }
    } else {
      setSavedInvoices(prev => [newInvoice, ...prev]);
      showToast(`Factuur ${invNumber} is opgeslagen in uw historie!`);
    }
  };

  const handleUpdateInvoiceStatus = (id: string, status: 'open' | 'geweigerd' | 'betaald') => {
    setSavedInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    showToast(`Status van factuur bijgewerkt naar: ${
      status === 'open' ? 'Openstaand' : status === 'betaald' ? 'Betaald' : 'Geweigerd'
    }`);
  };

  const handleLoadInvoice = (loadedInvoice: SavedInvoice) => {
    setCompany(loadedInvoice.companyDetails);
    setClient(loadedInvoice.clientDetails);
    setLines(loadedInvoice.lines);
    setActiveView('generator');

    if (loadedInvoice.id === 'draft') {
      setSettings(prev => ({
        ...prev,
        notes: loadedInvoice.settings.notes,
        prefix: loadedInvoice.settings.prefix,
        // Calculate new dates
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: (() => {
          const date = new Date();
          date.setDate(date.getDate() + prev.paymentTermDays);
          return date.toISOString().split('T')[0];
        })(),
      }));
      showToast('Kopie/sjabloon succesvol geladen als nieuw concept!');
    } else {
      setSettings(loadedInvoice.settings);
      showToast(`Factuur ${loadedInvoice.invoiceNumber} geladen!`);
    }
  };

  const handleAutoSaveOnSend = () => {
    if (!validateInvoice()) return;
    let subtotal = 0;
    let totalVat = 0;
    lines.forEach(line => {
      const lineTotal = line.quantity * line.price;
      subtotal += lineTotal;
      totalVat += lineTotal * (line.vatRate / 100);
    });
    const total = subtotal + totalVat;
    const invNumber = generateInvoiceNumber(settings.prefix, settings.nextNumber);

    const autoSaved: SavedInvoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invNumber,
      invoiceDate: settings.invoiceDate,
      dueDate: settings.dueDate,
      clientName: client.name || 'Naamloze Klant',
      clientDetails: { ...client },
      companyDetails: { ...company },
      settings: { ...settings },
      lines: [...lines],
      subtotal,
      totalVat,
      total,
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    setSavedInvoices(prev => {
      const existsIndex = prev.findIndex(inv => inv.invoiceNumber === invNumber);
      if (existsIndex > -1) {
        const existingInvoice = prev[existsIndex];
        return prev.map((inv, idx) => idx === existsIndex ? { ...autoSaved, id: inv.id, status: existingInvoice.status || 'open' } : inv);
      }
      return [autoSaved, ...prev];
    });

    // Automatically increment the next invoice number
    setSettings(prev => ({
      ...prev,
      nextNumber: prev.nextNumber + 1
    }));

    showToast(`Factuur ${invNumber} succesvol verzonden & opgeslagen! Het volgende factuurnummer is automatisch opgehoogd.`);
  };

  const handleDeleteInvoice = (id: string) => {
    const target = savedInvoices.find(inv => inv.id === id);
    if (target && window.confirm(`Weet u zeker dat u factuur "${target.invoiceNumber}" wilt verwijderen uit uw historie?`)) {
      setSavedInvoices(prev => prev.filter(inv => inv.id !== id));
      showToast(`Factuur ${target.invoiceNumber} is verwijderd.`);
    }
  };


  const validateInvoice = () => {
    if (!company.name || !company.address || !company.zipCity || !company.kvk || !company.btwId || !company.iban || !company.email) {
      showToast('Vul alle verplichte bedrijfsgegevens in (inclusief e-mail).');
      return false;
    }
    if (!client.name || !client.address || !client.zipCity || !client.email) {
      showToast('Vul alle verplichte klantgegevens in (inclusief e-mail).');
      return false;
    }
    if (lines.length === 0 || (lines.length === 1 && !lines[0].description)) {
      showToast('Voeg minimaal één product of dienst toe.');
      return false;
    }
    return true;
  };

  const handlePrint = () => {
    if (!validateInvoice()) return;
    // Auto-save to history on print so they never lose it
    let subtotal = 0;
    let totalVat = 0;
    lines.forEach(line => {
      const lineTotal = line.quantity * line.price;
      subtotal += lineTotal;
      totalVat += lineTotal * (line.vatRate / 100);
    });
    const total = subtotal + totalVat;
    const invNumber = generateInvoiceNumber(settings.prefix, settings.nextNumber);

    const autoSaved: SavedInvoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invNumber,
      invoiceDate: settings.invoiceDate,
      dueDate: settings.dueDate,
      clientName: client.name || 'Naamloze Klant',
      clientDetails: { ...client },
      companyDetails: { ...company },
      settings: { ...settings },
      lines: [...lines],
      subtotal,
      totalVat,
      total,
      createdAt: new Date().toISOString(),
    };

    setSavedInvoices(prev => {
      const exists = prev.some(inv => inv.invoiceNumber === invNumber);
      if (exists) {
        return prev.map(inv => inv.invoiceNumber === invNumber ? { ...autoSaved, id: inv.id } : inv);
      }
      return [autoSaved, ...prev];
    });

    const originalTitle = document.title;
    document.title = invNumber;
    window.print();
    document.title = originalTitle;
    
    setTimeout(() => {
      showToast(`Factuur ${invNumber} automatisch opgeslagen in historie.`);
      if (window.confirm('Is de factuur succesvol afgedrukt/opgeslagen? Klik op OK om het volgende factuurnummer alvast op te hogen.')) {
        setSettings(prev => ({
          ...prev,
          nextNumber: prev.nextNumber + 1
        }));
        showToast('Volgende factuurnummer verhoogd!');
      }
    }, 1500);
  };

  const handleExportExcel = () => {
    if (!validateInvoice()) return;
    let subtotal = 0;
    let totalVat = 0;
    lines.forEach(line => {
      const lineTotal = line.quantity * line.price;
      subtotal += lineTotal;
      totalVat += lineTotal * (line.vatRate / 100);
    });
    const total = subtotal + totalVat;
    const invNumber = generateInvoiceNumber(settings.prefix, settings.nextNumber);

    // Auto-save to history on export
    const autoSaved: SavedInvoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invNumber,
      invoiceDate: settings.invoiceDate,
      dueDate: settings.dueDate,
      clientName: client.name || 'Naamloze Klant',
      clientDetails: { ...client },
      companyDetails: { ...company },
      settings: { ...settings },
      lines: [...lines],
      subtotal,
      totalVat,
      total,
      createdAt: new Date().toISOString(),
    };

    setSavedInvoices(prev => {
      const exists = prev.some(inv => inv.invoiceNumber === invNumber);
      if (exists) {
        return prev.map(inv => inv.invoiceNumber === invNumber ? { ...autoSaved, id: inv.id } : inv);
      }
      return [autoSaved, ...prev];
    });

    const rows = [
      ["FACTUUR EXPORT", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["VAN (ZENDER):", "", "", "", "VOOR (ONTVANGER):", "", ""],
      [company.name, "", "", "", client.name || "Naamloze Klant", "", ""],
      [company.street + " " + company.houseNumber + (company.houseNumberAddition ? " " + company.houseNumberAddition : ""), "", "", "", client.street + " " + client.houseNumber + (client.houseNumberAddition ? " " + client.houseNumberAddition : ""), "", ""],
      [company.postalCode + " " + company.city, "", "", "", client.postalCode + " " + client.city, "", ""],
      ["KVK: " + company.kvkNumber, "", "", "", "Contact: " + (client.contactPerson || "-"), "", ""],
      ["BTW: " + company.vatNumber, "", "", "", "E-mail: " + (client.email || "-"), "", ""],
      ["IBAN: " + company.iban, "", "", "", "", "", ""],
      ["BIC: " + company.bic, "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["DETAILS:", "", "", "", "", "", ""],
      ["Factuurnummer:", invNumber, "", "", "", "", ""],
      ["Factuurdatum:", settings.invoiceDate, "", "", "", "", ""],
      ["Vervaldatum:", settings.dueDate, "", "", "", "", ""],
      ["Betalingstermijn:", settings.paymentTermDays + " dagen", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["OMSCHRIJVING", "AANTAL", "PRIJS PER EENHEID", "BTW%", "SUBTOTAAL (EXCL. BTW)", "BTW BEDRAG", "TOTAAL (INCL. BTW)"],
    ];

    lines.forEach(line => {
      const lineSub = line.quantity * line.price;
      const lineVat = lineSub * (line.vatRate / 100);
      const lineTot = lineSub + lineVat;
      rows.push([
        line.description || "Geen omschrijving",
        line.quantity,
        line.price,
        line.vatRate + "%",
        lineSub,
        lineVat,
        lineTot
      ]);
    });

    rows.push(["", "", "", "", "", "", ""]);
    rows.push(["", "", "", "", "Subtotaal (Excl. BTW):", subtotal, ""]);
    rows.push(["", "", "", "", "BTW Totaal:", totalVat, ""]);
    rows.push(["", "", "", "", "Totaal (Incl. BTW):", total, ""]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Auto-adjust column widths for better visual layout
    const maxCols = rows.reduce((max, r) => Math.max(max, r.length), 0);
    const colWidths = [];
    for (let i = 0; i < maxCols; i++) {
      let maxLen = 10;
      rows.forEach(r => {
        const cellVal = r[i];
        if (cellVal !== undefined && cellVal !== null) {
          const valStr = String(cellVal);
          if (valStr.length > maxLen) {
            maxLen = valStr.length;
          }
        }
      });
      colWidths.push({ wch: maxLen + 2 });
    }
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Factuur");
    
    XLSX.writeFile(wb, `Factuur_${invNumber}.xlsx`);

    showToast(`Factuur ${invNumber} succesvol geëxporteerd naar Excel.`);

    setTimeout(() => {
      showToast(`Factuur ${invNumber} automatisch opgeslagen in historie.`);
      if (window.confirm('Is de Excel factuur succesvol opgeslagen? Klik op OK om het volgende factuurnummer alvast op te hogen.')) {
        setSettings(prev => ({
          ...prev,
          nextNumber: prev.nextNumber + 1
        }));
        showToast('Volgende factuurnummer verhoogd!');
      }
    }, 1500);
  };

  // --- INVOICE LINE OPERATIONS ---
  const handleAddLine = () => {
    const newLineId = 'line-' + Date.now();
    setLines(prev => [
      ...prev,
      {
        id: newLineId,
        description: '',
        quantity: 1,
        price: 0,
        vatRate: 21,
      }
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter(line => line.id !== id));
  };

  const handleUpdateLine = (id: string, field: keyof InvoiceLine, value: any) => {
    setLines(prev => prev.map(line => line.id === id ? { ...line, [field]: value } : line));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 p-4 md:p-8 selection:bg-violet-100 dark:selection:bg-violet-900/50 selection:text-violet-900 dark:selection:text-violet-100 transition-colors">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white border border-slate-800 py-3 px-5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold"
          >
            <div className="p-1 bg-violet-500/10 text-violet-400 rounded-lg">
              <Check className="w-4 h-4" />
            </div>
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <header className="no-print bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 md:px-6 md:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl p-1 shadow-md flex items-center justify-center overflow-hidden shrink-0">
              <Logo className="w-9 h-9" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                RV Invoices
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Snel en gemakkelijk facturen</p>
            </div>
          </div>

          {/* Navigation Switches */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800/80">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-lg transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 mr-1"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setActiveView('generator')}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all cursor-pointer ${
                activeView === 'generator'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Nieuwe Factuur
            </button>
            <button
              onClick={() => setActiveView('archive')}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all relative cursor-pointer ${
                activeView === 'archive'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Archive className="w-4 h-4" />
              Facturen Archief
              {savedInvoices.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-violet-500 text-slate-950 font-extrabold text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-slate-900 animate-pulse">
                  {savedInvoices.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* View switching */}
        {activeView === 'generator' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar panels */}
            <Sidebar 
              company={company}
              setCompany={setCompany}
              client={client}
              setClient={setClient}
              savedClients={savedClients}
              onSaveClient={handleSaveClient}
              onSelectClient={handleSelectClient}
              onDeleteSavedClient={handleDeleteSavedClient}
              savedProducts={savedProducts}
              onSelectProduct={handleSelectProduct}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              settings={settings}
              setSettings={setSettings}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
            />

            {/* Invoice Preview */}
            <InvoicePreview 
              company={company}
              client={client}
              settings={settings}
              lines={lines}
              onAddLine={handleAddLine}
              onRemoveLine={handleRemoveLine}
              onUpdateLine={handleUpdateLine}
              onPrint={handlePrint}
              onExportExcel={handleExportExcel}
              onSendEmail={() => setIsSendModalOpen(true)}
            />
          </div>
        )}

        {activeView === 'archive' && (
          <InvoiceArchive 
            savedInvoices={savedInvoices}
            onLoadInvoice={handleLoadInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onSwitchToGenerator={() => setActiveView('generator')}
          />
        )}
      </div>

      {/* Send Invoice Email Dialog */}
      <SendInvoiceModal 
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        company={company}
        client={client}
        settings={settings}
        lines={lines}
        onSuccess={(msg) => showToast(msg)}
        onAutoSave={handleAutoSaveOnSend}
      />

      {/* Install App Dialog */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstall={handleInstallApp}
        settings={settings}
      />
    </div>
  );
}
