import React, { useState } from 'react';
import { Phone, X, AlertTriangle } from 'lucide-react';

export default function EmergencyBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2.5 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">
            In immediate danger? Call <a href="tel:100" className="underline font-bold">100</a> (Police) or 
            Women Helpline: <a href="tel:181" className="underline font-bold">181</a> | <a href="tel:1091" className="underline font-bold">1091</a>
          </span>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="text-white/80 hover:text-white flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}