import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface AddressFetcherProps {
  onAddressFound: (address: string, zipCity: string) => void;
}

export function AddressFetcher({ onAddressFound }: AddressFetcherProps) {
  const [postcode, setPostcode] = useState('');
  const [huisnummer, setHuisnummer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAddress = async () => {
    if (!postcode || !huisnummer) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Clean up the postcode (remove spaces)
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      const query = encodeURIComponent(`${cleanPostcode} ${huisnummer}`);
      const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${query}&fl=straatnaam,woonplaatsnaam,postcode,huis_nlt`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.response.numFound > 0) {
        // Take the first result
        const doc = data.response.docs[0];
        const { straatnaam, woonplaatsnaam, postcode: pdokPostcode, huis_nlt } = doc;
        
        if (straatnaam && woonplaatsnaam) {
          // Format the results
          const formattedPostcode = pdokPostcode ? `${pdokPostcode.substring(0,4)} ${pdokPostcode.substring(4,6)}` : cleanPostcode;
          
          const newAddress = `${straatnaam} ${huis_nlt || huisnummer}`;
          const newZipCity = `${formattedPostcode} ${woonplaatsnaam}`;
          
          onAddressFound(newAddress, newZipCity);
          // Optional: clear the fields after success
          // setPostcode('');
          // setHuisnummer('');
        } else {
          setError('Adres niet compleet gevonden');
        }
      } else {
        setError('Geen adres gevonden');
      }
    } catch (err) {
      setError('Fout bij zoeken');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/50 space-y-2 mb-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vul aan met Postcode</label>
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="1234AB"
          className="w-2/5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-violet-500 rounded-md px-2 py-1.5 outline-none"
        />
        <input 
          type="text" 
          value={huisnummer}
          onChange={(e) => setHuisnummer(e.target.value)}
          placeholder="Huisnr."
          className="w-2/5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-violet-500 rounded-md px-2 py-1.5 outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              fetchAddress();
            }
          }}
        />
        <button
          type="button"
          onClick={fetchAddress}
          disabled={loading || !postcode || !huisnummer}
          className="w-1/5 flex items-center justify-center bg-violet-100 text-violet-600 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/50 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
        </button>
      </div>
      {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
