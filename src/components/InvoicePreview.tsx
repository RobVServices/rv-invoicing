import React from 'react';
import { Plus, Trash2, Edit2, Sparkles, Building2, User, Save, Mail } from 'lucide-react';
import { CompanyDetails, ClientDetails, InvoiceSettings, InvoiceLine } from '../types';
import { formatCurrency, formatDate, generateInvoiceNumber } from '../utils';

interface InvoicePreviewProps {
  company: CompanyDetails;
  client: ClientDetails;
  settings: InvoiceSettings;
  lines: InvoiceLine[];
  onAddLine: () => void;
  onRemoveLine: (id: string) => void;
  onUpdateLine: (id: string, field: keyof InvoiceLine, value: any) => void;
  onPrint: () => void;
  onExportExcel: () => void;
  onSendEmail: () => void;
}

export default function InvoicePreview({
  company,
  client,
  settings,
  lines,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
  onPrint,
  onExportExcel,
  onSendEmail,
}: InvoicePreviewProps) {
  const [showSaveOptions, setShowSaveOptions] = React.useState(false);

  const activeColor = settings.colorTheme || '#7c3aed';

  // Calculate line items total
  const totals = React.useMemo(() => {
    let subtotal = 0;
    
    // Group tax calculations to fulfill official Dutch requirements
    const vatGroups: { [key: number]: { base: number; vat: number } } = {
      21: { base: 0, vat: 0 },
      9: { base: 0, vat: 0 },
      0: { base: 0, vat: 0 },
    };

    lines.forEach(line => {
      const lineTotal = line.quantity * line.price;
      subtotal += lineTotal;

      const rate = line.vatRate;
      if (vatGroups[rate] === undefined) {
        vatGroups[rate] = { base: 0, vat: 0 };
      }
      vatGroups[rate].base += lineTotal;
      vatGroups[rate].vat += lineTotal * (rate / 100);
    });

    const totalVat = Object.values(vatGroups).reduce((acc, curr) => acc + curr.vat, 0);
    const total = subtotal + totalVat;

    return {
      subtotal,
      vatGroups,
      totalVat,
      total,
    };
  }, [lines]);

  const invoiceNum = generateInvoiceNumber(settings.prefix, settings.nextNumber);

  const subscriptionLines = React.useMemo(() => {
    return lines.filter(line => line.billingType === 'abonnement');
  }, [lines]);

  const oneTimeLines = React.useMemo(() => {
    return lines.filter(line => line.billingType !== 'abonnement');
  }, [lines]);

  const subscriptionSubtotal = React.useMemo(() => {
    return subscriptionLines.reduce((acc, line) => acc + (line.quantity * line.price), 0);
  }, [subscriptionLines]);

  const oneTimeSubtotal = React.useMemo(() => {
    return oneTimeLines.reduce((acc, line) => acc + (line.quantity * line.price), 0);
  }, [oneTimeLines]);

  return (
    <div className="flex-1 flex flex-col items-center gap-4">
      {/* Main A4 sheet */}
      <div 
        id="invoice-print-area"
        className="print-page w-full max-w-[210mm] min-h-0 sm:min-h-[297mm] bg-white text-slate-800 shadow-xl border border-slate-200 p-5 sm:p-10 md:p-16 print:p-8 rounded-2xl print:rounded-none print:shadow-none print:border-0 flex flex-col justify-between transition-all font-sans relative overflow-hidden"
      >
        {/* Accent strip on top - excluded in actual print if clean look is desired, but let's make it styled dynamically */}
        <div className="absolute top-0 left-0 right-0 h-1.5 no-print" style={{ backgroundColor: activeColor }} />

        {/* TOP SECTION: Logo, Company info, Title */}
        <div className="space-y-6 sm:space-y-10 print:space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
            {/* Left side: Invoice title, dates */}
            <div className="space-y-4 sm:space-y-6 w-full md:w-auto">
              <div>
                <h1 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 tracking-tight">FACTUUR</h1>
              </div>

              <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Factuurnummer</p>
                  <p className="font-semibold text-slate-800 font-mono">{invoiceNum || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Factuurdatum</p>
                  <p className="font-semibold text-slate-800">{formatDate(settings.invoiceDate) || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Vervaldatum</p>
                  <p className="font-semibold text-slate-800 font-medium" style={{ color: activeColor }}>{formatDate(settings.dueDate) || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Referentie</p>
                  <p className="font-semibold text-slate-800 font-mono">Factuur {invoiceNum || '-'}</p>
                </div>
              </div>
            </div>

            {/* Right side: Company logo only (no text details here, prevents duplication) */}
            <div className="text-left md:text-right flex flex-col items-start md:items-end shrink-0 w-full md:w-auto max-w-sm">
              {company.logoUrl ? (
                <div className="h-14 mb-2 flex items-center justify-start md:justify-end">
                  <img src={company.logoUrl} alt={company.name} className="max-h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="h-14 mb-2 flex items-center gap-2 justify-start md:justify-end text-slate-400 no-print">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="text-[10px] italic">Geen logo</span>
                </div>
              )}
            </div>
          </div>

          {/* SENDER & CLIENT ADDRESSES (Side-by-side, compact) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-8 border-t border-b border-slate-100 py-4 print:py-3 text-xs leading-relaxed">
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1.5">GEFACTUREERD DOOR</p>
              <div className="text-slate-800 space-y-0.5">
                <p className="font-bold text-slate-900 text-sm">{company.name || 'Uw Bedrijfsnaam'}</p>
                <p className="text-slate-600">{company.address || 'Straat + Huisnummer'}</p>
                <p className="text-slate-600">{company.zipCity || 'Postcode + Plaats'}</p>
                {company.email && <p className="text-slate-500 text-[11px]">{company.email}</p>}
                
                <div className="pt-2 mt-2 border-t border-dashed border-slate-100/60 space-y-0.5 text-[11px] text-slate-500">
                  {company.kvk && <p className="font-mono">KVK: {company.kvk}</p>}
                  {company.btwId && <p className="font-mono">Btw-id: {company.btwId}</p>}
                  {company.iban && <p className="font-mono font-medium text-slate-700">IBAN: {company.iban}</p>}
                </div>
              </div>
            </div>

            <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100/70 print:bg-slate-50/30 print:p-3">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1.5">GEFACTUREERD AAN</p>
              <div className="text-slate-800 space-y-0.5">
                <p className="font-bold text-slate-900 text-sm">{client.name || 'Bedrijfsnaam klant'}</p>
                <p className="text-slate-600">{client.address || 'Straat + Huisnummer'}</p>
                <p className="text-slate-600">{client.zipCity || 'Postcode + Plaats'}</p>
                {client.email && <p className="font-semibold text-xs mt-1.5" style={{ color: activeColor }}>{client.email}</p>}
              </div>
            </div>
          </div>

          {/* TABLE OF INVOICE LINES */}
          <div className="space-y-4">
            {/* Desktop & PDF Print Table layout */}
            <div className="hidden md:block print:block overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 pr-4">Omschrijving</th>
                    <th className="py-3 px-2 text-center w-16">Aantal</th>
                    <th className="py-3 px-2 text-right w-24">Prijs (€)</th>
                    <th className="py-3 px-2 text-right w-20">Btw-tarief</th>
                    <th className="py-3 px-2 text-center w-28">Type kosten</th>
                    <th className="py-3 pl-2 text-right w-28">Subtotaal (€)</th>
                    <th className="py-3 w-10 text-center no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Subscription section */}
                  {subscriptionLines.length > 0 && (
                    <>
                      <tr className="bg-sky-50/40 print:bg-slate-50 font-bold border-t border-b border-slate-200">
                        <td colSpan={7} className="py-2 px-3 text-[10px] text-sky-800 uppercase tracking-wider font-extrabold">
                          🔄 Maandelijks
                        </td>
                      </tr>
                      {subscriptionLines.map((line) => {
                        const lineSubtotal = line.quantity * line.price;
                        return (
                          <tr key={line.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 pr-4">
                              <input
                                type="text"
                                value={line.description}
                                onChange={(e) => onUpdateLine(line.id, 'description', e.target.value)}
                                placeholder="Dienst of geleverd product..."
                                className="w-full bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-slate-300 border-0 rounded px-1.5 py-1 text-slate-800 font-medium outline-none transition-all placeholder:italic placeholder:text-slate-400 text-xs"
                              />
                            </td>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={line.quantity}
                                onChange={(e) => onUpdateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full text-center bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-slate-300 border-0 rounded px-1.5 py-1 font-mono outline-none transition-all text-xs"
                              />
                            </td>
                            <td className="py-3 px-2 text-right">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={line.price}
                                onChange={(e) => onUpdateLine(line.id, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full text-right bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-slate-300 border-0 rounded px-1.5 py-1 font-mono outline-none transition-all text-xs"
                              />
                            </td>
                            <td className="py-3 px-2 text-right">
                              <select
                                value={line.vatRate}
                                onChange={(e) => onUpdateLine(line.id, 'vatRate', parseInt(e.target.value, 10))}
                                className="print:hidden bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-slate-300 border-0 rounded px-1 py-1 font-sans text-right outline-none transition-all text-xs cursor-pointer appearance-none"
                              >
                                <option value="21">21%</option>
                                <option value="9">9%</option>
                                <option value="0">0%</option>
                              </select>
                              <span className="hidden print:inline-block font-sans text-xs text-right pr-1 w-full">{line.vatRate}%</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <select
                                value={line.billingType || 'eenmalig'}
                                onChange={(e) => onUpdateLine(line.id, 'billingType', e.target.value)}
                                className="print:hidden bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-slate-300 border-0 rounded px-1.5 py-1 font-sans text-center outline-none transition-all text-xs cursor-pointer text-slate-700"
                              >
                                <option value="eenmalig">eenmalig</option>
                                <option value="abonnement">maandelijks</option>
                              </select>
                              <span className="hidden print:inline-block font-sans text-xs text-center text-slate-700 w-full">
                                {line.billingType === 'abonnement' ? 'maandelijks' : 'eenmalig'}
                              </span>
                            </td>
                            <td className="py-3 pl-2 text-right font-semibold text-slate-900 font-mono">
                              {formatCurrency(lineSubtotal)}
                            </td>
                            <td className="py-3 w-10 text-center no-print">
                              <button
                                onClick={() => onRemoveLine(line.id)}
                                disabled={lines.length <= 1}
                                className={`p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all ${
                                  lines.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                title="Verwijder deze regel"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50/20 text-slate-500 text-[10px] font-semibold border-b border-slate-150/65">
                        <td colSpan={5} className="py-2 px-3 text-right">Subtotaal Maandelijks:</td>
                        <td className="py-2 pl-2 text-right font-bold text-slate-700 font-mono">{formatCurrency(subscriptionSubtotal)}</td>
                        <td className="no-print"></td>
                      </tr>
                    </>
                  )}

                  {/* One-time section */}
                  {oneTimeLines.length > 0 && (
                    <>
                      <tr className="bg-indigo-50/40 print:bg-slate-50 font-bold border-t border-b border-slate-200">
                        <td colSpan={7} className="py-2 px-3 text-[10px] text-indigo-800 uppercase tracking-wider font-extrabold">
                          📦 Eenmalig
                        </td>
                      </tr>
                      {oneTimeLines.map((line) => {
                        const lineSubtotal = line.quantity * line.price;
                        return (
                          <tr key={line.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 pr-4">
                              <input
                                type="text"
                                value={line.description}
                                onChange={(e) => onUpdateLine(line.id, 'description', e.target.value)}
                                placeholder="Dienst of geleverd product..."
                                className="w-full bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-slate-300 border-0 rounded px-1.5 py-1 text-slate-800 font-medium outline-none transition-all placeholder:italic placeholder:text-slate-400 text-xs"
                              />
                            </td>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={line.quantity}
                                onChange={(e) => onUpdateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full text-center bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-slate-300 border-0 rounded px-1.5 py-1 font-mono outline-none transition-all text-xs"
                              />
                            </td>
                            <td className="py-3 px-2 text-right">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={line.price}
                                onChange={(e) => onUpdateLine(line.id, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full text-right bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-slate-300 border-0 rounded px-1.5 py-1 font-mono outline-none transition-all text-xs"
                              />
                            </td>
                            <td className="py-3 px-2 text-right">
                              <select
                                value={line.vatRate}
                                onChange={(e) => onUpdateLine(line.id, 'vatRate', parseInt(e.target.value, 10))}
                                className="print:hidden bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-slate-300 border-0 rounded px-1 py-1 font-sans text-right outline-none transition-all text-xs cursor-pointer appearance-none"
                              >
                                <option value="21">21%</option>
                                <option value="9">9%</option>
                                <option value="0">0%</option>
                              </select>
                              <span className="hidden print:inline-block font-sans text-xs text-right pr-1 w-full">{line.vatRate}%</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <select
                                value={line.billingType || 'eenmalig'}
                                onChange={(e) => onUpdateLine(line.id, 'billingType', e.target.value)}
                                className="print:hidden bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-slate-300 border-0 rounded px-1.5 py-1 font-sans text-center outline-none transition-all text-xs cursor-pointer text-slate-700"
                              >
                                <option value="eenmalig">eenmalig</option>
                                <option value="abonnement">maandelijks</option>
                              </select>
                              <span className="hidden print:inline-block font-sans text-xs text-center text-slate-700 w-full">
                                {line.billingType === 'abonnement' ? 'maandelijks' : 'eenmalig'}
                              </span>
                            </td>
                            <td className="py-3 pl-2 text-right font-semibold text-slate-900 font-mono">
                              {formatCurrency(lineSubtotal)}
                            </td>
                            <td className="py-3 w-10 text-center no-print">
                              <button
                                onClick={() => onRemoveLine(line.id)}
                                disabled={lines.length <= 1}
                                className={`p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all ${
                                  lines.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                title="Verwijder deze regel"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50/20 text-slate-500 text-[10px] font-semibold border-b border-slate-150/65">
                        <td colSpan={5} className="py-2 px-3 text-right">Subtotaal Eenmalig:</td>
                        <td className="py-2 pl-2 text-right font-bold text-slate-700 font-mono">{formatCurrency(oneTimeSubtotal)}</td>
                        <td className="no-print"></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch-Friendly Card View (Hidden during print) */}
            <div className="md:hidden print:hidden space-y-6">
              {subscriptionLines.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-sky-800 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                    🔄 Maandelijks ({subscriptionLines.length})
                  </h3>
                  {subscriptionLines.map((line) => {
                    const lineSubtotal = line.quantity * line.price;
                    return (
                      <div 
                        key={line.id} 
                        className="p-4 bg-sky-50/20 border border-sky-100 rounded-xl space-y-3 relative shadow-sm hover:bg-sky-50/35 transition-all duration-200"
                      >
                        {/* Description */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Omschrijving</label>
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) => onUpdateLine(line.id, 'description', e.target.value)}
                            placeholder="Dienst of geleverd product..."
                            className="w-full bg-white border border-slate-200 focus:ring-1 focus:ring-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium outline-none transition-all placeholder:italic placeholder:text-slate-400 text-xs"
                          />
                        </div>
                        
                        {/* Quantity & Price */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Aantal</label>
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={line.quantity}
                              onChange={(e) => onUpdateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-200 focus:ring-1 focus:ring-slate-300 rounded-lg px-2.5 py-1.5 font-mono outline-none transition-all text-xs text-center"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block mb-1">Prijs (€)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.price}
                              onChange={(e) => onUpdateLine(line.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-200 focus:ring-1 focus:ring-slate-300 rounded-lg px-2.5 py-1.5 font-mono outline-none transition-all text-xs text-right"
                            />
                          </div>
                        </div>

                        {/* VAT, Type, & Subtotal Row */}
                        <div className="grid grid-cols-3 gap-2 items-end pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block mb-1">Btw</label>
                            <select
                              value={line.vatRate}
                              onChange={(e) => onUpdateLine(line.id, 'vatRate', parseInt(e.target.value, 10))}
                              className="w-full bg-white border border-slate-200 focus:ring-1 focus:ring-slate-300 rounded-lg px-2 py-1.5 font-sans outline-none transition-all text-xs cursor-pointer"
                            >
                              <option value="21">21%</option>
                              <option value="9">9%</option>
                              <option value="0">0%</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block mb-1">Type</label>
                            <select
                              value={line.billingType || 'eenmalig'}
                              onChange={(e) => onUpdateLine(line.id, 'billingType', e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:ring-1 focus:ring-slate-300 rounded-lg px-2 py-1.5 font-sans outline-none transition-all text-xs cursor-pointer"
                            >
                              <option value="eenmalig">Eenmalig</option>
                              <option value="abonnement">Abonnement</option>
                            </select>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Subtotaal</span>
                            <span className="font-semibold text-slate-900 font-mono text-xs block py-1.5">
                              {formatCurrency(lineSubtotal)}
                            </span>
                          </div>
                        </div>

                        {/* Delete row */}
                        {lines.length > 1 && (
                          <button
                            onClick={() => onRemoveLine(line.id)}
                            className="absolute top-2 right-2 p-1.5 bg-white border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer shadow-sm"
                            title="Verwijder deze regel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {oneTimeLines.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-indigo-800 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                    📦 Eenmalig ({oneTimeLines.length})
                  </h3>
                  {oneTimeLines.map((line) => {
                    const lineSubtotal = line.quantity * line.price;
                    return (
                      <div 
                        key={line.id} 
                        className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-xl space-y-3 relative shadow-sm hover:bg-indigo-50/35 transition-all duration-200"
                      >
                        {/* Description */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Omschrijving</label>
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) => onUpdateLine(line.id, 'description', e.target.value)}
                            placeholder="Dienst of geleverd product..."
                            className="w-full bg-white border border-slate-200 focus:ring-1 focus:ring-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium outline-none transition-all placeholder:italic placeholder:text-slate-400 text-xs"
                          />
                        </div>
                        
                        {/* Quantity & Price */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Aantal</label>
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={line.quantity}
                              onChange={(e) => onUpdateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-200 focus:ring-1 focus:ring-slate-300 rounded-lg px-2.5 py-1.5 font-mono outline-none transition-all text-xs text-center"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block mb-1">Prijs (€)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.price}
                              onChange={(e) => onUpdateLine(line.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-200 focus:ring-1 focus:ring-slate-300 rounded-lg px-2.5 py-1.5 font-mono outline-none transition-all text-xs text-right"
                            />
                          </div>
                        </div>

                        {/* VAT, Type, & Subtotal Row */}
                        <div className="grid grid-cols-3 gap-2 items-end pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block mb-1">Btw</label>
                            <select
                              value={line.vatRate}
                              onChange={(e) => onUpdateLine(line.id, 'vatRate', parseInt(e.target.value, 10))}
                              className="w-full bg-white border border-slate-200 focus:ring-1 focus:ring-slate-300 rounded-lg px-2 py-1.5 font-sans outline-none transition-all text-xs cursor-pointer"
                            >
                              <option value="21">21%</option>
                              <option value="9">9%</option>
                              <option value="0">0%</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block mb-1">Type</label>
                            <select
                              value={line.billingType || 'eenmalig'}
                              onChange={(e) => onUpdateLine(line.id, 'billingType', e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:ring-1 focus:ring-slate-300 rounded-lg px-2 py-1.5 font-sans outline-none transition-all text-xs cursor-pointer"
                            >
                              <option value="eenmalig">Eenmalig</option>
                              <option value="abonnement">Abonnement</option>
                            </select>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Subtotaal</span>
                            <span className="font-semibold text-slate-900 font-mono text-xs block py-1.5">
                              {formatCurrency(lineSubtotal)}
                            </span>
                          </div>
                        </div>

                        {/* Delete row */}
                        {lines.length > 1 && (
                          <button
                            onClick={() => onRemoveLine(line.id)}
                            className="absolute top-2 right-2 p-1.5 bg-white border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer shadow-sm"
                            title="Verwijder deze regel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Line Action */}
            <button
              onClick={onAddLine}
              style={{
                color: activeColor,
                borderColor: `${activeColor}30`,
                backgroundColor: `${activeColor}10`
              }}
              className="no-print mt-2 flex items-center gap-1.5 text-xs font-bold border px-3 py-2 rounded-xl transition-all cursor-pointer hover:brightness-95"
            >
              <Plus className="w-4 h-4" />
              Regel toevoegen
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION: Notes, VAT detail, totals, signature and legally required metadata */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-100 space-y-6 sm:space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8">
            {/* Notes & payment conditions */}
            <div className="flex-1 text-xs text-slate-500 leading-relaxed max-w-md w-full">
              <p className="font-bold text-slate-700 mb-1">Betalingsinstructies:</p>
              <p className="whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100/60 text-slate-600 font-light italic">
                {settings.notes ? settings.notes.replace('IBAN', company.iban || '[IBAN]') : 'Geen aanvullende opmerkingen.'}
              </p>
            </div>

            {/* Calculated Totals and VAT Breakdown */}
            <div className="w-full md:w-80 space-y-3 text-xs text-slate-600">
              {subscriptionSubtotal > 0 && (
                <div className="flex justify-between text-slate-500 font-light text-[11px]">
                  <span>Subtotaal Maandelijks</span>
                  <span className="font-semibold font-mono">{formatCurrency(subscriptionSubtotal)}</span>
                </div>
              )}
              {oneTimeSubtotal > 0 && (
                <div className="flex justify-between text-slate-500 font-light text-[11px]">
                  <span>Subtotaal Eenmalig</span>
                  <span className="font-semibold font-mono">{formatCurrency(oneTimeSubtotal)}</span>
                </div>
              )}
              <div className="flex justify-between pb-1.5 border-b border-slate-100 font-light">
                <span>Subtotaal (excl. btw)</span>
                <span className="font-semibold text-slate-800 font-mono">{formatCurrency(totals.subtotal)}</span>
              </div>

              {/* VAT Breakdown per rate - highly professional & legally compliant */}
              <div className="space-y-1 pb-1.5 border-b border-slate-100 text-[11px] text-slate-500 font-light">
                {Object.entries(totals.vatGroups).map(([rate, value]) => {
                  const data = value as { base: number; vat: number };
                  if (data.base === 0) return null;
                  return (
                    <div key={rate} className="flex justify-between">
                      <span>{rate}% btw over {formatCurrency(data.base)}</span>
                      <span className="font-mono">{formatCurrency(data.vat)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total VAT */}
              <div className="flex justify-between pb-2 border-b border-slate-100 font-light">
                <span>Totale btw</span>
                <span className="font-semibold text-slate-800 font-mono">{formatCurrency(totals.totalVat)}</span>
              </div>

              {/* Total including VAT */}
              <div className="flex justify-between items-center text-slate-900 pt-1.5">
                <span className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-800">TOTAAL TE BETALEN</span>
                <span className="font-display font-black text-xl font-mono" style={{ color: activeColor }}>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>

          {/* Legal Footer Info */}
          <div className="text-[10px] text-slate-400 font-light text-center border-t border-slate-100 pt-6 space-y-1">
            <p className="font-semibold text-slate-500">{company.name || 'Mijn Bedrijf'} • KVK: {company.kvk || '[KVK-nummer]'} • Btw-id: {company.btwId || '[Btw-identificatienummer]'}</p>
            <p>RV Invoices</p>
          </div>
        </div>
      </div>

      {/* Action panel under preview */}
      <div className="w-full max-w-[210mm] no-print space-y-4">
        {!showSaveOptions ? (
          <div className="flex gap-4">
            <button
              onClick={() => setShowSaveOptions(true)}
              style={{ 
                color: activeColor,
                borderColor: `${activeColor}30`,
                backgroundColor: `${activeColor}10`
              }}
              className="flex-1 border font-display font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:brightness-110 active:scale-98"
            >
              <Save className="w-4 h-4" />
              Opslaan
            </button>
            
            <button
              onClick={onSendEmail}
              style={{ backgroundColor: activeColor }}
              className="flex-1 text-white font-display font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer hover:brightness-110 active:scale-98"
            >
              <Mail className="w-4 h-4" />
              Factuur Verzenden
            </button>
          </div>
        ) : (
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm animate-fadeIn max-w-sm mx-auto space-y-3">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider text-center">Kies bestandsformaat</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onPrint();
                  setShowSaveOptions(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg font-bold text-sm transition-all cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                PDF
              </button>
              <button
                onClick={() => {
                  onExportExcel();
                  setShowSaveOptions(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg font-bold text-sm transition-all cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                Excel
              </button>
            </div>
            <button
              onClick={() => setShowSaveOptions(false)}
              className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 transition-all pt-1 font-semibold"
            >
              Annuleren
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
