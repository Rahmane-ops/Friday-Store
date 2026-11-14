import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Star, ShoppingBag, Eye, X, ArrowUpDown } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatFCFA } from '../utils/shopCalculations';
import { filterProductsBySearch } from '../utils/searchFilter';
import { Product, ProductCategory } from '../types';

export const ShopPage: React.FC = () => {
  const {
    products,
    navigateTo,
    addToCart,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    clearSearch
  } = useShop();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(80000);

  const categories: { label: string; value: ProductCategory }[] = [
    { label: 'Tous les rayons', value: 'tous' },
    { label: 'Électroménager', value: 'electromenager' },
    { label: 'Électronique & Tech', value: 'electronique' },
    { label: 'Vaisselle & Cuisine', value: 'vaisselle' },
    { label: 'Déco Maison', value: 'deco-maison' },
    { label: 'Gadgets du Quotidien', value: 'gadgets' },
  ];

  const filteredProducts = useMemo(() => {
    return filterProductsBySearch(products, searchQuery, selectedCategory, maxPrice).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, sortBy, maxPrice]);

  const handleQuickAdd = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    addToCart(prod, prod.sizes[0], prod.colors[0], 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Category Navigation */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider">Catalogue Généraliste</span>
            <h1 className="text-3xl font-extrabold text-[#10332C] tracking-tight mt-1">
              Boutique Friday Store Dakar
            </h1>
            <p className="text-xs sm:text-sm text-[#4A635B] mt-1">
              Électroménager, high-tech, vaisselle, déco et gadgets testés et livrés sous 2 à 4h à Dakar.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6A887E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher air fryer, écouteurs, vaisselle, gadget..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-[#10332C]/15 text-xs text-[#10332C] placeholder-[#8EA89F] focus:outline-none focus:border-[#10332C] shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6A887E] hover:text-[#10332C]"
                aria-label="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs (Interactive Segmented Bar) */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 border-b border-[#10332C]/10">
          <div className="flex items-center gap-1.5 p-1 bg-[#EAF4EF] rounded-xl border border-[#10332C]/10 shrink-0">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedCategory(c.value)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c.value
                    ? 'bg-[#10332C] text-[#C99E69] font-bold shadow-xs'
                    : 'text-[#4A635B] hover:text-[#10332C]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#6A887E]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#10332C]/15 rounded-lg px-3 py-1.5 text-xs text-[#10332C] font-semibold focus:outline-none focus:border-[#10332C] cursor-pointer shadow-xs"
            >
              <option value="featured">Populaires &amp; Phares</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating">Mieux notés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Price Slider Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#10332C]/10 shadow-xs text-xs text-[#2C483F]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-[#C99E69] shrink-0" />
          <span>Budget max : <strong className="text-[#10332C] font-mono font-bold">{formatFCFA(maxPrice)}</strong></span>
          <input
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="accent-[#10332C] w-36 cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#4A635B]">
          <span>Paiement à la livraison après inspection · Livraison offerte dès 35 000 FCFA</span>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-[#10332C]/10">
          <p className="text-base font-bold text-[#10332C]">Aucun produit ne correspond à vos filtres</p>
          <p className="text-xs text-[#4A635B]">Essayez d'augmenter votre budget ou de changer de catégorie.</p>
          <button
            onClick={() => {
              setSelectedCategory('tous');
              setSearchQuery('');
              setMaxPrice(80000);
            }}
            className="px-4 py-2 rounded-xl bg-[#10332C] text-[#C99E69] font-bold text-xs"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => navigateTo('product-detail', prod)}
              className="group cursor-pointer rounded-2xl bg-white border border-[#10332C]/10 hover:border-[#10332C]/30 shadow-xs hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-[#F6FAF8]">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {prod.originalPrice && (
                    <span className="px-2.5 py-1 rounded-md bg-[#10332C] text-[#C99E69] text-xs font-bold uppercase tracking-wider shadow-sm">
                      Promo
                    </span>
                  )}
                  {prod.isNew && (
                    <span className="px-2.5 py-1 rounded-md bg-[#EBF4F0] text-[#10332C] text-xs font-bold uppercase tracking-wider border border-[#10332C]/20 shadow-sm">
                      Nouveau
                    </span>
                  )}
                </div>

                <div className="absolute inset-0 bg-[#10332C]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 rounded-xl bg-white text-[#10332C] text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Eye className="w-4 h-4" />
                    Voir détails
                  </span>
                </div>
              </div>

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
      )}

      {/* Footer Info Pill */}
      <div className="text-center pt-8 border-t border-[#10332C]/10 text-xs text-[#6A887E]">
        Affichage de <strong>{filteredProducts.length}</strong> produit(s) disponibles à la livraison immédiate au Sénégal
      </div>

    </div>
  );
};
