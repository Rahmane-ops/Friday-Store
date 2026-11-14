import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingBag,
  Check,
  Share2,
  Clock,
  Sparkles,
  PackageCheck
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatFCFA, generateWhatsAppOrderLink } from '../utils/shopCalculations';
import { parseInlineRichDescription, resolveProductRichSections } from '../utils/richDescription';
import { Product } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { selectedProduct, products, addToCart, navigateTo, setIsCartOpen, showToast } = useShop();

  // If no product selected, fallback to the first
  const product = selectedProduct || products[0];

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: 'Standard', hex: '#000000' });
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'materials' | 'delivery'>('desc');
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);

  useEffect(() => {
    setSelectedSize(product.sizes[0] || 'Standard');
    setSelectedColor(product.colors[0] || { name: 'Standard', hex: '#000000' });
    setQuantity(1);
    setSelectedImageIdx(0);
  }, [product.id]);

  const safeImageIdx = selectedImageIdx < (product.images?.length || 1) ? selectedImageIdx : 0;
  const activeImageUrl = product.images[safeImageIdx] || product.images[0];
  const parsedInlineDescription = parseInlineRichDescription(product.description);
  const dynamicSections = resolveProductRichSections(product);

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsCartOpen(true);
  };

  const whatsAppDirectUrl = generateWhatsAppOrderLink({
    singleProduct: {
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor.name,
      sku: product.sku,
    },
    total: product.price * quantity,
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Découvre « ${product.name} » sur Friday Store Dakar :`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Lien de la fiche produit copié !');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigateTo('shop')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#4A635B] hover:text-[#10332C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </button>
      </div>

      {/* Main Contiguous PDP Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[#10332C]/10 bg-white shadow-xl">
            <img
              src={activeImageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.originalPrice && (
              <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#10332C] text-[#C99E69] shadow-md">
                Économisez {formatFCFA(product.originalPrice - product.price)}
              </span>
            )}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#10332C] backdrop-blur-md transition-colors shadow-md"
              aria-label="Partager cet article"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white ${
                    safeImageIdx === idx
                      ? 'border-[#10332C] ring-2 ring-[#C99E69]/40'
                      : 'border-[#D5E5DE] opacity-75 hover:opacity-100'
                  }`}
                  aria-label={`Afficher la photo ${idx + 1}`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} - vue ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-[#4A635B]">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-[#C99E69]" />
              Photos réelles &amp; produit contrôlé par notre équipe qualité à Dakar
            </span>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#10332C]/10 shadow-lg">
          
          {/* Header & Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6A887E]">
              <span className="uppercase tracking-wider font-bold text-[#C99E69]">
                {product.category.replace('-', ' ')} · Réf. {product.sku}
              </span>
              <div className="flex items-center gap-1 text-[#C99E69]">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-[#10332C] text-xs font-mono">{product.rating}</span>
                <span className="text-[10px] text-[#6A887E]">({product.reviewCount} avis)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10332C] tracking-tight leading-tight">
              {product.name}
            </h1>
            
            <p className="text-xs sm:text-sm text-[#4A635B] leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Pricing Block */}
          <div className="p-4 rounded-2xl bg-[#EBF4F0] border border-[#10332C]/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#4A635B] uppercase tracking-wider block font-medium">Prix au Sénégal :</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#10332C]">
                  {formatFCFA(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-[#8EA89F] line-through font-mono">
                    {formatFCFA(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse" />
                En stock Dakar ({product.stockCount} dispos)
              </span>
            </div>
          </div>

          {/* Variants: Options / Modèles */}
          {product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#2C483F] font-bold">Sélectionnez le modèle / capacité :</span>
                <span className="text-[#10332C] font-semibold">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      selectedSize === s
                        ? 'bg-[#10332C] text-[#C99E69] border-[#10332C] shadow-xs'
                        : 'bg-[#F8FAF9] text-[#4A635B] border-[#10332C]/10 hover:border-[#10332C]/30'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors / Finitions */}
          {product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#2C483F] font-bold">Couleur / Finition :</span>
                <span className="text-[#10332C] font-semibold">{selectedColor.name}</span>
              </div>
              <div className="flex gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    className={`group relative p-1 rounded-full border-2 transition-all ${
                      selectedColor.name === c.name ? 'border-[#10332C] scale-110' : 'border-transparent'
                    }`}
                    title={c.name}
                  >
                    <span
                      className="block w-6 h-6 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs text-[#2C483F] font-bold">Quantité :</span>
            <div className="flex items-center border border-[#10332C]/15 rounded-xl bg-[#F8FAF9]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-xs text-[#10332C] hover:bg-[#EBF4F0] font-bold rounded-l-xl"
              >
                -
              </button>
              <span className="px-4 py-1.5 text-xs font-mono font-bold text-[#10332C]">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                className="px-3 py-1.5 text-xs text-[#10332C] hover:bg-[#EBF4F0] font-bold rounded-r-xl"
              >
                +
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#17463B] hover:to-[#226353] text-[#F9F7F2] font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-[#10332C]/20 hover:scale-[1.01]"
            >
              <ShoppingBag className="w-5 h-5 text-[#C99E69]" />
              Ajouter au panier ({formatFCFA(product.price * quantity)})
            </button>

            <a
              href={whatsAppDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] border border-[#20BA5A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#25D366]/20"
            >
              <svg
                className="w-4 h-4 fill-current shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.49 0 .16 5.33.16 11.9c0 2.1.55 4.15 1.59 5.96L0 24l6.31-1.65a11.86 11.86 0 0 0 5.74 1.47h.01c6.57 0 11.9-5.33 11.9-11.9 0-3.18-1.24-6.17-3.44-8.44Zm-8.46 18.33h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.88 9.88 0 0 1-1.51-5.28c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.46-4.44 9.9-9.91 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
              </svg>
              Commander directement sur WhatsApp (1-Clic)
            </a>
          </div>

          {/* Reassurance Micro-Badges */}
          <div className="p-4 rounded-2xl bg-[#F6FAF8] border border-[#10332C]/10 text-xs text-[#2C483F] space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C99E69] shrink-0" />
              <span>Livré en <strong>2h à 4h</strong> à Dakar · 48h dans les régions</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Inspection avant paiement :</strong> Testez l'appareil avec le coursier</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#C99E69] shrink-0" />
              <span>Garantie échange immédiat <strong>14 jours</strong></span>
            </div>
          </div>

        </div>

      </div>

      {/* Product Details Tabs (Description / Technical Specs / Delivery) */}
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-3 border-b border-[#10332C]/10 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('desc')}
            className={`text-xs sm:text-sm font-bold transition-colors py-2 border-b-2 whitespace-nowrap ${
              activeTab === 'desc'
                ? 'text-[#10332C] border-[#10332C]'
                : 'text-[#6A887E] border-transparent hover:text-[#10332C]'
            }`}
          >
            Description Détaillée &amp; Galerie
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`text-xs sm:text-sm font-bold transition-colors py-2 border-b-2 whitespace-nowrap ${
              activeTab === 'materials'
                ? 'text-[#10332C] border-[#10332C]'
                : 'text-[#6A887E] border-transparent hover:text-[#10332C]'
            }`}
          >
            Garantie &amp; Conformité
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`text-xs sm:text-sm font-bold transition-colors py-2 border-b-2 whitespace-nowrap ${
              activeTab === 'delivery'
                ? 'text-[#10332C] border-[#10332C]'
                : 'text-[#6A887E] border-transparent hover:text-[#10332C]'
            }`}
          >
            Délais &amp; Tarifs de Livraison
          </button>
        </div>

        {activeTab === 'desc' && (
          <div className="space-y-8">
            {/* Long Description Card with Inline Headings & Markdown Images */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#10332C]/10 shadow-sm space-y-5 text-xs sm:text-sm text-[#2C483F] leading-relaxed">
              {parsedInlineDescription.length > 0 ? (
                <div className="space-y-4">
                  {parsedInlineDescription.map((node, idx) => {
                    if (node.kind === 'heading') {
                      return (
                        <h3
                          key={`desc-hd-${idx}`}
                          className="text-base sm:text-lg font-extrabold text-[#10332C] pt-2"
                        >
                          {node.text}
                        </h3>
                      );
                    }
                    if (node.kind === 'image') {
                      return (
                        <figure
                          key={`desc-img-${idx}`}
                          className="my-4 rounded-2xl overflow-hidden border border-[#10332C]/10 bg-[#F8FAF9]"
                        >
                          <img
                            src={node.url}
                            alt={node.caption || product.name}
                            className="w-full max-h-[460px] object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {node.caption && (
                            <figcaption className="px-4 py-2.5 text-[11px] font-medium text-[#4A635B] bg-white border-t border-[#EAF2EE]">
                              {node.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }
                    return <p key={`desc-p-${idx}`}>{node.text}</p>;
                  })}
                </div>
              ) : (
                <p>{product.description}</p>
              )}

              {product.features.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#EAF2EE]">
                  <h4 className="font-bold text-[#10332C] text-sm">Points forts &amp; Caractéristiques :</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[#4A635B]">
                    {product.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAF9] border border-[#EAF2EE]"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Dynamic Visual Sections (Admin Custom Rich Blocks or Dynamic Gallery Showcase) */}
            {dynamicSections.length > 0 && (
              <div className="space-y-6">
                {dynamicSections.map((sec) => {
                  if (sec.type === 'split') {
                    const imgRight = sec.imagePosition === 'right';
                    return (
                      <div
                        key={sec.id}
                        className="p-6 sm:p-8 rounded-3xl bg-white border border-[#10332C]/10 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center"
                      >
                        {sec.imageUrl && (
                          <div
                            className={`md:col-span-6 ${
                              imgRight ? 'md:order-2' : 'md:order-1'
                            }`}
                          >
                            <figure className="rounded-2xl overflow-hidden border border-[#10332C]/10 bg-[#F8FAF9] shadow-xs">
                              <img
                                src={sec.imageUrl}
                                alt={sec.imageCaption || sec.title || product.name}
                                className="w-full aspect-[4/3] object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {sec.imageCaption && (
                                <figcaption className="px-3.5 py-2 text-[11px] text-[#4A635B] bg-white border-t border-[#EAF2EE]">
                                  {sec.imageCaption}
                                </figcaption>
                              )}
                            </figure>
                          </div>
                        )}
                        <div
                          className={`${sec.imageUrl ? 'md:col-span-6' : 'md:col-span-12'} ${
                            imgRight ? 'md:order-1' : 'md:order-2'
                          } space-y-3`}
                        >
                          {sec.title && (
                            <h3 className="text-lg sm:text-xl font-extrabold text-[#10332C] leading-snug">
                              {sec.title}
                            </h3>
                          )}
                          {sec.body && (
                            <div className="space-y-2.5 text-xs sm:text-sm text-[#4A635B] leading-relaxed whitespace-pre-line">
                              {sec.body}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (sec.type === 'image' && sec.imageUrl) {
                    return (
                      <figure
                        key={sec.id}
                        className="rounded-3xl overflow-hidden border border-[#10332C]/10 bg-white shadow-sm"
                      >
                        {sec.title && (
                          <div className="px-6 pt-5 pb-3">
                            <h3 className="text-base sm:text-lg font-extrabold text-[#10332C]">
                              {sec.title}
                            </h3>
                          </div>
                        )}
                        <img
                          src={sec.imageUrl}
                          alt={sec.imageCaption || sec.title || product.name}
                          className="w-full max-h-[480px] object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {(sec.imageCaption || sec.body) && (
                          <figcaption className="p-5 sm:px-6 bg-[#F8FAF9] border-t border-[#EAF2EE] space-y-1">
                            {sec.imageCaption && (
                              <p className="text-xs font-bold text-[#10332C]">{sec.imageCaption}</p>
                            )}
                            {sec.body && (
                              <p className="text-xs text-[#4A635B] leading-relaxed whitespace-pre-line">
                                {sec.body}
                              </p>
                            )}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }

                  if (sec.type === 'highlights') {
                    const items = (sec.body || '')
                      .split('\n')
                      .map((l) => l.trim())
                      .filter(Boolean);
                    return (
                      <div
                        key={sec.id}
                        className="p-6 sm:p-8 rounded-3xl bg-[#F6FAF8] border border-[#10332C]/10 shadow-xs space-y-4"
                      >
                        {sec.title && (
                          <h3 className="text-base sm:text-lg font-extrabold text-[#10332C]">
                            {sec.title}
                          </h3>
                        )}
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#2C483F]">
                          {items.map((line, i) => (
                            <li
                              key={`${sec.id}-hl-${i}`}
                              className="flex items-start gap-2.5 bg-white p-3 rounded-2xl border border-[#D5E5DE]"
                            >
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={sec.id}
                      className="p-6 sm:p-8 rounded-3xl bg-white border border-[#10332C]/10 shadow-sm space-y-3"
                    >
                      {sec.title && (
                        <h3 className="text-base sm:text-lg font-extrabold text-[#10332C]">
                          {sec.title}
                        </h3>
                      )}
                      {sec.body && (
                        <p className="text-xs sm:text-sm text-[#4A635B] leading-relaxed whitespace-pre-line">
                          {sec.body}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="p-6 rounded-2xl bg-white border border-[#10332C]/10 shadow-sm space-y-4 text-xs sm:text-sm text-[#2C483F] leading-relaxed">
            <h4 className="font-bold text-[#10332C]">Contrôle Qualité &amp; Sérénité</h4>
            <p>
              Chaque produit proposé par Friday Store fait l'objet d'un contrôle visuel et technique préalable par notre équipe à Dakar avant expédition.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#4A635B] pl-2">
              <li>Appareils certifiés conformes CE et normes électriques sénégalaises (220V).</li>
              <li>Prise standard européenne / sénégalaise sans besoin d'adaptateur.</li>
              <li>Remplacement gratuit sous 14 jours si le moindre dysfonctionnement apparaît.</li>
            </ul>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="p-6 rounded-2xl bg-white border border-[#10332C]/10 shadow-sm space-y-3 text-xs sm:text-sm text-[#2C483F] leading-relaxed">
            <h4 className="font-bold text-[#10332C]">Expéditions Express au Sénégal</h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#4A635B] pl-2">
              <li><strong>Dakar (Centre &amp; Almadies) :</strong> Livraison en 2 à 4h. Tarif : 1 500 FCFA.</li>
              <li><strong>Banlieue (Pikine, Guédiawaye, Rufisque) :</strong> Livraison en 24h. Tarif : 2 000 FCFA.</li>
              <li><strong>Régions (Thiès, Mbour, Saint-Louis, Touba...) :</strong> Livraison sous 24h à 48h. Tarif : 3 000 à 4 000 FCFA.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Similar Products Recommendation */}
      <div className="space-y-6 pt-6 border-t border-[#10332C]/10">
        <h3 className="text-xl font-extrabold text-[#10332C]">Produits similaires recommandés</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {relatedProducts.map((rel) => (
            <div
              key={rel.id}
              onClick={() => {
                navigateTo('product-detail', rel);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer rounded-2xl bg-white border border-[#10332C]/10 hover:border-[#10332C]/30 p-4 transition-all shadow-xs hover:shadow-lg space-y-3"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-[#F6FAF8]">
                <img
                  src={rel.images[0]}
                  alt={rel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-[10px] text-[#C99E69] uppercase tracking-wider font-bold block">{rel.category}</span>
                <h4 className="text-xs font-bold text-[#10332C] truncate group-hover:text-[#17463B] transition-colors">
                  {rel.name}
                </h4>
                <p className="text-xs font-mono font-bold text-[#10332C] mt-1">{formatFCFA(rel.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
