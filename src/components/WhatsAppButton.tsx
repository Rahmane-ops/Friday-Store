import React, { useState } from 'react';
import { MessageCircle, X, Send, Clock, MapPin } from 'lucide-react';
import { generateWhatsAppOrderLink } from '../utils/shopCalculations';

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const defaultPhone = '221770948994';

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const text = customMsg.trim() || 'Bonjour Friday Store Dakar, je souhaite avoir des informations sur vos produits.';
    const url = `https://wa.me/${defaultPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setCustomMsg('');
  };

  const quickOptions = [
    {
      label: 'Commander un article',
      text: 'Bonjour Friday Store, je souhaite passer commande d\'un article vu sur votre site.',
    },
    {
      label: 'Délais de livraison à Dakar',
      text: 'Bonjour, pouvez-vous me confirmer les délais et tarifs de livraison pour aujourd\'hui à Dakar ?',
    },
    {
      label: 'Vérifier la disponibilité d’un produit',
      text: 'Bonjour Friday Store Dakar, je souhaite vérifier la disponibilité d’un produit en stock.',
    },
  ];

  const handleQuickClick = (text: string) => {
    const url = `https://wa.me/${defaultPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Popover popup */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-white border border-[#D5E5DE] shadow-2xl p-4 text-[#162E27] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAF2EE]">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/assets/aistudio/icone_friday_13e5679f.jpg"
                  alt="Friday Store"
                  className="w-10 h-10 rounded-full object-cover border border-[#C99E69]/40 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#5CD1A9] border-2 border-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#10332C]">Friday Store Dakar</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-[#10332C]/80 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5CD1A9] inline-block" />
                  <span>En ligne · Réponse en &lt; 5 min</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-[#10332C] p-1 rounded-lg"
              aria-label="Fermer la fenêtre WhatsApp"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-[#2D453D] space-y-2">
            <p className="bg-gradient-to-r from-[#EBF4F0] to-[#F6FAF8] p-3 rounded-xl border border-[#D5E5DE] text-[#10332C] leading-relaxed">
              👋 Salam ! Bienvenue chez Friday Store. Une question sur un produit, une remise ou une livraison express à Dakar ? Écrivez-nous directement ici.
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-[#10332C]/70 uppercase tracking-wider block">
                Questions rapides :
              </span>
              {quickOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickClick(opt.text)}
                  className="w-full text-left text-xs p-2.5 rounded-xl bg-[#F6FAF8] hover:bg-[#EBF4F0] text-[#10332C] hover:text-[#0C241F] font-medium transition-colors border border-[#E2ECE7]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Input */}
          <form onSubmit={handleSendCustom} className="pt-2 border-t border-[#EAF2EE] flex gap-2">
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-xs text-[#10332C] placeholder-neutral-400 focus:outline-none focus:border-[#10332C]"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#0C241F] hover:to-[#143D34] text-[#C99E69] hover:text-white transition-colors shadow-sm"
              aria-label="Envoyer sur WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500">
            <span className="flex items-center gap-1 font-medium text-[#2D453D]">
              <Clock className="w-3 h-3 text-[#C99E69]" />
              9h - 21h 7j/7
            </span>
            <span className="flex items-center gap-1 font-medium text-[#2D453D]">
              <MapPin className="w-3 h-3 text-[#C99E69]" />
              Boutique en ligne · Dakar &amp; Régions
            </span>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#10332C] to-[#17463B] hover:from-[#0C241F] hover:to-[#10332C] text-white font-semibold text-sm shadow-xl shadow-[#10332C]/30 hover:shadow-[#10332C]/40 border border-[#C99E69]/40 transition-all transform hover:-translate-y-0.5 focus:outline-none"
        aria-label="Contacter Friday Store sur WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5CD1A9] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5CD1A9]" />
        </span>
        <MessageCircle className="w-5 h-5 text-[#C99E69]" />
        <span className="hidden sm:inline">WhatsApp Dakar</span>
      </button>
    </div>
  );
};
