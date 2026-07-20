import React, { useState, useEffect } from 'react';
import { Mail, X, Paperclip, ExternalLink, FileText, Download, Check } from 'lucide-react';
import { CompanyDetails, ClientDetails, InvoiceSettings, InvoiceLine } from '../types';
import { formatCurrency, generateInvoiceNumber } from '../utils';

interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyDetails;
  client: ClientDetails;
  settings: InvoiceSettings;
  lines: InvoiceLine[];
  onSuccess: (message: string) => void;
  onAutoSave?: () => void;
}

export default function SendInvoiceModal({
  isOpen,
  onClose,
  company,
  client,
  settings,
  lines,
  onSuccess,
  onAutoSave,
}: SendInvoiceModalProps) {
  const invoiceNum = generateInvoiceNumber(settings.prefix, settings.nextNumber);
  
  // State for form
  const [toEmail, setToEmail] = useState(client.email || '');
  const [ccEmail, setCcEmail] = useState(client.ccEmail || '');
  const [bccEmail, setBccEmail] = useState(client.bccEmail || '');
  const [subject, setSubject] = useState(`Factuur ${invoiceNum} - ${company.name}`);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [hasAutoSaved, setHasAutoSaved] = useState(false);

  // Totals for invoice message
  const totals = React.useMemo(() => {
    let subtotal = 0;
    let totalVat = 0;
    lines.forEach((line) => {
      const lineTotal = line.quantity * line.price;
      const lineVat = lineTotal * (line.vatRate / 100);
      subtotal += lineTotal;
      totalVat += lineVat;
    });
    return {
      subtotal,
      totalVat,
      total: subtotal + totalVat,
    };
  }, [lines]);

  // Set default message when invoice properties change
  useEffect(() => {
    setToEmail(client.email || '');
    setCcEmail(client.ccEmail || '');
    setBccEmail(client.bccEmail || '');
    setSubject(`Factuur ${invoiceNum} - ${company.name}`);
    
    const formattedTotal = formatCurrency(totals.total);
    const defaultBody = `Beste ${client.name || 'Klant'},\n\nHierbij ontvangt u factuur ${invoiceNum} voor onze recent geleverde diensten/producten.\n\nDetails:\n- Factuurnummer: ${invoiceNum}\n- Totaalbedrag: ${formattedTotal}\n- Vervaldatum: ${settings.dueDate}\n\nWij verzoeken u vriendelijk om het bedrag over te maken naar IBAN ${company.iban} ten name van ${company.name}, onder vermelding van het factuurnummer ${invoiceNum}.\n\nIn de bijlage vindt u de volledige specificatie als PDF.\n\nMet vriendelijke groet,\n\n${company.name}\n${company.email || ''}`;
    
    setMessage(defaultBody);
  }, [client, company, settings, lines, totals.total, invoiceNum]);

  // Reset status flags when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setIsDownloaded(false);
      setHasAutoSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Trigger PDF print/download dialog
  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    document.title = invoiceNum;
    window.print();
    document.title = originalTitle;
    setIsDownloaded(true);

    if (onAutoSave && !hasAutoSaved) {
      onAutoSave();
      setHasAutoSaved(true);
    }
  };

  // Generate mailto link and trigger it
  const handleMailto = () => {
    if (!toEmail.trim()) {
      setError('Vul a.u.b. een e-mailadres voor de ontvanger in.');
      return;
    }
    setError(null);
    
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(message);
    
    let mailtoParams = `subject=${encodedSubject}&body=${encodedBody}`;
    if (ccEmail.trim()) mailtoParams += `&cc=${encodeURIComponent(ccEmail.trim())}`;
    if (bccEmail.trim()) mailtoParams += `&bcc=${encodeURIComponent(bccEmail.trim())}`;
    
    const mailtoUrl = `mailto:${toEmail}?${mailtoParams}`;
    
    // Open in local mail client
    window.open(mailtoUrl, '_blank');
    
    if (onAutoSave && !hasAutoSaved) {
      onAutoSave();
      setHasAutoSaved(true);
    }
    
    onSuccess(`Uw e-mailprogramma is geopend! Vergeet niet de gedownloade PDF (${invoiceNum}.pdf) toe te voegen als bijlage.`);
    onClose();
  };

  const activeColor = settings.colorTheme || '#7c3aed';

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-850 rounded-lg text-slate-300">
              <Mail className="w-5 h-5" style={{ color: activeColor }} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Factuur Verzenden</h3>
              <p className="text-xs text-slate-400">Bereid uw e-mail voor en open deze direct in uw eigen e-mailprogramma</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-300">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/30 text-red-400 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Step visual indicator */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-850">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${!isDownloaded ? 'bg-slate-850 text-white font-bold' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${!isDownloaded ? 'bg-indigo-600 text-white font-black' : 'bg-green-950/40 text-green-400 border border-green-900/30'}`}>
                {isDownloaded ? <Check className="w-3 h-3" /> : '1'}
              </span>
              <span>1. Download PDF</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${isDownloaded ? 'bg-slate-850 text-white font-bold animate-pulse' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${isDownloaded ? 'bg-indigo-600 text-white font-black' : 'bg-slate-900 text-slate-500'}`}>
                2
              </span>
              <span>2. Open Mail</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender info (read-only info badge) */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Afzender (Uw details)</label>
              <div className="w-full text-xs bg-slate-950 border border-slate-800/60 rounded-lg px-3 py-2 text-slate-400 select-none">
                {company.name} ({company.email || 'Geen e-mail ingesteld'})
              </div>
            </div>

            {/* Recipient info */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ontvanger E-mail</label>
              <input 
                type="email"
                value={toEmail}
                onChange={(e) => {
                  setToEmail(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-lg px-3 py-2 text-white outline-none transition-all"
                placeholder="E-mailadres van de klant"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CC */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CC (Optioneel)</label>
              <input 
                type="email"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-lg px-3 py-2 text-white outline-none transition-all"
                placeholder="CC e-mailadres"
              />
            </div>

            {/* BCC */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">BCC (Optioneel)</label>
              <input 
                type="email"
                value={bccEmail}
                onChange={(e) => setBccEmail(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-lg px-3 py-2 text-white outline-none transition-all"
                placeholder="BCC e-mailadres"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Onderwerp</label>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-lg px-3 py-2 text-white outline-none transition-all"
              placeholder="E-mail onderwerp"
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bericht</label>
            <textarea 
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-lg px-3 py-2 text-white outline-none transition-all resize-none font-sans"
              placeholder="Schrijf hier uw e-mail..."
            />
          </div>

          {/* Helpful guide message based on step */}
          <div className="bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-xl">
            {!isDownloaded ? (
              <div className="text-xs space-y-1">
                <p className="font-bold text-indigo-400">Stap 1: Sla de factuur op als PDF</p>
                <p className="text-slate-400 leading-normal">
                  Klik hieronder op <span className="font-semibold text-slate-200">Download PDF</span> om de print- en opslaandialoog te openen. Bewaar de factuur op uw apparaat.
                </p>
              </div>
            ) : (
              <div className="text-xs space-y-1">
                <p className="font-bold text-green-400">Stap 2: Open de e-mail opsteller</p>
                <p className="text-slate-400 leading-normal">
                  Geweldig! De PDF-dialoog is geopend. Klik op <span className="font-semibold text-slate-200">Mail</span> om uw e-mailprogramma direct op te starten. Voeg daarna de zojuist gedownloade PDF toe als bijlage.
                </p>
                <button 
                  onClick={() => setIsDownloaded(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-350 underline mt-1.5 block transition-all"
                >
                  PDF opnieuw downloaden? Klik hier.
                </button>
              </div>
            )}
          </div>

          {/* Attachment Display */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                <Paperclip className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-200 font-semibold">{invoiceNum}.pdf</p>
                <p className="text-[10px] text-slate-500">Vergeet niet om na het openen de gedownloade PDF toe te voegen als bijlage.</p>
              </div>
            </div>
            <div className="text-[10px] bg-slate-900 text-slate-400 font-bold px-2 py-1 rounded-md border border-slate-800 flex items-center gap-1 shrink-0">
              <FileText className="w-3.5 h-3.5" style={{ color: activeColor }} />
              PDF specificatie
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Annuleren
          </button>
          {!isDownloaded ? (
            <button
              onClick={handleDownloadPdf}
              style={{ backgroundColor: activeColor }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-5 text-white rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95 cursor-pointer shadow-lg shadow-black/20 font-display animate-fadeIn"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          ) : (
            <button
              onClick={handleMailto}
              style={{ backgroundColor: activeColor }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-5 text-white rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95 cursor-pointer shadow-lg shadow-black/20 font-display animate-fadeIn"
            >
              <Mail className="w-4 h-4" />
              Mail
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
