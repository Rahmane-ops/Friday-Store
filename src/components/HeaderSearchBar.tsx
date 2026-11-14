import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  ShoppingBag,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Tag,
  Check
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product, ProductCategory } from '../types';
import { formatFCFA } from '../utils/shopCalculations';
import { filterProductsBySearch } from '../utils/searchFilter';

interface HeaderSearchBarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

const CATEGORY_LABELS: { value: ProductCategory; label: string; icon: string }[] = [
  { value: 'tous', label: 'Tous', icon: '✨' },
  { value: 'electromenager', label: 'Électroménager', icon: '🍳' },
  { value: 'electronique', label: 'High-Tech', icon: '🎧' },
  { value: 'vaisselle', label: 'Vaisselle', icon: '🍽️' },
  { value: 'deco-maison', label: 'Déco Maison', icon: '🕯️' },
  { value: 'gadgets', label: 'Gadgets', icon: '⚡' },
];

const POPULAR_SEARCHES = [
  'Air Fryer',
  'Écouteurs Pro',
  'Mixeur',
  'Diffuseur Flamme',
  'Assiettes Dorées',
  'Veilleuse Tactile'
];

export const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({
  isMobile = false,
  onCloseMobile,
  className = ''
}) => {
  const {
    products,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    navigateTo,
    addToCart,
    showToast
  } = useShop();

  const [isOpen, setIsOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products in real time based on query and active category
  const filteredResults = useMemo(() => {
    return filterProductsBySearch(products, searchQuery, selectedCategory);
  }, [products, searchQuery, selectedCategory]);

  const handleSelectProduct = (product: Product) => {
    navigateTo('product-detail', product);
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0] || 'Standard', product.colors[0] || { name: 'Standard', hex: '#000' }, 1);
    setAddedProductId(product.id);
    showToast(`« ${product.name} » ajouté au panier !`);
    setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 1800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    navigateTo('shop');
    if (onCloseMobile) onCloseMobile();
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCategory('tous');
    inputRef.current?.focus();
  };

  const handleCategoryClick = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    setIsOpen(true);
  };

  const handlePopularSearchClick = (term: string) => {
    setSearchQuery(term);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  // Highlight search text helper
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-[#C99E69]/30 text-[#10332C] font-black rounded px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#10332C] pointer-events-none">
          <Search className="w-4 h-4 text-[#10332C]" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          placeholder="Rechercher un produit, électro, vaisselle, high-tech..."
          className="w-full pl-10 pr-24 py-2 sm:py-2.5 bg-[#F6FAF8] hover:bg-white focus:bg-white text-xs sm:text-sm text-[#10332C] placeholder-[#689487] border border-[#10332C]/15 focus:border-[#10332C] rounded-xl transition-all shadow-xs focus:ring-2 focus:ring-[#10332C]/10 outline-none"
        />

        {/* Clear Button & Search CTA */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-[#689487] hover:text-[#10332C] hover:bg-[#EBF4F0] transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="px-2.5 py-1 bg-[#10332C] hover:bg-[#1A4C40] text-[#C99E69] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>Filtrer</span>
          </button>
        </div>
      </form>

      {/* Real-time Results Dropdown Overlay */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#D5E5DE] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${
            isMobile ? 'max-h-[75vh]' : 'max-h-[480px]'
          } flex flex-col`}
        >
          {/* Category Filter Pills in Dropdown */}
          <div className="p-3 bg-[#F8FAF9] border-b border-[#EAF2EE] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#4A635B]">
              <span className="font-bold uppercase tracking-wider text-[#10332C] flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-[#C99E69]" />
                Filtrer par catégorie en temps réel :
              </span>
              <span className="font-mono text-xs font-semibold text-[#10332C]">
                {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORY_LABELS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
                    selectedCategory === cat.value
                      ? 'bg-[#10332C] text-[#C99E69] font-bold shadow-xs'
                      : 'bg-white border border-[#D5E5DE] text-[#2C483F] hover:bg-[#EBF4F0]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results List or Empty State */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {filteredResults.length > 0 ? (
              filteredResults.slice(0, 6).map((product) => {
                const categoryLabel = CATEGORY_LABELS.find((c) => c.value === product.category)?.label || product.category;
                const isJustAdded = addedProductId === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F6FAF8] transition-colors cursor-pointer border border-transparent hover:border-[#D5E5DE]"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#EBF4F0] border border-[#10332C]/10 shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#EBF4F0] text-[#10332C]">
                          {categoryLabel}
                        </span>
                        {product.inStock && (
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            ● En stock Dakar
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-[#10332C] truncate mt-0.5">
                        {highlightMatch(product.name, searchQuery)}
                      </h4>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono font-extrabold text-[#10332C]">
                          {formatFCFA(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[10px] font-mono text-neutral-400 line-through">
                            {formatFCFA(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Add Button */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, product)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#10332C]/10 text-[#10332C] hover:bg-[#10332C] hover:text-[#C99E69]'
                        }`}
                        title="Ajouter directement au panier"
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Ajouté</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">+ Panier</span>
                          </>
                        )}
                      </button>

                      <ChevronRight className="w-4 h-4 text-[#8EA89F] group-hover:text-[#10332C] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EBF4F0] text-[#10332C] flex items-center justify-center mx-auto">
                  <Search className="w-5 h-5 text-[#8EA89F]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#10332C]">
                    Aucun produit ne correspond à « {searchQuery} »
                  </p>
                  <p className="text-[11px] text-[#4A635B] mt-0.5">
                    Modifiez vos mots-clés ou sélectionnez une autre catégorie.
                  </p>
                </div>

                {/* Popular searches suggestions */}
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-[#8EA89F] uppercase tracking-wider mb-2">
                    Suggestions populaires :
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handlePopularSearchClick(term)}
                        className="px-2.5 py-1 rounded-full bg-[#F6FAF8] hover:bg-[#EBF4F0] border border-[#D5E5DE] text-xs text-[#10332C] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar: View All in Boutique */}
          <div className="p-3 bg-[#F8FAF9] border-t border-[#EAF2EE] flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#4A635B] truncate">
              {searchQuery ? (
                <>
                  Recherche : <strong className="text-[#10332C]">« {searchQuery} »</strong>
                </>
              ) : (
                'Tapez pour filtrer en temps réel'
              )}
            </span>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#17463B] hover:to-[#226353] text-[#F9F7F2] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
            >
              <span>Voir tout dans la boutique</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C99E69]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
