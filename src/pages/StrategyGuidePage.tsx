import React, { useState } from 'react';
import {
  BookOpen,
  FolderTree,
  Rocket,
  CheckSquare,
  Instagram,
  Copy,
  Check,
  Server,
  Globe,
  Shield,
  Smartphone
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const StrategyGuidePage: React.FC = () => {
  const { showToast } = useShop();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    showToast('Copié dans le presse-papier !');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const projectTree = `friday-store/
├── index.html                   # Entry point avec SEO local Dakar, OpenGraph, Favicon officiel
├── metadata.json                # Métadonnées d'application Google AI Studio
├── package.json                 # Dépendances React 19, Tailwind CSS v4, Lucide
├── tsconfig.json                # Configuration TypeScript ES2022
├── vite.config.ts               # Configuration Vite & Tailwind
├── public/assets/aistudio/
│   ├── logo_friday_de00ddef.jpg # Logo officiel Friday (vert #10332C & monogramme or #C99E69)
│   └── icone_friday_13e5679f.jpg# Favicon & icône application officielle Friday
├── src/
│   ├── main.tsx                 # Montage de l'application React
│   ├── index.css                # Variables de marque (--brand-green, --brand-gold, dégradés)
│   ├── App.tsx                  # Composant racine, routeur d'état & layout responsive
│   ├── types/
│   │   └── index.ts             # Typages Product, Cart, Order, Zones Dakar/Régions, ViewMode
│   ├── data/
│   │   └── mockData.ts          # Catalogue dropshipping généraliste, zones livraison, FAQ 8 questions
│   ├── context/
│   │   └── ShopContext.tsx      # Panier persistant (localStorage), gestion commandes, CRUD stock
│   ├── utils/
│   │   ├── shopCalculations.ts  # Formatage FCFA, calculs panier, validation tél Sénégal, WhatsApp link
│   │   └── shopCalculations.test.ts # Tests unitaires purs via node:test (100% de réussite)
│   ├── components/
│   │   ├── Header.tsx           # Top bar conforme (3 zones, icône officielle Friday, panier, mobile)
│   │   ├── Footer.tsx           # Réassurance Sénégal, Wave/OM/Cash, réseaux sociaux, logo Friday
│   │   ├── CartDrawer.tsx       # Tiroir panier interactif, promos, commande 1-clic WhatsApp
│   │   ├── WhatsAppButton.tsx   # Widget flottant WhatsApp assistance & commande directe
│   │   └── Toast.tsx            # Notifications visuelles utilisateur aux couleurs de marque
│   └── pages/
│       ├── HomePage.tsx         # Accueil : Hero banner Dakar dégradé vert-blanc, univers dropshipping
│       ├── ShopPage.tsx         # Catalogue : Filtres 5 catégories, curseur budget FCFA, recherche
│       ├── ProductDetailPage.tsx# Fiche produit : Variantes, stock Dakar, commande 1-clic WhatsApp
│       ├── CheckoutPage.tsx     # Caisse : Coordonnées, zones Dakar/Régions, Wave/OM/Cash à la livraison
│       ├── AboutPage.tsx        # À Propos : Histoire de la marque à Dakar, valeurs Teranga, showcase logo
│       ├── ContactPage.tsx      # Contact : Formulaire, service client Dakar, WhatsApp hotline +221 77 094 89 94
│       ├── FAQPage.tsx          # FAQ 8 questions, CGV, Mentions Légales, Garantie 14 jours
│       ├── OrderTrackingPage.tsx# Suivi de commande en temps réel avec stepper coursier
│       ├── AdminPage.tsx        # Back-Office : KPIs FCFA, commandes, gestion catalogue
│       └── StrategyGuidePage.tsx# Guide de déploiement et stratégie marketing Sénégal`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider bg-[#EBF4F0] px-3 py-1 rounded-full border border-[#D5E5DE]">
          Documentation Complète
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10332C] tracking-tight">
          Livrables, Déploiement &amp; Stratégie Sénégal
        </h1>
        <p className="text-xs sm:text-sm text-[#2D453D]">
          Guide technique et marketing exhaustif pour le lancement commercial de « Friday Store » au Sénégal.
        </p>
      </div>

      {/* 1. Arborescence du Projet */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D5E5DE] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[#10332C] font-bold text-sm">
            <FolderTree className="w-5 h-5 text-[#C99E69]" />
            <span>1. Arborescence Complète du Projet</span>
          </div>
          <button
            onClick={() => handleCopy('tree', projectTree)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EBF4F0] text-xs text-[#10332C] hover:bg-[#D5E5DE] font-semibold transition-colors border border-[#D5E5DE]"
          >
            {copiedSection === 'tree' ? <Check className="w-3.5 h-3.5 text-[#5CD1A9]" /> : <Copy className="w-3.5 h-3.5" />}
            Copier
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-[#F8FAF9] font-mono text-xs text-[#10332C] overflow-x-auto leading-relaxed border border-[#D5E5DE]">
          {projectTree}
        </pre>
      </div>

      {/* 2. Instructions de Déploiement */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D5E5DE] shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 text-[#10332C] font-bold text-sm">
          <Server className="w-5 h-5 text-[#C99E69]" />
          <span>2. Instructions d'Installation et Déploiement Pas à Pas</span>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#2D453D] leading-relaxed">
          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] space-y-2">
            <h4 className="font-bold text-[#10332C] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#10332C] text-[#C99E69] text-xs flex items-center justify-center font-bold">A</span>
              Installation Locale (Machine de dev)
            </h4>
            <pre className="p-3 rounded-xl bg-white font-mono text-xs text-[#10332C] border border-[#D5E5DE] overflow-x-auto">
{`git clone <url-du-depot> friday-store
cd friday-store
npm install
npm run dev`}
            </pre>
            <p className="text-neutral-500 text-xs">
              L'application se lance immédiatement sur <code className="text-[#10332C] font-semibold">http://localhost:3000</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] space-y-2">
            <h4 className="font-bold text-[#10332C] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#10332C] text-[#C99E69] text-xs flex items-center justify-center font-bold">B</span>
              Déploiement en Production (Vercel ou Netlify) — Recommandé
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-[#2D453D] pl-2 font-medium">
              <li>Poussez le code sur GitHub ou GitLab.</li>
              <li>Connectez votre compte Vercel ou Netlify au dépôt.</li>
              <li>Build Command : <code className="text-[#10332C] font-bold">npm run build</code></li>
              <li>Output Directory : <code className="text-[#10332C] font-bold">dist</code></li>
              <li>Associez votre nom de domaine personnalisé (ex: <code className="text-[#C99E69] font-bold font-mono">fridaystore.sn</code>).</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 3. Checklist de Lancement */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D5E5DE] shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 text-[#10332C] font-bold text-sm">
          <CheckSquare className="w-5 h-5 text-[#C99E69]" />
          <span>3. Checklist de Lancement Avant Ouverture Officielle à Dakar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] space-y-2">
            <strong className="text-[#10332C] text-sm block">1. Nom de Domaine &amp; SSL</strong>
            <p className="text-[#2D453D]">
              Acheter <code className="text-[#10332C] font-bold font-mono">fridaystore.sn</code> auprès d'un registrar agréé NIC.sn (ex: Arc Informatique, Odisi ou Gandi). Certificat SSL Let's Encrypt automatique activé.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] space-y-2">
            <strong className="text-[#10332C] text-sm block">2. Compte Marchand Wave &amp; OM</strong>
            <p className="text-[#2D453D]">
              Ouvrir un compte Wave Business officiel à Dakar avec numéro d'entreprise. Activer le lien Wave Merchant pour encaissement instantané 0% de frais.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] space-y-2">
            <strong className="text-[#10332C] text-sm block">3. Flotte de Coursiers Express Dakar</strong>
            <p className="text-[#2D453D]">
              Conventionner une équipe locale de coursiers moto pour des livraisons en 2h à 4h chrono sur Almadies, Plateau, Mermoz avec contrôle de l'article sur place.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] space-y-2">
            <strong className="text-[#10332C] text-sm block">4. SEO Local &amp; Google My Business</strong>
            <p className="text-[#2D453D]">
              Profil Google Business pour Friday Store Sénégal. Indexation Google avec mots-clés : « boutique en ligne Sénégal », « électroménager Dakar », « acheter air fryer Dakar », « vaisselle moderne Sénégal ».
            </p>
          </div>
        </div>
      </div>

      {/* 4. Stratégie Marketing & Acquisition Réseaux Sociaux */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D5E5DE] shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 text-[#10332C] font-bold text-sm">
          <Instagram className="w-5 h-5 text-pink-600" />
          <span>4. Stratégie de Lancement Instagram, TikTok &amp; Facebook au Sénégal</span>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#2D453D] leading-relaxed">
          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] space-y-2">
            <h4 className="font-bold text-[#10332C]">Phase 1 : Démonstrations Produit Virales TikTok &amp; Reels (J-14 à J-0)</h4>
            <p className="text-xs text-[#2D453D]">
              Vidéos courtes « Problème &rarr; Solution » mettant en valeur l'Air Fryer 6L (préparation de pastel ou frites sans huile), le mixeur portable VitalBlend et le diffuseur flamme 3D. Accroches dynamiques axées sur le confort et la modernité à la maison.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] space-y-2">
            <h4 className="font-bold text-[#10332C]">Phase 2 : Stratégie Créateurs &amp; Micro-Influenceurs Dakar (J+1 à J+30)</h4>
            <p className="text-xs text-[#2D453D]">
              Partenariats avec 8 créateurs de contenu cuisine, high-tech et aménagement d'intérieur à Dakar. Unboxings vidéo avec démonstration concrète et mise en avant de l'argument clé n°1 au Sénégal : <strong>« Vérification et test de l'appareil avec le coursier avant tout paiement »</strong> avec code promo <code className="text-[#10332C] font-bold font-mono bg-[#EBF4F0] px-2 py-0.5 rounded border border-[#D5E5DE]">FRIDAY10</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] space-y-2">
            <h4 className="font-bold text-[#10332C]">Phase 3 : Publicités Meta (Facebook &amp; Instagram Ads) vers WhatsApp</h4>
            <p className="text-xs text-[#2D453D]">
              Au Sénégal, les campagnes « Click-to-WhatsApp » enregistrent un taux de conversion record pour les produits dropshipping généralistes. Campagnes ciblées sur Dakar et les grandes villes avec un CTA direct « Commander sur WhatsApp » et livraison express en 2h à 4h.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
