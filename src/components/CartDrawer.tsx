import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, MessageCircle, Tag, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatFCFA, generateWhatsAppOrderLink } from '../utils/shopCalculations';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totals,
    promoCode,
    applyPromoCode,
    removePromoCode,
    navigateTo,
    selectedZone,
  } = useShop();

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ success?: boolean; text?: string }>({});

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoFeedback({ success: res.success, text: res.message });
    if (res.success) {
      setPromoInput('');
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigateTo('checkout');
  };

  const whatsAppOrderUrl = generateWhatsAppOrderLink({
    items: cart,
    total: totals.total,
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#10332C]/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#10332C]/10 text-[#10332C] flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-5 border-b border-[#10332C]/10 bg-gradient-to-r from-[#10332C] to-[#1A4C40] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#C99E69]/30">
                <img
                  src="/assets/aistudio/icone_friday_13e5679f.jpg"
                  alt="Friday Store"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F9F7F2]">Votre Panier</h2>
                <span className="text-[11px] text-[#CFE4DC]">{totals.itemCount} article(s)</span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-[#CFE4DC] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAF9]">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-sm font-semibold text-[#10332C]">Votre panier est encore vide</p>
                <p className="text-xs text-[#6A887E]">Ajoutez un produit d'électroménager, tech ou maison pour commencer.</p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('shop');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#10332C] text-[#C99E69] font-bold text-xs shadow-md"
                >
                  Découvrir les rayons
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-2xl bg-white border border-[#10332C]/10 shadow-xs"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-[#F6FAF8] shrink-0 border border-[#10332C]/5"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#10332C] truncate">{item.product.name}</h4>
                      <p className="text-[11px] text-[#6A887E] mt-0.5">
                        Modèle : {item.selectedSize} · {item.selectedColor.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-mono font-bold text-[#10332C]">
                        {formatFCFA(item.product.price * item.quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 border border-[#10332C]/15 rounded-lg bg-[#F8FAF9] p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-[#10332C] text-[#6A887E]"
                          aria-label="Diminuer quantité"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold px-1.5 text-[#10332C]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-[#10332C] text-[#6A887E]"
                          aria-label="Augmenter quantité"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:text-rose-600 text-[#8EA89F] ml-1"
                          aria-label="Supprimer du panier"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#10332C]/10 bg-white space-y-4">
              
              {/* Promo Code Input */}
              <div className="space-y-1.5">
                {promoCode ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      Code <strong>{promoCode.code}</strong> appliqué (-{totals.discount} FCFA)
                    </span>
                    <button
                      onClick={removePromoCode}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Code promo (ex: FRIDAY10)..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAF9] border border-[#10332C]/15 text-xs text-[#10332C] placeholder-[#8EA89F] uppercase font-mono focus:outline-none focus:border-[#10332C]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#10332C] hover:bg-[#1A4C40] text-[#C99E69] font-bold text-xs transition-colors shrink-0"
                    >
                      Appliquer
                    </button>
                  </form>
                )}
                {promoFeedback.text && (
                  <p className={`text-[11px] ${promoFeedback.success ? 'text-emerald-700 font-semibold' : 'text-rose-600'}`}>
                    {promoFeedback.text}
                  </p>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs border-t border-[#10332C]/10 pt-3">
                <div className="flex justify-between text-[#4A635B]">
                  <span>Sous-total articles</span>
                  <span className="font-mono text-[#10332C] font-semibold">{formatFCFA(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Remise</span>
                    <span className="font-mono">- {formatFCFA(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#4A635B]">
                  <span>Frais de livraison estimés</span>
                  <span className="font-mono text-[#10332C] font-semibold">{formatFCFA(totals.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#10332C] pt-2 border-t border-[#10332C]/10">
                  <span>Total TTC</span>
                  <span className="font-mono text-base font-extrabold text-[#10332C]">{formatFCFA(totals.total)}</span>
                </div>
              </div>

              {/* Checkout Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#17463B] hover:to-[#226353] text-[#F9F7F2] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  Commander &amp; Payer à la livraison
                  <ArrowRight className="w-4 h-4 text-[#C99E69]" />
                </button>

                <a
                  href={whatsAppOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EBF4F0] hover:bg-[#E0EFE8] text-[#10332C] font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-[#10332C]/15"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Commander le panier sur WhatsApp
                </a>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-[#6A887E] justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paiement après vérification en mains propres à Dakar</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
