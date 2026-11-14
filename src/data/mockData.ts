import { Product, DeliveryZone, PromoCode, CustomerReview, FAQItem } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-airfryer-digital',
    name: 'Friteuse Sans Huile Digitale 6L "AirFry Pro Touch"',
    slug: 'friteuse-sans-huile-digitale-6l-airfry-pro',
    category: 'electromenager',
    price: 42000,
    originalPrice: 55000,
    description: 'La friteuse sans huile intelligente qui révolutionne votre cuisine à Dakar. Cuisson saine à air chaud pulsé à 360°, réduisant jusqu\'à 85% de matières grasses pour des alocos croustillants, poulets rôtis dorés, frites et pastels savoureux. Écran tactile LCD avec 8 programmes automatiques, cuve familiale 6L et panier antiadhésif lavable en lave-vaisselle.',
    shortDescription: 'Capacité familiale 6L, écran tactile LCD & cuisson saine -85% de matière grasse.',
    features: [
      'Capacité généreuse 6 Litres (idéale pour les familles de 4 à 8 personnes)',
      'Écran tactile LED intuitif avec 8 menus préprogrammés',
      'Puissance 1800W : chauffe ultra-rapide jusqu\'à 200°C',
      'Fenêtre transparente avec éclairage intérieur pour surveiller la cuisson',
      'Revêtement antiadhésif en téflon alimentaire sans BPA, nettoyage express'
    ],
    images: [
      '/assets/images/product_airfryer_digital_1793989489237.jpg',
    ],
    sizes: ['Modèle 6L Digital', 'Pack Familial 8L (+6 000 FCFA)'],
    colors: [
      { name: 'Noir Mat & Or Rose', hex: '#1C1917' },
      { name: 'Blanc Nacré & Or', hex: '#F9FAFB' }
    ],
    inStock: true,
    stockCount: 16,
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 68,
    sku: 'FS-APP-AF6L-01'
  },
  {
    id: 'prod-tws-earbuds',
    name: 'Écouteurs Sans Fil TWS Bluetooth 5.3 "AuraBuds Pro ANC"',
    slug: 'ecouteurs-sans-fil-tws-aurabuds-pro-anc',
    category: 'electronique',
    price: 18500,
    originalPrice: 26000,
    description: 'Écouteurs sans fil nouvelle génération avec réduction active du bruit (ANC) et mode transparence. Boîtier compact à fermeture magnétique avec écran digital LED affichant précisément le pourcentage de batterie restant. Basses profondes, microphones avec réduction de bruit pour des appels clairs même dans les embouteillages de Dakar.',
    shortDescription: 'Réduction active du bruit, écran LED batterie & 32h d\'autonomie.',
    features: [
      'Puce Bluetooth 5.3 dernière génération : connexion instantanée sans coupure',
      'Écran LED digital affichant le pourcentage réel de la batterie',
      'Autonomie record de 32 heures cumulées avec le boîtier de charge rapide Type-C',
      'Double micro anti-bruit pour des appels téléphoniques limpides',
      'Résistance à la transpiration et à la pluie (IPX5)'
    ],
    images: [
      '/assets/images/product_tws_earbuds_pro_1793989490182.jpg',
    ],
    sizes: ['Pack Standard (1 Boîtier)', 'Pack Duo (2 Paires, -3000 FCFA)'],
    colors: [
      { name: 'Noir Carbone', hex: '#18181B' },
      { name: 'Blanc Pur', hex: '#F4F4F5' }
    ],
    inStock: true,
    stockCount: 34,
    isFeatured: true,
    isNew: true,
    rating: 4.8,
    reviewCount: 94,
    sku: 'FS-TEC-TWS-02'
  },
  {
    id: 'prod-projector-hd',
    name: 'Mini Vidéoprojecteur Portable HD Cinéma "CineView Ultra"',
    slug: 'mini-videoprojecteur-portable-hd-cineview-ultra',
    category: 'electronique',
    price: 49000,
    originalPrice: 65000,
    description: 'Transformez votre salon ou votre terrasse en véritable salle de cinéma à la maison ! Ce mini vidéoprojecteur HD portable diffuse une image lumineuse jusqu\'à 150 pouces. Connectivité complète WiFi, Bluetooth, HDMI et USB pour projeter YouTube, Netflix, vos matchs de football ou vos présentations depuis votre smartphone ou clé USB.',
    shortDescription: 'Résolution HD 1080p, image jusqu\'à 150", haut-parleur stéréo intégré & WiFi/Bluetooth.',
    features: [
      'Résolution HD 1080p avec luminosité de 4500 Lumens adaptée aux soirées',
      'Image géante ajustable de 40 à 150 pouces avec correction trapézoïdale',
      'Connexion sans fil WiFi screen-mirroring (Android / iPhone) et Bluetooth audio',
      'Haut-parleur stéréo Hi-Fi intégré avec basses enveloppantes',
      'Design compact et poignée élégante cuir pour un transport aisé'
    ],
    images: [
      '/assets/images/product_projector_hd_1794319528989.jpg',
    ],
    sizes: ['Projecteur HD Standard', 'Pack Cinéma (+ Écran Mural 100")'],
    colors: [
      { name: 'Noir Mat & Finition Or', hex: '#18181B' },
      { name: 'Blanc Polaire & Argent', hex: '#F3F4F6' }
    ],
    inStock: true,
    stockCount: 14,
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 47,
    sku: 'FS-TEC-PRJ-08'
  },
  {
    id: 'prod-tableware-ceramic',
    name: 'Service de Table Céramique 18 Pièces "Emerald Luxury"',
    slug: 'service-table-ceramique-18-pieces-emerald-luxury',
    category: 'vaisselle',
    price: 39000,
    originalPrice: 48000,
    description: 'Sublimez vos réceptions familiales et repas quotidiens avec ce service d\'art de la table d\'exception. Confectionné en grès cérame haute densité résistant aux chocs thermiques, finition émaillée vert émeraude profond avec délicat liseré doré peint à la main. Comprend 6 grandes assiettes plates, 6 assiettes creuses et 6 bols de présentation.',
    shortDescription: 'Grès cérame émaillé vert émeraude & liseré doré hand-made.',
    features: [
      'Service complet 18 pièces pour 6 convives (assiettes plates, creuses & bols)',
      'Céramique alimentaire haute résistance sans plomb ni cadmium',
      'Compatible micro-ondes et lave-vaisselle',
      'Finition brillante anti-rayures aux reflets somptueux',
      'Emballage ultra-sécurisé anti-casse pour expédition à Dakar et en régions'
    ],
    images: [
      '/assets/images/product_tableware_ceramic_1793989490259.jpg',
    ],
    sizes: ['Service 18 Pièces (6 pers.)', 'Service Complet 24 Pièces (+10 000 FCFA)'],
    colors: [
      { name: 'Vert Émeraude & Or', hex: '#064E3B' },
      { name: 'Blanc Marbré & Or', hex: '#E5E7EB' },
      { name: 'Noir Ardoise & Or', hex: '#27272A' }
    ],
    inStock: true,
    stockCount: 11,
    isFeatured: true,
    isNew: false,
    rating: 5.0,
    reviewCount: 43,
    sku: 'FS-ART-TBL-18'
  },
  {
    id: 'prod-cutlery-gold',
    name: 'Ménagère Couverts de Table 24 Pièces Inox "Prestige Noir & Or"',
    slug: 'menagere-couverts-24-pieces-inox-prestige-noir-or',
    category: 'vaisselle',
    price: 22500,
    originalPrice: 30000,
    description: 'Une touche de raffinement moderne pour votre table ! Cet ensemble de 24 couverts pour 6 personnes allie acier inoxydable 18/10 de haute qualité et revêtement en titane noir mat et or résistant. Livré dans un magnifique coffret de présentation idéal pour les cadeaux ou vos dîners festifs.',
    shortDescription: 'Acier inoxydable 18/10, finition titane noir mat & or brossé (24 pièces).',
    features: [
      'Coffret 24 pièces : 6 couteaux de table, 6 fourchettes, 6 cuillères à soupe, 6 cuillères à café',
      'Acier inoxydable 18/10 forgé lourd au design ergonomique haut de gamme',
      'Revêtement PVD titane résistant aux rayures et à l\'oxydation',
      'Lames de couteaux tranchantes dentelées avec précision',
      'Idéal pour sublimer vos dîners de fête et réceptions teranga'
    ],
    images: [
      '/assets/images/product_cutlery_gold_1794319542180.jpg',
    ],
    sizes: ['Coffret 24 Pièces (6 pers.)', 'Coffret Prestige 36 Pièces (+8 000 FCFA)'],
    colors: [
      { name: 'Noir Mat & Or Brillant', hex: '#1C1917' },
      { name: 'Tout Or Miroir', hex: '#D97706' },
      { name: 'Argent & Or Royal', hex: '#E5E7EB' }
    ],
    inStock: true,
    stockCount: 22,
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 35,
    sku: 'FS-ART-CVT-24'
  },
  {
    id: 'prod-lamp-flame',
    name: 'Diffuseur d\'Huiles & Humidificateur Effet Flamme 3D "Aura Flame"',
    slug: 'diffuseur-huiles-humidificateur-effet-flamme-3d',
    category: 'deco-maison',
    price: 16500,
    originalPrice: 22000,
    description: 'Créez une atmosphère apaisante et chaleureuse dans votre salon ou chambre à coucher. Ce diffuseur ultrasonique projette une brume aromatique fine illuminée par des LED simulant un feu de cheminée réaliste et réconfortant. Purifie l\'air ambiant, hydrate la peau et diffuse un parfum relaxant pendant 8 heures en continu.',
    shortDescription: 'Illusion de flamme ultra-réaliste, brumisateur silencieux & aromathérapie.',
    features: [
      'Technologie de brumisation ultrasonique à froid ultra-silencieuse (< 25 dB)',
      'Double mode d\'éclairage : flamme jaune or ambrée ou dégradé multicolore',
      'Arrêt de sécurité automatique lorsque le réservoir d\'eau est vide',
      'Capacité 200 ml : autonomie de 8 à 10 heures',
      'Alimentation universelle par câble USB Type-C inclus'
    ],
    images: [
      '/assets/images/product_lamp_diffuser_1793989506309.jpg',
    ],
    sizes: ['Standard 200ml', 'Grand Modèle 350ml (+3 500 FCFA)'],
    colors: [
      { name: 'Noir Anthracite & Bois', hex: '#18181B' },
      { name: 'Blanc Pur & Bois', hex: '#F3F4F6' }
    ],
    inStock: true,
    stockCount: 20,
    isFeatured: true,
    isNew: true,
    rating: 4.8,
    reviewCount: 52,
    sku: 'FS-DEC-FLM-01'
  },
  {
    id: 'prod-blender-portable',
    name: 'Mini Mixeur Portable Smoothie USB Rechargeable "VitalBlend Turbo"',
    slug: 'mini-mixeur-portable-smoothie-usb-vitalblend',
    category: 'gadgets',
    price: 13500,
    originalPrice: 18000,
    description: 'Le gadget indispensable pour déguster des jus de fruits frais (bissap, mangue, bouye, ananas) ou des smoothies protéinés où que vous soyez : au bureau, au sport ou en déplacement. Équipé de 6 lames tranchantes en acier inoxydable 304 et d\'un moteur puissant à 22 000 tr/min, il broie les glaçons et morceaux de fruits en moins de 30 secondes.',
    shortDescription: '6 lames inox, batterie 4000mAh puissante & bouteille étanche sans fil.',
    features: [
      '6 lames dentelées en acier chirurgical 304 ultra-puissantes',
      'Batterie rechargeable 4000mAh : préparez 15 à 20 jus par charge complète',
      'Bouteille graduée de 500 ml en matériau Tritan incassable sans BPA',
      'Système de sécurité magnétique : les lames ne démarrent que si le couvercle est verrouillé',
      'Nettoyage express : ajoutez de l\'eau, du savon et activez 10 secondes'
    ],
    images: [
      '/assets/images/product_portable_blender_1793989506503.jpg',
    ],
    sizes: ['Bouteille 500ml', 'Pack Nomade (+ Bouteille de rechange)'],
    colors: [
      { name: 'Vert Menthe Pastel', hex: '#A7F3D0' },
      { name: 'Noir Sport', hex: '#18181B' },
      { name: 'Rose Poudré', hex: '#FBCFE8' }
    ],
    inStock: true,
    stockCount: 28,
    isFeatured: false,
    isNew: true,
    rating: 4.9,
    reviewCount: 77,
    sku: 'FS-GAD-MXB-05'
  },
  {
    id: 'prod-water-dispenser',
    name: 'Distributeur d\'Eau Électrique USB Automatique "AquaSmart Pro"',
    slug: 'distributeur-eau-electrique-usb-automatique-aquasmart',
    category: 'gadgets',
    price: 8500,
    originalPrice: 13000,
    description: 'Fini l\'effort de soulever ou pomper manuellement vos lourds bidons et bonbonnes d\'eau de 10L ou 19L ! Cette pompe électrique intelligente sans fil se pose directement sur le goulot. Un seul appui tactile sur le bouton LED suffit pour remplir votre verre ou carafe d\'eau en quelques secondes. Batterie longue durée rechargeable par câble USB.',
    shortDescription: 'Pompe automatique pour bidon 19L, bouton tactile LED & batterie USB rechargeable.',
    features: [
      'Compatible universelle avec bidons et bonbonnes standards de 5L, 10L et 19L',
      'Débit rapide de 1.5 litre/minute avec arrêt automatique préventif',
      'Tuyau d\'aspiration en silicone alimentaire 100% sans BPA et inodore',
      'Batterie lithium 1200mAh : jusqu\'à 6 bonbonnes de 19L avec une seule charge',
      'Bouton tactile avec rétroéclairage bleu et voyant de charge'
    ],
    images: [
      '/assets/images/product_water_dispenser_1794319555034.jpg',
    ],
    sizes: ['Pompe Standard USB-C', 'Pack Famille (+ Filtre & Tuyau silicone)'],
    colors: [
      { name: 'Noir Mat & Chrome', hex: '#18181B' },
      { name: 'Blanc Épuré & Or Rose', hex: '#F9FAFB' }
    ],
    inStock: true,
    stockCount: 42,
    isFeatured: false,
    isNew: true,
    rating: 4.8,
    reviewCount: 61,
    sku: 'FS-GAD-PMP-12'
  }
];

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-dakar-centre',
    name: 'Dakar Centre & Plateau',
    area: 'Plateau, Médina, Fann, Point E, Colobane, Fass, Liberté',
    price: 1500,
    estimatedDelay: 'Livraison express en 2h à 4h chrono'
  },
  {
    id: 'zone-dakar-nord',
    name: 'Dakar Ouest & Almadies',
    area: 'Almadies, Ngor, Ouakam, Mermoz, Sacré-Cœur, Yoff, Mamelles',
    price: 1500,
    estimatedDelay: 'Livraison express en 2h à 4h chrono'
  },
  {
    id: 'zone-dakar-banlieue',
    name: 'Grand Dakar & Banlieue',
    area: 'Guédiawaye, Pikine, Parcelles Assainies, Keur Massar, Rufisque, Diamniadio',
    price: 2000,
    estimatedDelay: 'Livraison sous 24h ouvrées'
  },
  {
    id: 'zone-regions-thies',
    name: 'Thiès, Mbour & Petite Côte',
    area: 'Thiès ville, Mbour, Saly Portudal, Somone, Popenguine',
    price: 3000,
    estimatedDelay: 'Livraison en 24h à 48h par transporteur'
  },
  {
    id: 'zone-regions-eloignees',
    name: 'Toutes autres Régions du Sénégal',
    area: 'Saint-Louis, Touba, Kaolack, Ziguinchor, Tambacounda, Kolda, etc.',
    price: 4000,
    estimatedDelay: 'Livraison sous 48h à 72h avec paiement sécurisé'
  }
];

export const PROMO_CODES: PromoCode[] = [
  {
    code: 'FRIDAY10',
    discountType: 'percentage',
    value: 10,
    description: '10% de réduction immédiate sur tous les articles'
  },
  {
    code: 'DAKARVIP',
    discountType: 'fixed',
    value: 3000,
    minOrderAmount: 30000,
    description: '3 000 FCFA de remise dès 30 000 FCFA d\'achats'
  },
  {
    code: 'TERANGA',
    discountType: 'fixed',
    value: 1500,
    description: '1 500 FCFA de réduction (frais de livraison offerts)'
  }
];

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Mariama Ndiaye',
    city: 'Dakar (Mermoz)',
    rating: 5,
    comment: 'L\'Air Fryer 6L est un pur bonheur ! Reçu en 2h chrono chez moi à Mermoz. Le livreur m\'a laissé ouvrir le carton pour tester l\'appareil avant que je paye par Wave. Service au top, je recommande vivement.',
    date: 'Hier',
    verified: true,
    productName: 'Friteuse Sans Huile 6L "AirFry Pro"'
  },
  {
    id: 'rev-2',
    author: 'El Hadji Malick Sy',
    city: 'Dakar (Almadies)',
    rating: 5,
    comment: 'J\'ai acheté les écouteurs sans fil TWS et le mini vidéoprojecteur HD. L\'image du projecteur est incroyable sur le mur de mon salon et le son est très net. Livraison ultra rapide en 3h.',
    date: 'Il y a 2 jours',
    verified: true,
    productName: 'Mini Vidéoprojecteur HD "CineView Ultra"'
  },
  {
    id: 'rev-3',
    author: 'Aïda Diop',
    city: 'Thiès',
    rating: 5,
    comment: 'J\'avais peur que les assiettes en céramique arrivent cassées jusqu\'à Thiès, mais l\'emballage avec papier bulle était parfait, aucune égratignure ! Le vert émeraude avec les dorures est magnifique sur ma table.',
    date: 'Il y a 5 jours',
    verified: true,
    productName: 'Service de Table Céramique "Emerald Luxury"'
  },
  {
    id: 'rev-4',
    author: 'Amadou Bamba Cissé',
    city: 'Dakar (Plateau)',
    rating: 5,
    comment: 'Commande passée directement via le bouton WhatsApp en 30 secondes. Confirmation immédiate et coursier courtois. Le diffuseur effet flamme donne une ambiance incroyable dans mon salon.',
    date: 'Il y a 1 semaine',
    verified: true,
    productName: 'Diffuseur d\'Huiles "Aura Flame"'
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'produits',
    question: 'Puis-je vérifier ou tester le produit avant de payer le livreur ?',
    answer: 'Oui, absolument ! Chez Friday Store, nous savons qu\'inspirer confiance est essentiel. Lorsque le coursier se présente chez vous à Dakar ou dans les régions, vous avez le droit d\'ouvrir le colis et de vérifier l\'article avant de remettre les espèces ou de valider le paiement Wave ou Orange Money.'
  },
  {
    id: 'faq-2',
    category: 'paiement',
    question: 'Quels sont les moyens de paiement acceptés au Sénégal ?',
    answer: 'Nous acceptons Wave Sénégal (sans aucuns frais supplémentaires par scan QR ou transfert direct au numéro officiel 77 094 89 94), Orange Money Sénégal, ainsi que le paiement en liquide (espèces) à la livraison en mains propres.'
  },
  {
    id: 'faq-3',
    category: 'livraison',
    question: 'Quels sont les délais et tarifs de livraison à Dakar et en région ?',
    answer: 'À Dakar (Plateau, Almadies, Mermoz, Ouakam, etc.), la livraison s\'effectue en 2 à 4 heures ou le jour même au tarif fixe de 1 500 FCFA (2 000 FCFA en grande banlieue). Pour les régions (Thiès, Saint-Louis, Mbour, Touba, Ziguinchor...), nous expédions quotidiennement pour une réception sous 24h à 72h (3 000 à 4 000 FCFA).'
  },
  {
    id: 'faq-4',
    category: 'retours',
    question: 'Quelle est la garantie sur les appareils électroniques et l\'électroménager ?',
    answer: 'Tous nos articles électroniques et petit électroménager bénéficient d\'une garantie de remplacement immédiat de 14 jours en cas de défaut technique d\'usine. Un simple message sur notre WhatsApp client avec votre numéro de commande suffit pour enclencher le remplacement.'
  },
  {
    id: 'faq-5',
    category: 'produits',
    question: 'Comment commander rapidement sans créer de compte ?',
    answer: 'C\'est très simple : vous pouvez ajouter vos articles à votre panier et valider en renseignant uniquement votre nom, téléphone et quartier, OU cliquer sur le bouton vert « Commander sur WhatsApp » présent sur chaque produit pour échanger directement avec un conseiller commercial.'
  },
  {
    id: 'faq-6',
    category: 'produits',
    question: 'Comment fonctionne la commande et la livraison sans boutique physique ?',
    answer: 'Friday Store est une boutique 100% en ligne optimisée pour le Sénégal : nous expédions directement depuis notre plateforme logistique de Dakar vers votre domicile ou bureau en 2h à 4h. Pour vous offrir la même tranquillité qu\'en magasin, vous testez et vérifiez toujours votre article avec le coursier avant de payer.'
  },
  {
    id: 'faq-7',
    category: 'produits',
    question: 'Comment garantissez-vous que la vaisselle n\'arrive pas cassée ?',
    answer: 'Nos services de table et articles fragiles bénéficient d\'un emballage renforcé multicouches (mousse haute densité, bulles d\'air antichoc et carton double cannelure). En cas d\'incident exceptionnel de transport, toute pièce endommagée est immédiatement remplacée à nos frais.'
  },
  {
    id: 'faq-8',
    category: 'livraison',
    question: 'Comment puis-je suivre l\'état de mon colis en cours d\'acheminement ?',
    answer: 'Rendez-vous dans la rubrique « Suivi Colis » de notre site et saisissez votre référence de commande (ex: FS-26-XXXX) ou votre numéro de téléphone. Vous pouvez aussi contacter directement le livreur sur WhatsApp dès son départ.'
  }
];
