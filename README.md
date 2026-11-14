# Friday Store – Boutique Généraliste & Dropshipping Sénégal

> Plateforme e-commerce vitrine et marchande moderne pour l'Électroménager, le High-Tech, la Vaisselle, la Décoration intérieure et les Gadgets innovants à Dakar et dans toutes les régions du Sénégal.

---

## 1. Contexte & Identité
- **Nom commercial :** Friday Store
- **Activité :** E-commerce généraliste & dropshipping (Électroménager, High-Tech, Vaisselle, Déco maison, Gadgets du quotidien)
- **Marché :** Sénégal (Prix en FCFA, zones de livraison Dakar express 2h-4h & Régions 48-72h)
- **Cible :** Grand public et jeunes actifs (18–45 ans), achats principalement sur mobile
- **Paiements supportés :** Wave Sénégal, Orange Money, Paiement à la livraison après inspection (Cash)
- **Canaux de commande :** Panier en ligne interactif avec checkout complet OU commande directe 1-clic via WhatsApp avec message pré-rempli.
- **Piliers de confiance :** Test & inspection du produit avant paiement au coursier, garantie remplacement 14 jours, SAV local à Dakar.

---

## 2. Arborescence du Projet
```
friday-store/
├── index.html                   # HTML entry point avec SEO, OpenGraph, JSON-LD Store
├── metadata.json                # Métadonnées d'application Google AI Studio
├── package.json                 # Dépendances React, Tailwind CSS v4, Lucide
├── tsconfig.json                # Configuration TypeScript
├── vite.config.ts               # Configuration Vite
├── README.md                    # Ce guide complet
├── src/
│   ├── main.tsx                 # Montage React 19
│   ├── index.css                # Polices Google Fonts, thème & Tailwind v4
│   ├── App.tsx                  # Composant racine & routeur d'état
│   ├── types/
│   │   └── index.ts             # Types Product, CartItem, Order, DeliveryZone
│   ├── data/
│   │   └── mockData.ts          # Catalogue 6 produits Dakar, zones, FAQ, avis
│   ├── context/
│   │   └── ShopContext.tsx      # Gestion d'état globale, panier localStorage, commandes
│   ├── utils/
│   │   ├── shopCalculations.ts  # Formatage FCFA, calculs panier, validation tel 77/78
│   │   └── shopCalculations.test.ts # Tests unitaires purs (node:test)
│   ├── components/
│   │   ├── Header.tsx           # Top bar conforme (3 zones, mot-clé, panier, mobile)
│   │   ├── Footer.tsx           # Réassurance Sénégal, Wave/OM, showroom, newsletter
│   │   ├── CartDrawer.tsx       # Tiroir panier interactif, promos, commande WhatsApp
│   │   ├── WhatsAppButton.tsx   # Widget flottant WhatsApp assistance & commande directe
│   │   └── Toast.tsx            # Notifications feedback utilisateur
│   └── pages/
│       ├── HomePage.tsx         # Accueil : Hero banner Dakar, univers, avis
│       ├── ShopPage.tsx         # Boutique : Filtres catégories, budget, recherche
│       ├── ProductDetailPage.tsx# Fiche produit : Variantes, stock Dakar, commande 1-clic
│       ├── CheckoutPage.tsx     # Caisse : Coordonnées, zones Dakar/Régions, Wave/OM
│       ├── AboutPage.tsx        # À Propos : Histoire de la marque à Dakar, valeurs
│       ├── ContactPage.tsx      # Contact : Formulaire, showroom Almadies, WhatsApp
│       ├── FAQPage.tsx          # FAQ 8 questions, CGV, Mentions Légales, Retours
│       ├── OrderTrackingPage.tsx# Suivi de commande en temps réel avec stepper coursier
│       ├── AdminPage.tsx        # Back-Office : KPIs FCFA, commandes, gestion catalogue
│       └── StrategyGuidePage.tsx# Guide de déploiement et stratégie marketing Sénégal
```

---

## 3. Installation et Lancement Pas à Pas

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### Commandes
```bash
# 1. Cloner le projet
git clone <url-du-depot> friday-store
cd friday-store

# 2. Installer les dépendances
npm install

# 3. Lancer les tests unitaires
npx tsx --test src/utils/shopCalculations.test.ts

# 4. Lancer le serveur de développement local
npm run dev
```

Accédez à `http://localhost:3000` sur votre navigateur.

---

## 4. Déploiement en Production

### Option A : Déploiement sur Vercel (Recommandé)
1. Poussez votre code sur GitHub.
2. Créez un projet sur [Vercel](https://vercel.com) en liant le dépôt.
3. Configurez les options de build :
   - **Framework Preset :** Vite
   - **Build Command :** `npm run build`
   - **Output Directory :** `dist`
4. Ajoutez votre nom de domaine personnalisé (`fridaystore.sn`).

### Option B : Déploiement sur Netlify
1. Lier le dépôt GitHub sur [Netlify](https://netlify.com).
2. Spécifier la commande de build `npm run build` et le dossier de publication `dist`.
3. Activer le certificat SSL Let's Encrypt gratuit en 1 clic.

---

## 5. Checklist de Lancement Commercial au Sénégal
1. **Nom de Domaine :** Enregistrer `fridaystore.sn` auprès du NIC Sénégal.
2. **Certificat SSL :** Assurer la navigation HTTPS stricte.
3. **Paiement Mobile Money :** Ouvrir les comptes marchands officiels Wave Business et Orange Money Sénégal.
4. **Logistique :** Contractualiser avec une flotte de coursiers moto pour assurer les livraisons en moins de 4 heures à Dakar.
5. **SEO Local :** Valider la fiche Google My Business pour le showroom des Almadies.

---

## 6. Stratégie d'Acquisition Réseaux Sociaux & Dropshipping (Dakar)
- **Vidéos Démonstration TikTok & Reels :** Vidéos courtes « avant/après » ou problème/solution mettant en scène l'Air Fryer, le mixeur sans fil et le diffuseur flamme.
- **Micro-influenceurs Dakar :** Partenariat avec des créateurs lifestyle, cuisine et tech (unboxing avec test immédiat).
- **Meta Ads vers WhatsApp :** Publicités Facebook & Instagram ciblées sur Dakar avec bouton « Click-to-WhatsApp » direct et paiement Wave ou Cash à la livraison.
