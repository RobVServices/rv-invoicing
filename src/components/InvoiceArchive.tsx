import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Edit2, 
  Copy, 
  FileText, 
  TrendingUp, 
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Bell,
  Mail,
  X,
  Check
} from 'lucide-react';
import { SavedInvoice } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface InvoiceArchiveProps {
  savedInvoices: SavedInvoice[];
  onLoadInvoice: (invoice: SavedInvoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateInvoiceStatus: (id: string, status: 'open' | 'geweigerd' | 'betaald') => void;
  onSwitchToGenerator: () => void;
}

export default function InvoiceArchive({
  savedInvoices,
  onLoadInvoice,
  onDeleteInvoice,
  onUpdateInvoiceStatus,
  onSwitchToGenerator,
}: InvoiceArchiveProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'number-desc'>('date-desc');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // --- REMINDER STATES ---
  const [selectedReminder, setSelectedReminder] = useState<SavedInvoice | null>(null);
  const [reminderToEmail, setReminderToEmail] = useState('');
  const [reminderCcEmail, setReminderCcEmail] = useState('');
  const [reminderBccEmail, setReminderBccEmail] = useState('');
  const [reminderSubject, setReminderSubject] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderCopied, setReminderCopied] = useState(false);

  useEffect(() => {
    if (selectedReminder) {
      const client = selectedReminder.clientDetails;
      const company = selectedReminder.companyDetails;
      const invNum = selectedReminder.invoiceNumber;
      const formattedTotal = formatCurrency(selectedReminder.total);
      const formattedDueDate = formatDate(selectedReminder.dueDate);
      const formattedInvoiceDate = formatDate(selectedReminder.invoiceDate);
      
      setReminderToEmail(client.email || '');
      setReminderCcEmail(client.ccEmail || '');
      setReminderBccEmail(client.bccEmail || '');
      setReminderSubject(`Betalingsherinnering: factuur ${invNum} - ${company.name}`);
      
      const body = `Beste ${client.name || 'Klant'},\n\nUit onze administratie is gebleken dat de betaling van factuur ${invNum} (factuurdatum: ${formattedInvoiceDate}) met een bedrag van ${formattedTotal} nog niet is ontvangen. De vervaldatum hiervan was ${formattedDueDate}.\n\nWij verzoeken u vriendelijk om het openstaande bedrag binnen 7 dagen over te maken naar IBAN ${company.iban} ten name van ${company.name}, onder vermelding van het factuurnummer ${invNum}.\n\nIndien u de betaling inmiddels heeft voldaan, kunt u deze herinnering als niet verzonden beschouwen.\n\nMet vriendelijke groet,\n\n${company.name}\n${company.email || ''}`;
      
      setReminderMessage(body);
      setReminderCopied(false);
    }
  }, [selectedReminder]);

  const handleCopyReminder = () => {
    navigator.clipboard.writeText(reminderMessage);
    setReminderCopied(true);
    setTimeout(() => setReminderCopied(false), 2000);
  };

  const handleSendReminderMailto = () => {
    const encodedSubject = encodeURIComponent(reminderSubject);
    const encodedBody = encodeURIComponent(reminderMessage);
    
    let mailtoParams = `subject=${encodedSubject}&body=${encodedBody}`;
    if (reminderCcEmail.trim()) mailtoParams += `&cc=${encodeURIComponent(reminderCcEmail.trim())}`;
    if (reminderBccEmail.trim()) mailtoParams += `&bcc=${encodeURIComponent(reminderBccEmail.trim())}`;
    
    const mailtoUrl = `mailto:${reminderToEmail}?${mailtoParams}`;
    window.open(mailtoUrl, '_blank');
    setSelectedReminder(null);
  };

  // --- STATS CALCULATIONS ---
  const stats = useMemo(() => {
    let totalInvoiced = 0;
    let totalSubtotal = 0;
    let totalVat = 0;
    let totalPaid = 0;
    let totalOpen = 0;
    
    savedInvoices.forEach(inv => {
      totalInvoiced += inv.total;
      totalSubtotal += inv.subtotal;
      totalVat += inv.totalVat;
      
      const status = inv.status || 'open';
      if (status === 'betaald') {
        totalPaid += inv.total;
      } else if (status === 'open') {
        totalOpen += inv.total;
      }
    });

    return {
      totalInvoiced,
      totalSubtotal,
      totalVat,
      totalPaid,
      totalOpen,
      invoiceCount: savedInvoices.length,
    };
  }, [savedInvoices]);

  // --- UNIQUE CLIENTS FOR FILTER ---
  const uniqueClients = useMemo(() => {
    const clients = new Set<string>();
    savedInvoices.forEach(inv => {
      if (inv.clientName) clients.add(inv.clientName);
    });
    return Array.from(clients);
  }, [savedInvoices]);

  // --- FILTER & SORT INVOICES ---
  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...savedInvoices];

    // Search query filter
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.clientName.toLowerCase().includes(query) ||
        inv.companyDetails.name.toLowerCase().includes(query) ||
        (inv.lines && inv.lines.some(l => l.description.toLowerCase().includes(query)))
      );
    }

    // Client filter
    if (filterClient !== 'all') {
      result = result.filter(inv => inv.clientName === filterClient);
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(inv => (inv.status || 'open') === filterStatus);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
      }
      if (sortBy === 'amount-desc') {
        return b.total - a.total;
      }
      if (sortBy === 'number-desc') {
        return b.invoiceNumber.localeCompare(a.invoiceNumber);
      }
      return 0;
    });

    return result;
  }, [savedInvoices, searchTerm, sortBy, filterClient, filterStatus]);

  // --- OVERDUE INVOICES ---
  const overdueInvoices = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return savedInvoices.filter(inv => {
      if ((inv.status || 'open') !== 'open') return false;
      
      const dueDate = new Date(inv.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });
  }, [savedInvoices]);

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Overdue Notification Banner */}
      {overdueInvoices.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-fadeIn">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-800">
              Actie vereist: {overdueInvoices.length} {overdueInvoices.length === 1 ? 'vervallen factuur' : 'vervallen facturen'}
            </h3>
            <p className="text-xs text-red-600 mt-0.5">
              Er {overdueInvoices.length === 1 ? 'is 1 factuur' : `zijn ${overdueInvoices.length} facturen`} waarvan de betalingstermijn is verstreken. Stuur een betalingsherinnering.
            </p>
          </div>
          <button 
            onClick={() => setFilterStatus('open')}
            className="text-xs font-bold bg-white dark:bg-slate-900 text-red-600 hover:bg-red-50 px-4 py-2 border border-red-200 rounded-lg transition-all shadow-sm"
          >
            Bekijk
          </button>
        </div>
      )}

      {/* Overview Cards / Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fadeIn">
        {/* Totaal Gefactureerd */}
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-violet-500/10 text-violet-600 rounded-lg sm:rounded-xl shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider line-clamp-1">Totaal Gefactureerd</p>
            <p className="text-sm sm:text-lg lg:text-xl font-display font-black text-slate-800 dark:text-slate-200 font-mono mt-0.5">
              {formatCurrency(stats.totalInvoiced)}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-light mt-0.5 line-clamp-1">
              Excl. btw: {formatCurrency(stats.totalSubtotal)}
            </p>
          </div>
        </div>

        {/* Totaal Betaald */}
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-emerald-500/10 text-emerald-600 rounded-lg sm:rounded-xl shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider line-clamp-1">Totaal Betaald</p>
            <p className="text-sm sm:text-lg lg:text-xl font-display font-black text-emerald-600 font-mono mt-0.5">
              {formatCurrency(stats.totalPaid)}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-light mt-0.5 line-clamp-1">
              Ontvangen betalingen
            </p>
          </div>
        </div>

        {/* Totaal Openstaand */}
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-amber-500/10 text-amber-600 rounded-lg sm:rounded-xl shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider line-clamp-1">Totaal Openstaand</p>
            <p className="text-sm sm:text-lg lg:text-xl font-display font-black text-amber-600 font-mono mt-0.5">
              {formatCurrency(stats.totalOpen)}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-light mt-0.5 line-clamp-1">
              Wachtend op betaling
            </p>
          </div>
        </div>

        {/* Aantal Facturen */}
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-blue-500/10 text-blue-600 rounded-lg sm:rounded-xl shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider line-clamp-1">Aantal Facturen</p>
            <p className="text-sm sm:text-lg lg:text-xl font-display font-black text-slate-800 dark:text-slate-200 font-mono mt-0.5">
              {stats.invoiceCount}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-light mt-0.5 line-clamp-1">
              Opgeslagen in uw browser
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row gap-3 items-center justify-between">
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Zoeken op nr, klant, dienst..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-violet-500/75 focus:bg-white dark:bg-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 text-slate-700 dark:text-slate-300"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Client Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Klant:</span>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-violet-500 transition-all font-medium cursor-pointer"
            >
              <option value="all">Alle klanten ({uniqueClients.length})</option>
              {uniqueClients.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-violet-500 transition-all font-medium cursor-pointer"
            >
              <option value="all">Alle statussen</option>
              <option value="open">Openstaand</option>
              <option value="betaald">Betaald</option>
              <option value="geweigerd">Geweigerd</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Sorteer:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-violet-500 transition-all font-medium cursor-pointer"
            >
              <option value="date-desc">Datum (Nieuw-Oud)</option>
              <option value="date-asc">Datum (Oud-Nieuw)</option>
              <option value="amount-desc">Bedrag (Hoog-Laag)</option>
              <option value="number-desc">Factuurnummer</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterClient('all');
              setFilterStatus('all');
              setSortBy('date-desc');
            }}
            className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl transition-all text-slate-500 hover:text-slate-700 dark:text-slate-300 ml-auto xl:ml-0"
            title="Filters herstellen"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table / Grid View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredAndSortedInvoices.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4 animate-fadeIn">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 text-slate-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-800 dark:text-slate-200">Geen facturen gevonden</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {savedInvoices.length === 0 
                  ? 'U heeft nog geen facturen opgeslagen. Ga naar de Generator om uw eerste professionele factuur te maken!'
                  : 'Geen resultaten die voldoen aan uw zoekopdracht of geselecteerde filters.'}
              </p>
            </div>
            <button
              onClick={onSwitchToGenerator}
              className="bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-1"
            >
              Maak Nieuwe Factuur
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/75 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 w-28">Factuurnummer</th>
                  <th className="py-4 px-4 w-32">Factuurdatum</th>
                  <th className="py-4 px-4">Klant</th>
                  <th className="py-4 px-4">Omschrijving (Eerste regel)</th>
                  <th className="py-4 px-4 text-right w-24">Subtotaal</th>
                  <th className="py-4 px-4 text-right w-24">Btw</th>
                  <th className="py-4 px-4 text-right w-28">Totaal (Incl. btw)</th>
                  <th className="py-4 px-4 text-center w-36">Status</th>
                  <th className="py-4 px-6 text-center w-36 no-print">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredAndSortedInvoices.map((inv) => {
                  const currentStatus = inv.status || 'open';
                  const isOverdue = currentStatus === 'open' && (() => {
                    const d = new Date(inv.dueDate);
                    d.setHours(0,0,0,0);
                    const t = new Date();
                    t.setHours(0,0,0,0);
                    return d < t;
                  })();

                  return (
                    <tr key={inv.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950/50 group transition-colors ${isOverdue ? 'bg-red-50/30' : ''}`}>
                      <td className="py-4 px-6 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        <div>{formatDate(inv.invoiceDate)}</div>
                        <div className={`text-[9px] mt-0.5 ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                          Vervalt: {formatDate(inv.dueDate)}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        {inv.clientName}
                      </td>
                      <td className="py-4 px-4 text-slate-500 max-w-xs truncate">
                        {inv.lines?.[0]?.description || <span className="italic text-slate-400">Geen beschrijving</span>}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                        {formatCurrency(inv.subtotal)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-500">
                        {formatCurrency(inv.totalVat)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-black text-slate-950 text-sm">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="relative inline-block text-left">
                          <select
                            value={currentStatus}
                            onChange={(e) => onUpdateInvoiceStatus(inv.id, e.target.value as any)}
                            className={`appearance-none font-sans font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border cursor-pointer pr-7 outline-none transition-all shadow-sm focus:ring-2 focus:ring-violet-500/20 ${
                              currentStatus === 'betaald'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                                : currentStatus === 'geweigerd'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                            }`}
                          >
                            <option value="open">⏳ Openstaand</option>
                            <option value="betaald">✅ Betaald</option>
                            <option value="geweigerd">❌ Geweigerd</option>
                          </select>
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[8px]">▼</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          {currentStatus === 'open' && (
                            <button
                              onClick={() => setSelectedReminder(inv)}
                              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all cursor-pointer animate-pulse"
                              title="Betalingsherinnering genereren"
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onLoadInvoice(inv)}
                            className="p-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg transition-all"
                            title="Factuur openen &amp; bewerken"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              onLoadInvoice({
                                ...inv,
                                id: 'draft',
                                invoiceNumber: '[Nieuw Concept]',
                              });
                            }}
                            className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-lg transition-all"
                            title="Dupliceren als nieuw sjabloon"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                            title="Factuur verwijderen uit historie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Betalingsherinnering Modal */}
      {selectedReminder && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl animate-bounce">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Concept Betalingsherinnering</h3>
                  <p className="text-xs text-slate-500">Stuur een vriendelijke herinnering voor factuur {selectedReminder.invoiceNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReminder(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:text-slate-300 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-600 dark:text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Klantnaam</label>
                  <div className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 font-medium select-all">
                    {selectedReminder.clientName}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ontvanger E-mail</label>
                  <input 
                    type="email"
                    value={reminderToEmail}
                    onChange={(e) => setReminderToEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:bg-white dark:bg-slate-900 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 outline-none transition-all font-medium"
                    placeholder="E-mailadres van de klant"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CC (Optioneel)</label>
                  <input 
                    type="email"
                    value={reminderCcEmail}
                    onChange={(e) => setReminderCcEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:bg-white dark:bg-slate-900 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 outline-none transition-all font-medium"
                    placeholder="CC e-mailadres"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">BCC (Optioneel)</label>
                  <input 
                    type="email"
                    value={reminderBccEmail}
                    onChange={(e) => setReminderBccEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:bg-white dark:bg-slate-900 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 outline-none transition-all font-medium"
                    placeholder="BCC e-mailadres"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Onderwerp</label>
                <input 
                  type="text"
                  value={reminderSubject}
                  onChange={(e) => setReminderSubject(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:bg-white dark:bg-slate-900 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 outline-none transition-all font-medium"
                  placeholder="E-mail onderwerp"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bericht</label>
                <textarea 
                  rows={10}
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:bg-white dark:bg-slate-900 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 outline-none transition-all resize-none font-sans leading-relaxed"
                  placeholder="Schrijf hier de herinnering..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
              <button
                onClick={() => setSelectedReminder(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Annuleren
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReminder}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {reminderCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Gekopieerd!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Bericht Kopiëren</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleSendReminderMailto}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/10 font-display animate-fadeIn"
                >
                  <Mail className="w-4 h-4" />
                  E-mail Openen
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
