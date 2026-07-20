import React from 'react';
import { X, Download, Monitor, Smartphone, Chrome, Info, Laptop, CheckCircle2, ExternalLink } from 'lucide-react';
import { InvoiceSettings } from '../types';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstall: () => void;
  settings: InvoiceSettings;
}

export default function InstallModal({
  isOpen,
  onClose,
  deferredPrompt,
  onInstall,
  settings,
}: InstallModalProps) {
  if (!isOpen) return null;

  const activeColor = settings.colorTheme || '#7c3aed';
  
  // Detect if running inside an iframe
  const isIframe = window.self !== window.top;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-850 rounded-lg text-slate-300">
              <Download className="w-5 h-5" style={{ color: activeColor }} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">App Installeren</h3>
              <p className="text-xs text-slate-400">Installeer RV Invoices op uw apparaat</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-slate-300 text-sm">
          
          {/* Main info card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 shrink-0" style={{ color: activeColor }} />
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-1">Waarom installeren?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Door deze app te installeren werkt hij als een echt desktop- of mobiel programma. U krijgt een icoon op uw startscherm, de app start sneller op en werkt bovendien offline!
              </p>
            </div>
          </div>

          {/* Conditional UI based on iframe or prompt state */}
          {isIframe ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <Laptop className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">U bevindt zich in een iframe</p>
                  <p className="text-xs text-amber-200/85 mt-1 leading-relaxed">
                    Browsers blokkeren directe app-installaties binnen een preview-iframe. Klik op de knop hieronder om de app in een nieuwe tab te openen en daar direct te installeren.
                  </p>
                </div>
              </div>
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-all"
              >
                Open in nieuwe tab <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : deferredPrompt ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl">
              <div className="flex items-start gap-2.5 mb-3">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Klaar voor directe installatie</p>
                  <p className="text-xs text-emerald-200/85 mt-1">
                    Uw browser ondersteunt directe installatie. Klik op de groene knop hieronder om het installatievenster te openen.
                  </p>
                </div>
              </div>
              <button
                onClick={onInstall}
                style={{ backgroundColor: activeColor }}
                className="w-full py-2.5 px-4 text-white font-bold text-xs rounded-lg transition-all hover:brightness-110 active:scale-95 cursor-pointer shadow-md"
              >
                Installeer Nu Direct op dit Apparaat
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Als de browser geen automatische installatieknop toont, kunt u de app handmatig toevoegen via deze stappen:
              </p>

              {/* Desktop instructions */}
              <div className="space-y-2.5 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" style={{ color: activeColor }} />
                  <span className="font-bold text-xs text-white uppercase tracking-wider">Op de Desktop (Chrome, Edge)</span>
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 pl-1 pl-1">
                  <li>Kijk rechtsboven in uw browserbalk (naast de ster of favorieten).</li>
                  <li>Klik op het <span className="text-white font-semibold">Installatie-icoon</span> (een computertje met een pijl naar beneden).</li>
                  <li>Of ga naar het menu (drie puntjes) en klik op <span className="text-white font-semibold">"App installeren..."</span>.</li>
                </ol>
              </div>

              {/* Mobile instructions */}
              <div className="space-y-2.5 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" style={{ color: activeColor }} />
                  <span className="font-bold text-xs text-white uppercase tracking-wider">Op Mobiel (iOS & Android)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                    <p className="font-bold text-white mb-1">Apple Safari (iOS):</p>
                    <p className="text-[11px] leading-relaxed">Tik onderaan op de <span className="text-slate-200">Deelknop</span> (vierkant met pijl omhoog) en kies <span className="text-slate-200">"Zet op beginscherm"</span>.</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                    <p className="font-bold text-white mb-1">Google Chrome (Android):</p>
                    <p className="text-[11px] leading-relaxed">Tik op de <span className="text-slate-200">drie puntjes</span> rechtsboven en kies <span className="text-slate-200">"App installeren"</span> of <span className="text-slate-200">"Toevoegen aan startscherm"</span>.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Sluiten
          </button>
        </div>

      </div>
    </div>
  );
}
