import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useShop();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
      <div className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#10332C] border border-[#C99E69]/50 shadow-2xl shadow-[#10332C]/30 text-xs font-semibold text-white">
        <CheckCircle2 className="w-4 h-4 text-[#5CD1A9] shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
