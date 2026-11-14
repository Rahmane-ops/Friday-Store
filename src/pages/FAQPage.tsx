import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Shield, Truck, RefreshCw, FileText, Lock } from 'lucide-react';
import { FAQ_ITEMS } from '../data/mockData';

export const FAQPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'delivery' | 'cgv' | 'mentions' | 'privacy'>('faq');
  const [search, setSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const filteredFaqs = FAQ_ITEMS.filter((f) => {
    return (
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
    );
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider bg-[#EBF4F0] px-3 py-1 rounded-full border border-[#D5E5DE]">
          Aide &amp; Informations
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10332C] tracking-tight">
          Centre d'Aide &amp; Mentions Légales
        </h1>
        <p className="text-xs sm:text-sm text-[#2D453D]">
          Retrouvez toutes les réponses concernant les commandes, paiements Wave/OM, garanties 14 jours et expéditions au Sénégal.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto p-1.5 bg-white rounded-2xl border border-[#D5E5DE] shadow-sm">
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'faq'
              ? 'bg-gradient-to-r from-[#10332C] to-[#1A4C40] text-[#C99E69] shadow-sm'
              : 'text-[#2D453D] hover:text-[#10332C]'
          }`}
        >
          Questions Fréquentes (FAQ)
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'delivery'
              ? 'bg-gradient-to-r from-[#10332C] to-[#1A4C40] text-[#C99E69] shadow-sm'
              : 'text-[#2D453D] hover:text-[#10332C]'
          }`}
        >
          Livraison &amp; Retours
        </button>
        <button
          onClick={() => setActiveTab('cgv')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'cgv'
              ? 'bg-gradient-to-r from-[#10332C] to-[#1A4C40] text-[#C99E69] shadow-sm'
              : 'text-[#2D453D] hover:text-[#10332C]'
          }`}
        >
          CGV
        </button>
        <button
          onClick={() => setActiveTab('mentions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'mentions'
              ? 'bg-gradient-to-r from-[#10332C] to-[#1A4C40] text-[#C99E69] shadow-sm'
              : 'text-[#2D453D] hover:text-[#10332C]'
          }`}
        >
          Mentions Légales
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'privacy'
              ? 'bg-gradient-to-r from-[#10332C] to-[#1A4C40] text-[#C99E69] shadow-sm'
              : 'text-[#2D453D] hover:text-[#10332C]'
          }`}
        >
          Confidentialité
        </button>
      </div>

      {/* TAB 1: FAQ (8 questions) */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans la FAQ (ex: Wave, garantie, livraison)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D5E5DE] text-xs text-[#10332C] placeholder-neutral-400 focus:outline-none focus:border-[#10332C] shadow-sm"
            />
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-[#D5E5DE] bg-white overflow-hidden shadow-sm transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#F8FAF9] transition-colors"
                  >
                    <span className="text-sm font-bold text-[#10332C]">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#C99E69] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#2D453D] leading-relaxed border-t border-[#EAF2EE] bg-[#F8FAF9]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Livraison & Retours */}
      {activeTab === 'delivery' && (
        <div className="p-8 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm space-y-6 text-xs sm:text-sm text-[#2D453D] leading-relaxed">
          <div className="flex items-center gap-3 text-[#10332C]">
            <Truck className="w-6 h-6 text-[#C99E69]" />
            <h2 className="text-lg font-bold text-[#10332C]">Politique de Livraison &amp; Expédition</h2>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[#10332C]">1. Zones et Délais de Livraison</h3>
            <p>
              Friday Store assure des expéditions fiables partout sur le territoire sénégalais grâce à notre flotte de coursiers express à Dakar et nos partenaires régionaux :
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#2D453D] pl-2">
              <li><strong>Dakar (Centre, Almadies, Mermoz, Plateau, Ngor, Ouakam, Yoff) :</strong> Livraison en 2 à 4 heures ou le jour même. Tarif : 1 500 FCFA.</li>
              <li><strong>Grand Dakar &amp; Banlieue (Guédiawaye, Pikine, Parcelles, Keur Massar, Rufisque) :</strong> Livraison en 24h. Tarif : 2 000 FCFA.</li>
              <li><strong>Petite Côte (Thiès, Mbour, Saly, Somone) :</strong> Expédition quotidienne, réception sous 24h à 48h. Tarif : 3 000 FCFA.</li>
              <li><strong>Régions Intérieures (Saint-Louis, Touba, Kaolack, Ziguinchor, etc.) :</strong> Réception sous 48h à 72h avec suivi par SMS et WhatsApp. Tarif : 4 000 FCFA.</li>
            </ul>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#EAF2EE]">
            <h3 className="font-bold text-[#10332C]">2. Garantie 14 Jours &amp; Conditions d'Échange</h3>
            <p>
              Votre sérénité est notre engagement. Chaque article (électroménager, électronique, vaisselle ou déco) bénéficie d'une garantie totale :
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#2D453D] pl-2">
              <li>Vous disposez de <strong>14 jours</strong> après réception pour tester votre produit en toute tranquillité.</li>
              <li>En cas d'anomalie de fonctionnement ou d'article non conforme, remplacement direct à neuf ou remboursement intégral.</li>
              <li>Notification simple et rapide par WhatsApp au <strong>+221 77 094 89 94</strong> avec une photo ou courte vidéo.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: CGV */}
      {activeTab === 'cgv' && (
        <div className="p-8 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm space-y-6 text-xs sm:text-sm text-[#2D453D] leading-relaxed">
          <div className="flex items-center gap-3 text-[#10332C]">
            <FileText className="w-6 h-6 text-[#C99E69]" />
            <h2 className="text-lg font-bold text-[#10332C]">Conditions Générales de Vente (CGV)</h2>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#10332C]">Article 1 – Objet et Champ d'Application</h3>
            <p>
              Les présentes Conditions Générales de Vente régissent les ventes d'articles de maison, électroménager, high-tech et gadgets conclues sur la boutique <strong>Friday Store (fridaystore.sn)</strong> ou via son canal WhatsApp officiel.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#10332C]">Article 2 – Prix et Monnaie</h3>
            <p>
              Tous les prix affichés sur Friday Store sont libellés en <strong>Francs CFA (XOF)</strong> toutes taxes comprises. Les frais d'expédition sont indiqués en toute clarté avant la validation du panier.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#10332C]">Article 3 – Commande et Validation</h3>
            <p>
              La commande est validée dès l'attribution de la référence officielle (ex: FS-26-XXXX) et confirmée auprès de notre service d'expédition.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#10332C]">Article 4 – Modalités de Paiement</h3>
            <p>
              Le client peut s'acquitter du montant dû selon trois options sécurisées :
            </p>
            <ul className="list-disc list-inside text-[#2D453D] pl-2 space-y-1">
              <li>Wave Sénégal (scan de QR code sans frais)</li>
              <li>Orange Money Sénégal (transfert sécurisé ou code marchand)</li>
              <li>Paiement en espèces (Cash) à la livraison après inspection de l'article</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 4: Mentions Légales */}
      {activeTab === 'mentions' && (
        <div className="p-8 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm space-y-6 text-xs sm:text-sm text-[#2D453D] leading-relaxed">
          <div className="flex items-center gap-3 text-[#10332C]">
            <Shield className="w-6 h-6 text-[#C99E69]" />
            <h2 className="text-lg font-bold text-[#10332C]">Mentions Légales</h2>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#10332C]">Éditeur de la Boutique</h3>
            <p>
              <strong>Nom commercial :</strong> Friday Store Sénégal SARL<br />
              <strong>Siège social :</strong> Dakar, Sénégal (Boutique en ligne)<br />
              <strong>NINEA :</strong> Registre du Commerce et du Crédit Mobilier (RCCM) de Dakar<br />
              <strong>Téléphone :</strong> +221 77 094 89 94 / +221 78 664 26 44<br />
              <strong>WhatsApp officiel :</strong> +221 77 094 89 94<br />
              <strong>E-mail :</strong> contact@fridaystore.sn<br />
              <strong>Directeur de la publication :</strong> Ousmane Diop
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#EAF2EE]">
            <h3 className="font-bold text-[#10332C]">Hébergement Sécurisé</h3>
            <p>
              Plateforme hébergée sur infrastructure Cloud avec protocole HTTPS et chiffrement SSL 256 bits, garantissant une disponibilité permanente et un chargement ultra-rapide sur mobile.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: Confidentialité */}
      {activeTab === 'privacy' && (
        <div className="p-8 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm space-y-6 text-xs sm:text-sm text-[#2D453D] leading-relaxed">
          <div className="flex items-center gap-3 text-[#10332C]">
            <Lock className="w-6 h-6 text-[#C99E69]" />
            <h2 className="text-lg font-bold text-[#10332C]">Politique de Confidentialité des Données</h2>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#10332C]">Protection de vos données au Sénégal</h3>
            <p>
              Conformément à la Loi n° 2008-12 du 25 janvier 2008 portant sur la protection des données à caractère personnel au Sénégal (CDP), Friday Store s'engage à préserver la stricte confidentialité de vos coordonnées (nom, numéro de téléphone, quartier de livraison).
            </p>
            <p className="text-neutral-500">
              Ces informations sont exclusivement réservées à l'acheminement de vos colis par nos coursiers et au suivi de vos garanties sur WhatsApp. Elles ne sont jamais commercialisées ni cédées à des tiers.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
