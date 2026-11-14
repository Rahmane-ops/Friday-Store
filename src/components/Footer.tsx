import React, { useState } from 'react';
import {
  Truck,
  ShieldCheck,
  RefreshCw,
  Phone,
  Mail,
  Heart,
  ExternalLink,
  ChevronRight,
  Send,
  Instagram,
  Facebook,
  MessageCircle
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ViewMode } from '../types';

export const Footer: React.FC = () => {
  const { navigateTo, showToast } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      showToast('Merci pour votre inscription à la communauté Friday Store !');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-gradient-to-b from-[#10332C] via-[#0D2923] to-[#081B17] text-[#CFE4DC] border-t border-[#10332C]/30 pt-12 pb-8">
      {/* 4 Pillars of Senegalese E-Commerce Reassurance */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#234A40]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#17463B] border border-[#C99E69]/30 flex items-center justify-center shrink-0 text-[#C99E69]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#F9F7F2] text-sm font-bold">Livraison Express Dakar</h4>
              <p className="text-xs text-[#9EBFB4] mt-0.5">Livré le jour même ou 24h à Dakar et sous 48-72h dans toutes les régions du Sénégal.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#17463B] border border-[#5CD1A9]/30 flex items-center justify-center shrink-0 text-[#5CD1A9]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#F9F7F2] text-sm font-bold">Wave &amp; Orange Money</h4>
              <p className="text-xs text-[#9EBFB4] mt-0.5">Payez en toute sécurité par Wave, Orange Money ou en espèces (cash) directement à la réception.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#17463B] border border-[#C99E69]/30 flex items-center justify-center shrink-0 text-[#C99E69]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#F9F7F2] text-sm font-bold">Garantie Remplacement 14j</h4>
              <p className="text-xs text-[#9EBFB4] mt-0.5">Testez sereinement : échange immédiat ou prise en charge SAV sous 14 jours à Dakar.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#17463B] border border-[#5CD1A9]/30 flex items-center justify-center shrink-0 text-[#5CD1A9]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#F9F7F2] text-sm font-bold">Assistance WhatsApp 7j/7</h4>
              <p className="text-xs text-[#9EBFB4] mt-0.5">Une équipe chaleureuse et réactive basée à Dakar disponible pour vous conseiller au quotidien.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Presentation with Official Logo */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border border-[#C99E69]/30 shrink-0">
                <img
                  src="/assets/aistudio/logo_friday_de00ddef.jpg"
                  alt="Friday Store Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#F9F7F2] block">
                  FRIDAY<span className="text-[#C99E69]">STORE</span>
                </span>
                <span className="text-[11px] text-[#9EBFB4]">Boutique en Ligne · Sénégal</span>
              </div>
            </div>
            <p className="text-xs text-[#9EBFB4] leading-relaxed max-w-sm">
              Votre boutique en ligne de référence au Sénégal pour l'électronique, le petit électroménager, la vaisselle d'exception, la décoration maison et les gadgets tendance. Produits testés, paiement à la livraison après inspection et expédition express 24h.
            </p>
            
            {/* Payment methods logos */}
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-[#C99E69] font-bold block mb-2">
                Paiements acceptés au Sénégal :
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-[#163D33] border border-[#2B6858] text-[#CFE4DC] font-semibold">
                  Wave 📱
                </span>
                <span className="px-2.5 py-1 rounded bg-[#163D33] border border-[#2B6858] text-[#CFE4DC] font-semibold">
                  Orange Money 🟠
                </span>
                <span className="px-2.5 py-1 rounded bg-[#163D33] border border-[#2B6858] text-[#CFE4DC] font-semibold">
                  Cash à la livraison 💵
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-[#F9F7F2] text-xs uppercase tracking-wider font-bold">Rayons Boutique</h4>
            <ul className="space-y-2 text-xs text-[#9EBFB4]">
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-white transition-colors">
                  Tous les rayons
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-white transition-colors">
                  Électroménager &amp; Cuisine
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-white transition-colors">
                  Électronique &amp; High-Tech
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-white transition-colors">
                  Vaisselle &amp; Art de la table
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-white transition-colors">
                  Déco Maison &amp; Gadgets
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('tracking')} className="text-[#C99E69] hover:underline font-semibold transition-colors">
                  Suivre un colis
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div className="space-y-3">
            <h4 className="text-[#F9F7F2] text-xs uppercase tracking-wider font-bold">Informations</h4>
            <ul className="space-y-2 text-xs text-[#9EBFB4]">
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">
                  Notre histoire &amp; Équipe
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('faq')} className="hover:text-white transition-colors">
                  Foire aux Questions (FAQ)
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('strategy-guide')} className="text-[#C99E69] hover:underline font-semibold transition-colors">
                  Guide Déploiement &amp; Stratégie
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin')} className="text-[#5CD1A9] hover:underline font-mono text-[11px] transition-colors">
                  Espace Back-Office
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details & Newsletter */}
          <div className="space-y-3">
            <h4 className="text-[#F9F7F2] text-xs uppercase tracking-wider font-bold">Club Friday Store</h4>
            <p className="text-xs text-[#9EBFB4]">
              Recevez les alertes drop exclusifs et réductions réservées à notre communauté dakaroise.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Votre email..."
                  className="w-full px-3 py-2 text-xs bg-[#0B211C] border border-[#234A40] rounded-xl text-white placeholder-[#689487] focus:outline-none focus:border-[#C99E69]"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-gradient-to-r from-[#17463B] to-[#226353] text-[#C99E69] rounded-lg text-xs font-bold hover:brightness-110"
                  aria-label="S'inscrire à la newsletter"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="pt-2 text-xs text-[#9EBFB4] space-y-1.5">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#5CD1A9] shrink-0" />
                <div className="font-mono text-white font-semibold flex flex-wrap gap-x-2">
                  <a href="tel:+221770948994" className="hover:text-[#5CD1A9] transition-colors">+221 77 094 89 94</a>
                  <span>/</span>
                  <a href="tel:+221786642644" className="hover:text-[#5CD1A9] transition-colors">+221 78 664 26 44</a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <a
                  href="https://wa.me/221770948994"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] font-semibold text-white transition-colors"
                >
                  WhatsApp : +221 77 094 89 94
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C99E69] shrink-0" />
                <span>contact@fridaystore.sn</span>
              </div>
            </div>

            {/* Réseaux Sociaux Officiels */}
            <div className="pt-2 border-t border-[#234A40]/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C99E69] block mb-2">
                Suivez-nous sur les réseaux :
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.tiktok.com/@fridayontiktok?_r=1&_t=ZS-9BJofV7oXcS"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok Friday Store"
                  className="w-8 h-8 rounded-lg bg-[#163D33] hover:bg-[#1C4D41] border border-[#2B6858] flex items-center justify-center text-[#CFE4DC] hover:text-white transition-all transform hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.86-4.5V8.58a8.28 8.28 0 0 0 4.84 1.56V6.69h-.93z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/fridaysurinsta?obrf=NjRlaDR3ZzFkZXJz"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Friday Store"
                  className="w-8 h-8 rounded-lg bg-[#163D33] hover:bg-[#1C4D41] border border-[#2B6858] flex items-center justify-center text-[#CFE4DC] hover:text-white transition-all transform hover:scale-105"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/share/1CF6cnDki5/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Friday Store"
                  className="w-8 h-8 rounded-lg bg-[#163D33] hover:bg-[#1C4D41] border border-[#2B6858] flex items-center justify-center text-[#CFE4DC] hover:text-white transition-all transform hover:scale-105"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/221770948994"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Friday Store"
                  className="w-8 h-8 rounded-lg bg-[#163D33] hover:bg-[#25D366]/20 border border-[#2B6858] flex items-center justify-center text-[#25D366] hover:text-[#25D366] transition-all transform hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar Legal */}
        <div className="pt-8 mt-8 border-t border-[#234A40] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7B9F94] gap-4">
          <p>© 2026 Friday Store Sénégal. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('faq')} className="hover:text-white transition-colors">
              Conditions Générales de Vente
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigateTo('faq')} className="hover:text-white transition-colors">
              Livraison &amp; Retours
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigateTo('faq')} className="hover:text-white transition-colors">
              Confidentialité
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
