import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2,
  Instagram,
  Facebook,
  ExternalLink
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { generateWhatsAppOrderLink } from '../utils/shopCalculations';

export const ContactPage: React.FC = () => {
  const { showToast } = useShop();

  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) {
      showToast('Veuillez remplir votre nom et votre message.');
      return;
    }

    setSubmitted(true);
    showToast('Message envoyé à l\'équipe Friday Store Dakar !');
  };

  const whatsAppDirectUrl = generateWhatsAppOrderLink({});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider bg-[#EBF4F0] px-3 py-1 rounded-full border border-[#D5E5DE]">
          Service Client Dakar
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10332C] tracking-tight">
          Nous Sommes à Votre Écoute à <span className="text-[#C99E69]">Dakar</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#2D453D]">
          Une question sur un produit, un stock, une commande urgente ou un partenariat ? Écrivez-nous ou appelez notre équipe.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Contact Channels */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* WhatsApp Direct Highlight Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#EBF4F0] via-white to-[#F6FAF8] border border-[#5CD1A9]/40 space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5 text-[#10332C] font-bold text-sm">
              <MessageCircle className="w-5 h-5 text-[#5CD1A9]" />
              <span>Canal le plus rapide : WhatsApp Dakar</span>
            </div>
            <p className="text-xs text-[#2D453D] leading-relaxed">
              Pour une réponse en moins de 5 minutes ou pour envoyer une capture de votre panier, échangez en direct avec nos conseillers Friday Store.
            </p>
            <a
              href={whatsAppDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#0C241F] hover:to-[#143D34] text-[#C99E69] hover:text-white font-bold text-xs transition-colors shadow-md shadow-[#10332C]/20 border border-[#C99E69]/30"
            >
              Ouvrir WhatsApp (+221 77 094 89 94)
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Contact Details Cards */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EBF4F0] text-[#10332C] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[#5CD1A9]" />
              </div>
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-[#10332C] text-sm">Lignes Directes / Service Client</h4>
                <div className="font-mono text-[#10332C] font-semibold flex flex-wrap gap-x-2">
                  <a href="tel:+221770948994" className="hover:text-[#5CD1A9] transition-colors">+221 77 094 89 94</a>
                  <span>/</span>
                  <a href="tel:+221786642644" className="hover:text-[#5CD1A9] transition-colors">+221 78 664 26 44</a>
                </div>
                <p className="text-neutral-500">WhatsApp officiel : +221 77 094 89 94 (7j/7)</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EBF4F0] text-[#10332C] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#C99E69]" />
              </div>
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-[#10332C] text-sm">Courrier Électronique</h4>
                <p className="text-[#10332C] font-semibold">contact@fridaystore.sn</p>
                <p className="text-neutral-500">Partenariats &amp; presse : press@fridaystore.sn</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EBF4F0] text-[#10332C] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#10332C]" />
              </div>
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-[#10332C] text-sm">Horaires Service Client &amp; Livraisons</h4>
                <p className="text-[#2D453D]">Lundi au Samedi : 09h00 - 20h00</p>
                <p className="text-neutral-500">Dimanche : 12h00 - 19h00</p>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="pt-2">
            <span className="text-xs text-[#2D453D] uppercase tracking-wider font-bold block mb-3">
              Suivez l'actualité Friday Store :
            </span>
            <div className="flex flex-wrap gap-2.5 text-xs">
              <a
                href="https://www.tiktok.com/@fridayontiktok?_r=1&_t=ZS-9BJofV7oXcS"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white border border-[#D5E5DE] hover:border-[#10332C] text-[#10332C] flex items-center gap-2 font-medium shadow-sm transition-all hover:bg-[#F6FAF8]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.86-4.5V8.58a8.28 8.28 0 0 0 4.84 1.56V6.69h-.93z"/>
                </svg>
                <span>TikTok @fridayontiktok</span>
              </a>
              <a
                href="https://www.instagram.com/fridaysurinsta?obrf=NjRlaDR3ZzFkZXJz"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white border border-[#D5E5DE] hover:border-[#10332C] text-[#10332C] flex items-center gap-2 font-medium shadow-sm transition-all hover:bg-[#F6FAF8]"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram @fridaysurinsta</span>
              </a>
              <a
                href="https://www.facebook.com/share/1CF6cnDki5/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white border border-[#D5E5DE] hover:border-[#10332C] text-[#10332C] flex items-center gap-2 font-medium shadow-sm transition-all hover:bg-[#F6FAF8]"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook Friday Store</span>
              </a>
            </div>
          </div>

        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#D5E5DE] shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#10332C]">Envoyez-nous un message</h3>
            <p className="text-xs text-[#2D453D] mt-1">
              Remplissez ce formulaire et notre équipe de conciergerie vous répondra sous quelques heures ouvrées.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center rounded-2xl bg-[#EBF4F0] border border-[#5CD1A9]/40 space-y-3">
              <div className="w-12 h-12 rounded-full bg-white text-[#5CD1A9] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-[#10332C]">Merci pour votre message !</h4>
              <p className="text-xs text-[#2D453D] max-w-sm mx-auto">
                Votre demande a bien été transmise à notre équipe de Dakar. Nous vous recontacterons très vite.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setContactForm({ name: '', phone: '', email: '', subject: '', message: '' });
                }}
                className="px-4 py-2 rounded-xl bg-[#10332C] text-[#C99E69] hover:text-white text-xs font-semibold"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#2D453D] font-semibold">Votre Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Ex: Seydou Ba"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-xs text-[#10332C] placeholder-neutral-400 focus:outline-none focus:border-[#10332C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#2D453D] font-semibold">Téléphone (Sénégal) *</label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="Ex: 78 123 45 67"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-xs text-[#10332C] placeholder-neutral-400 focus:outline-none focus:border-[#10332C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#2D453D] font-semibold">Adresse email (facultatif)</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="exemple@domaine.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-xs text-[#10332C] placeholder-neutral-400 focus:outline-none focus:border-[#10332C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#2D453D] font-semibold">Sujet de votre demande</label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-xs text-[#10332C] focus:outline-none focus:border-[#10332C]"
                  >
                    <option value="">Sélectionnez un motif...</option>
                    <option value="dispo">Disponibilité d'un produit en stock</option>
                    <option value="livraison">Délai de livraison Dakar ou Région</option>
                    <option value="garantie">Garantie &amp; Service après-vente (14 jours)</option>
                    <option value="grossiste">Achat en gros / Commande spéciale</option>
                    <option value="partenariat">Partenariat &amp; Créateurs de contenu</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#2D453D] font-semibold">Votre message *</label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Écrivez votre message ici..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-xs text-[#10332C] placeholder-neutral-400 focus:outline-none focus:border-[#10332C]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#0C241F] hover:to-[#143D34] text-[#C99E69] hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#10332C]/15 border border-[#C99E69]/30"
              >
                <Send className="w-4 h-4" />
                Envoyer le message
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
