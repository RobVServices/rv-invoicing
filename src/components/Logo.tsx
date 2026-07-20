import React from 'react';
import logoImg from '../assets/images/regenerated_image_1784377448417.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "w-10 h-10", showText = false }: LogoProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <img 
        src={logoImg} 
        alt="RV Invoices Logo" 
        className={`${className} object-contain`} 
        referrerPolicy="no-referrer"
      />
      {showText && (
        <div className="text-center mt-4">
          <p className="font-display font-black text-slate-900 tracking-[0.25em] text-base leading-none">
            INVOICING
          </p>
        </div>
      )}
    </div>
  );
}
