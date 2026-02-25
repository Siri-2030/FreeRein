import React from 'react';
import { X } from 'lucide-react';

export default function QuickExit() {
  const handleExit = () => {
    // Replace current page with a safe website immediately
    window.open('https://www.google.com', '_self');
    // Also try to replace history
    window.location.replace('https://www.google.com');
  };

  return (
    <button
      onClick={handleExit}
      className="fixed bottom-6 right-6 z-[9999] bg-red-600 hover:bg-red-700 text-white 
                 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 
                 transition-all duration-200 hover:scale-105 active:scale-95
                 text-sm font-semibold tracking-wide animate-pulse hover:animate-none"
      title="Quick Exit — leaves this site immediately"
    >
      <X className="w-4 h-4" />
      <span className="hidden sm:inline">Quick Exit</span>
      <span className="sm:hidden">Exit</span>
    </button>
  );
}