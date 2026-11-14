import React from 'react';
import { ArrowRight, MessageCircle, Star, Sparkles, Check, ChevronRight, Eye, ShoppingBag, ShieldCheck, Zap, PackageCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatFCFA, generateWhatsAppOrderLink } from '../utils/shopCalculations';
import { CUSTOMER_REVIEWS } from '../data/mockData';
import { Product } from '../types';

export const HomePage: React.FC = () => {
  const { products, navigateTo, addToCart } = useShop();

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 3);
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);

  const categories = [
    {
      name: 'Électroménager & Cuisine',
      cat: 'electromenager',
      count: products.filter((p) => p.category === 'electromenager').length,
      image: '/assets/images/product_airfryer_digital_1793989489237.jpg',
      tagline: 'Friteuses sans huile Air Fryer, hachoirs & cuisson saine',
    },
    {
      name: 'Électronique & High-Tech',
      cat: 'electronique',
      count: products.filter((p) => p.category === 'electronique').length,
      image: '/assets/images/product_tws_earbuds_pro_1793989490182.jpg',
      tagline: 'Écouteurs TWS Bluetooth, mini projecteurs HD & accessoires',
    },
    {
      name: 'Vaisselle & Art de la Table',
      cat: 'vaisselle',
      count: products.filter((p) => p.category === 'vaisselle').length,
      image: '/assets/images/product_tableware_ceramic_1793989490259.jpg',
      tagline: 'Services d\'assiettes céramique moderne & couverts dorés',
    },
    {
      name: 'Déco Maison & Ambiance',
      cat: 'deco-maison',
      count: products.filter((p) => p.category === 'deco-maison').length,
      image: '/assets/images/product_lamp_diffuser_1793989506309.jpg',
      tagline: 'Diffuseurs effet flamme, lampes LED tactiles & rangements',
    },
    {
      name: 'Gadgets & Tendance',
      cat: 'gadgets',
      count: products.filter((p) => p.category === 'gadgets').length,
      image: '/assets/images/product_portable_blender_1793989506503.jpg',
      tagline: 'Mixeurs portables USB, gadgets viraux & accessoires malins',
    },
  ];

  const handleProductClick = (prod: Product) => {
    navigateTo('product-detail', prod);
  };

  const handleQuickAdd = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    addToCart(prod, prod.sizes[0], prod.colors[0], 1);
  };

  const heroWhatsAppLink = generateWhatsAppOrderLink({
    singleProduct: {
      name: 'Top Ventes Dropshipping & Maison Friday Store Dakar',
      price: 42000,
    },
  });

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Banner Section with Soft Green-to-White Radiant Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF4F0] via-[#F6FAF8] to-[#F8FAF9] border-b border-[#10332C]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-[#10332C]/15 shadow-xs text-xs font-bold text-[#10332C] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#10332C]" />
                <span>Boutique Multi-Produits · Dakar</span>
                <span aria-hidden="true" className="text-[#C99E69]">·</span>
                <span className="text-[#C99E69]">Paiement à la Réception</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#10332C] tracking-tight leading-[1.1]">
                Le Meilleur de l'Électronique, Maison &amp; Gadgets à <span className="text-[#C99E69]">Dakar</span>.
              </h1>

              <p className="text-base sm:text-lg text-[#2C483F] max-w-xl leading-relaxed">
                Trouvez les produits les plus tendances et pratiques pour votre quotidien : Air Fryers, écouteurs sans fil, vaisselle de luxe, décoration et gadgets viraux. Livrés sous 2 à 4h à Dakar avec inspection avant paiement !
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => navigateTo('shop')}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#17463B] hover:to-[#226353] text-[#F9F7F2] font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#10332C]/20 hover:scale-[1.01]"
                >
                  Explorer Tous les Produits
                  <ArrowRight className="w-4 h-4 text-[#C99E69]" />
                </button>

                <a
                  href={heroWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-xl bg-white hover:bg-[#F6FAF8] border border-[#10332C]/20 text-[#10332C] font-bold text-sm flex items-center justify-center gap-2.5 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Commander sur WhatsApp
                </a>
              </div>

              {/* Local Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#10332C]/10">
                <div className="text-left">
                  <span className="block text-lg font-mono font-extrabold text-[#10332C]">2H - 4H</span>
                  <span className="text-[11px] text-[#4A635B] font-medium">Livraison Express Dakar</span>
                </div>
                <div className="text-left">
                  <span className="block text-lg font-mono font-extrabold text-[#10332C]">Test &amp; Pay</span>
                  <span className="text-[11px] text-[#4A635B] font-medium">Vérifiez avant de payer</span>
                </div>
                <div className="text-left">
                  <span className="block text-lg font-mono font-extrabold text-[#10332C]">Wave &amp; OM</span>
                  <span className="text-[11px] text-[#4A635B] font-medium">0% frais de transaction</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#10332C]/15 shadow-2xl bg-white group">
                <img
                  src="/assets/images/hero_friday_dropship_banner_1793989489653.jpg"
                  alt="Catalogue Friday Store Dakar électronique maison électroménager et gadgets"
                  className="w-full h-[450px] sm:h-[500px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10332C]/90 via-[#10332C]/20 to-transparent" />
                
                {/* Floating Tag Card */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#10332C]/15 shadow-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#C99E69] font-bold uppercase tracking-widest block">
                      Tendance Cuisine
                    </span>
                    <h3 className="text-sm font-bold text-[#10332C]">Air Fryer 6L Digital Touch</h3>
                    <p className="text-[11px] text-[#4A635B]">Cuisson saine sans matière grasse</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-[#10332C] block">42 000 FCFA</span>
                    <button
                      onClick={() => navigateTo('shop')}
                      className="text-xs text-[#10332C] font-bold hover:underline"
                    >
                      Voir le produit &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Multi-Rayons Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#10332C]/10 pb-4">
          <div>
            <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider">Rayons</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10332C] tracking-tight mt-1">
              Nos Catégories Principales
            </h2>
          </div>
          <button
            onClick={() => navigateTo('shop')}
            className="text-xs font-bold text-[#10332C] hover:text-[#17463B] flex items-center gap-1 transition-colors"
          >
            Voir toute la boutique
            <ChevronRight className="w-4 h-4 text-[#C99E69]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((c) => (
            <div
              key={c.cat}
              onClick={() => navigateTo('shop')}
              className="group cursor-pointer rounded-2xl bg-white border border-[#10332C]/10 p-4 hover:border-[#10332C]/30 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-[#F6FAF8] mb-3 relative">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#10332C] text-sm group-hover:text-[#17463B] transition-colors leading-tight">
                  {c.name}
                </h3>
                <p className="text-[11px] text-[#4A635B] line-clamp-2">{c.tagline}</p>
              </div>
              <div className="pt-3 mt-2 border-t border-[#10332C]/5 flex items-center justify-between text-xs font-bold text-[#10332C]">
                <span>Explorer</span>
                <span className="text-[#C99E69] group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Dropshipping Best-Sellers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#10332C]/10 pb-4">
          <div>
            <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider">Top Ventes &amp; Tendances</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10332C] tracking-tight mt-1">
              Produits Phares du Moment à Dakar
            </h2>
          </div>
          <button
            onClick={() => navigateTo('shop')}
            className="text-xs font-bold text-[#10332C] hover:text-[#17463B] flex items-center gap-1 transition-colors"
          >
            Tous les produits
            <ChevronRight className="w-4 h-4 text-[#C99E69]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleProductClick(prod)}
              className="group cursor-pointer rounded-2xl bg-white border border-[#10332C]/10 hover:border-[#10332C]/30 shadow-xs hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative aspect-4/3 overflow-hidden bg-[#F6FAF8]">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {prod.originalPrice && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#10332C] text-[#C99E69] text-xs font-bold uppercase tracking-wider shadow-sm">
                    Promo
                  </span>
                )}
                <div className="absolute inset-0 bg-[#10332C]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 rounded-xl bg-white text-[#10332C] text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Eye className="w-4 h-4" />
                    Voir détails
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#C99E69] uppercase tracking-wider font-bold">
                      {prod.category}
                    </span>
                    <div className="flex items-center gap-1 text-[#C99E69]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <strong className="text-xs text-[#10332C] font-mono">{prod.rating}</strong>
                      <span className="text-[10px] text-[#6A887E]">({prod.reviewCount})</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-[#10332C] text-base group-hover:text-[#17463B] transition-colors leading-snug">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-[#4A635B] line-clamp-2 leading-relaxed">
                    {prod.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#10332C]/5 flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold font-mono text-[#10332C]">
                      {formatFCFA(prod.price)}
                    </span>
                    {prod.originalPrice && (
                      <span className="text-xs text-[#8EA89F] line-through font-mono ml-2">
                        {formatFCFA(prod.originalPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleQuickAdd(e, prod)}
                    className="p-2.5 rounded-xl bg-[#EBF4F0] hover:bg-[#10332C] text-[#10332C] hover:text-[#F9F7F2] transition-colors"
                    aria-label={`Ajouter ${prod.name} au panier`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Reassurance Banner in Deep Pine Green */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 lg:p-12 bg-gradient-to-r from-[#10332C] via-[#143E35] to-[#1A4C40] border border-[#C99E69]/30 text-white shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider">
                Garantie Zéro Risque
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F9F7F2] tracking-tight">
                Achetez en Toute Confiance au Sénégal.
              </h2>
              <p className="text-xs sm:text-sm text-[#CFE4DC] leading-relaxed max-w-xl">
                Fini les mauvaises surprises en commandant en ligne ! Chez Friday Store, nous avons mis en place le protocole le plus transparent et rassurant de Dakar pour que chacun de vos achats soit une réussite garantie.
              </p>
              
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-center gap-3 text-[#E1EFEA]">
                  <div className="w-5 h-5 rounded-full bg-[#C99E69] text-[#10332C] flex items-center justify-center font-bold text-xs shrink-0">✓</div>
                  <span><strong>Inspection avant Paiement :</strong> Le coursier vous laisse ouvrir le colis et allumer l'appareil avant de régler.</span>
                </div>
                <div className="flex items-center gap-3 text-[#E1EFEA]">
                  <div className="w-5 h-5 rounded-full bg-[#C99E69] text-[#10332C] flex items-center justify-center font-bold text-xs shrink-0">✓</div>
                  <span><strong>Garantie Échange 14 Jours :</strong> Remplacement direct et sans frais si le moindre problème survient.</span>
                </div>
                <div className="flex items-center gap-3 text-[#E1EFEA]">
                  <div className="w-5 h-5 rounded-full bg-[#C99E69] text-[#10332C] flex items-center justify-center font-bold text-xs shrink-0">✓</div>
                  <span><strong>Assistance Locale Réactive :</strong> Support client basé à Dakar, joignable 7j/7 sur WhatsApp et téléphone.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigateTo('about')}
                  className="px-6 py-3 rounded-xl bg-white hover:bg-[#F6FAF8] text-[#10332C] font-bold text-xs shadow-md transition-colors"
                >
                  Découvrir notre engagement qualité
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-[#C99E69]/30 shadow-xl bg-[#0B211C]">
                <img
                  src="/assets/images/hero_friday_dropship_banner_1793989489653.jpg"
                  alt="Appareils testés et vérifiés par Friday Store Dakar"
                  className="w-full h-64 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-4 bg-[#0B211C] text-xs space-y-1">
                  <p className="text-[#CFE4DC] font-medium">
                    « Chaque produit est rigoureusement testé par notre équipe avant d'être proposé à notre communauté à Dakar. »
                  </p>
                  <span className="text-[11px] text-[#C99E69] font-bold block">
                    Expédition Express · Dakar &amp; Toutes Régions du Sénégal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials from Senegalese Customers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider">Avis Clients</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10332C] tracking-tight">
            Ce que disent nos acheteurs au Sénégal
          </h2>
          <p className="text-xs sm:text-sm text-[#4A635B]">
            Plus de 1 200 colis livrés avec soin à Dakar, Thiès, Saint-Louis, Mbour et Touba.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CUSTOMER_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-white border border-[#10332C]/10 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#C99E69]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#2C483F] leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#10332C]/5 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-[#10332C]">{rev.author}</strong>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Achat vérifié
                  </span>
                </div>
                <span className="text-[11px] text-[#6A887E] block truncate">
                  {rev.city} · {rev.productName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct WhatsApp Order CTA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#10332C] to-[#17463B] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider block">
              Service Client Rapide
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#F9F7F2]">
              Besoin d'un produit en urgence pour aujourd'hui à Dakar ?
            </h3>
            <p className="text-xs text-[#CFE4DC]">
              Écrivez-nous directement sur WhatsApp. Notre équipe commerciale prépare votre colis et coordonne le coursier dans l'heure.
            </p>
          </div>
          <a
            href="https://wa.me/221770948994"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#F6FAF8] text-[#10332C] font-bold text-xs sm:text-sm whitespace-nowrap shadow-md transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            Commander sur WhatsApp (+221 77 094 89 94)
          </a>
        </div>
      </section>

    </div>
  );
};
