import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle2,
  MessageCircle,
  Printer,
  ChevronRight,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatFCFA, validateSenegalesePhone, generateWhatsAppOrderLink } from '../utils/shopCalculations';
import { CustomerOrderData, Order } from '../types';

import { useAuth } from '../context/AuthContext';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    totals,
    deliveryZones,
    selectedZone,
    setSelectedZone,
    promoCode,
    createOrder,
    navigateTo,
    showToast
  } = useShop();
  const { currentUser, openAuthModal } = useAuth();

  const [formData, setFormData] = useState<CustomerOrderData>({
    fullName: currentUser?.displayName || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    address: currentUser?.address || '',
    zoneId: selectedZone.id,
    notes: '',
    paymentMethod: 'wave',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EBF4F0] flex items-center justify-center mx-auto text-[#10332C]">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#10332C]">Votre panier est vide</h2>
        <p className="text-sm text-[#4A635B]">
          Vous devez ajouter au moins un produit au panier avant de passer commande.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#17463B] hover:to-[#226353] text-[#F9F7F2] font-bold text-sm shadow-md"
        >
          Retourner au catalogue
        </button>
      </div>
    );
  }

  const handleZoneChange = (zoneId: string) => {
    const zone = deliveryZones.find((z) => z.id === zoneId);
    if (zone) {
      setSelectedZone(zone);
      setFormData((prev) => ({ ...prev, zoneId }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Veuillez saisir votre prénom et nom.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Veuillez renseigner votre numéro de téléphone.';
    } else if (!validateSenegalesePhone(formData.phone)) {
      newErrors.phone = 'Numéro invalide. Format attendu : 77, 78, 70, 76 ou 75 suivi de 7 chiffres.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Veuillez préciser votre quartier et repère (ex: Almadies, près de la pharmacie).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Veuillez corriger les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder(formData, currentUser?.id ?? null);
      setConfirmedOrder(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Erreur création commande Firestore:', err);
      showToast('Impossible d’enregistrer la commande. Vérifiez votre connexion et réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Confirmation View
  if (confirmedOrder) {
    const whatsAppConfirmationUrl = generateWhatsAppOrderLink({
      customer: confirmedOrder.customer,
      items: confirmedOrder.items,
      orderNumber: confirmedOrder.orderNumber,
      total: confirmedOrder.total,
    });

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-300">
        
        {/* Success Banner */}
        <div className="text-center space-y-4 p-8 rounded-3xl bg-gradient-to-b from-[#EBF4F0] via-white to-white border border-[#10332C]/15 shadow-xl">
          <div className="flex justify-center mb-2">
            <img
              src="/assets/aistudio/icone_friday_13e5679f.jpg"
              alt="Friday Store"
              className="w-16 h-16 rounded-2xl shadow-md border border-[#C99E69]/30 object-cover"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10332C]/10 text-[#10332C] text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Commande Validée avec Succès</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10332C]">
            Merci pour votre commande, {confirmedOrder.customer.fullName} !
          </h1>
          <p className="text-xs sm:text-sm text-[#4A635B] max-w-md mx-auto leading-relaxed">
            Votre référence officielle est :{' '}
            <strong className="text-[#10332C] bg-[#EBF4F0] px-2.5 py-1 rounded-lg font-mono text-base font-bold border border-[#10332C]/10">{confirmedOrder.orderNumber}</strong>.
            Notre équipe prépare votre colis pour expédition immédiate.
          </p>
        </div>

        {/* WhatsApp Immediate Action */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#10332C] to-[#17463B] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-sm font-bold flex items-center gap-2 justify-center sm:justify-start text-[#F9F7F2]">
              <MessageCircle className="w-4 h-4 text-[#5CD1A9]" />
              Confirmation WhatsApp en 1 Clic
            </h4>
            <p className="text-xs text-[#CFE4DC]">
              Envoyez votre numéro de commande pour recevoir le contact direct de votre coursier.
            </p>
          </div>
          <a
            href={whatsAppConfirmationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap shadow-md"
          >
            Notifier le coursier WhatsApp
          </a>
        </div>

        {/* Order Details Receipt Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#10332C]/10 shadow-lg space-y-6 text-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#10332C]/10">
            <div>
              <span className="text-xs text-[#6A887E]">Date de commande</span>
              <p className="font-semibold text-[#10332C]">
                {new Date(confirmedOrder.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6A887E]">Mode de règlement</span>
              <p className="font-semibold text-[#C99E69] capitalize">
                {confirmedOrder.customer.paymentMethod === 'wave' && 'Wave Sénégal'}
                {confirmedOrder.customer.paymentMethod === 'orange_money' && 'Orange Money'}
                {confirmedOrder.customer.paymentMethod === 'cod' && 'Cash à la livraison'}
              </p>
            </div>
          </div>

          {/* Delivery Coordinates */}
          <div className="space-y-1 text-xs">
            <span className="text-[#6A887E] uppercase tracking-wider font-semibold">Adresse de livraison :</span>
            <p className="text-[#10332C] font-medium">
              {confirmedOrder.customer.address} ({selectedZone.name})
            </p>
            <p className="text-[#4A635B]">
              Destinataire : {confirmedOrder.customer.fullName} · {confirmedOrder.customer.phone}
            </p>
          </div>

          {/* Items Summary */}
          <div className="space-y-3 pt-2">
            <span className="text-xs text-[#6A887E] uppercase tracking-wider font-semibold">Articles commandés :</span>
            {confirmedOrder.items.map((it) => (
              <div key={it.id} className="flex justify-between items-center text-xs py-1.5 border-b border-[#10332C]/5">
                <div className="flex items-center gap-2">
                  <span className="text-[#6A887E] font-mono font-bold">x{it.quantity}</span>
                  <span className="text-[#10332C] font-semibold">{it.product.name}</span>
                  <span className="text-[#6A887E]">({it.selectedSize} · {it.selectedColor.name})</span>
                </div>
                <span className="font-mono text-[#10332C] font-bold">
                  {formatFCFA(it.product.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Total Breakdown */}
          <div className="space-y-2 pt-2 text-xs border-t border-[#10332C]/10">
            <div className="flex justify-between text-[#4A635B]">
              <span>Sous-total</span>
              <span className="font-mono text-[#10332C] font-semibold">{formatFCFA(confirmedOrder.subtotal)}</span>
            </div>
            {confirmedOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Remise code promo ({confirmedOrder.appliedPromo})</span>
                <span className="font-mono">- {formatFCFA(confirmedOrder.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#4A635B]">
              <span>Frais d'expédition</span>
              <span className="font-mono text-[#10332C] font-semibold">{formatFCFA(confirmedOrder.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#10332C] pt-2 border-t border-[#10332C]/10">
              <span>Total TTC</span>
              <span className="font-mono text-[#10332C] text-lg font-extrabold">{formatFCFA(confirmedOrder.total)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 rounded-xl bg-[#F6FAF8] hover:bg-[#EAF4EF] text-[#10332C] font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-[#10332C]/10"
            >
              <Printer className="w-4 h-4" />
              Imprimer le reçu
            </button>
            <button
              onClick={() => navigateTo('tracking')}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#17463B] hover:to-[#226353] text-[#F9F7F2] font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              Suivre l'état de ma livraison
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('user-console')}
              className="flex-1 py-3 rounded-xl bg-[#EBF4F0] hover:bg-[#D5E5DE] text-[#10332C] font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-[#10332C]/15"
            >
              Mon Espace Client &amp; Commandes
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigateTo('shop')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#4A635B] hover:text-[#10332C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continuer mes achats
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Checkout Form */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-xs font-semibold text-[#C99E69] uppercase tracking-wider">Finalisation</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10332C] tracking-tight mt-1">
              Commande &amp; Livraison au Sénégal
            </h1>
            <p className="text-xs sm:text-sm text-[#4A635B] mt-1">
              Complétez vos coordonnées pour que notre coursier puisse vous contacter dès son départ.
            </p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* Step 1: Customer Information */}
            <div className="p-6 rounded-2xl bg-white border border-[#10332C]/10 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#10332C] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#10332C] text-[#C99E69] text-xs flex items-center justify-center font-bold">1</span>
                Coordonnées du destinataire
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#2C483F] font-semibold">Prénom et Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ex: Awa Ndiaye"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#10332C]/15 text-xs text-[#10332C] placeholder-[#8EA89F] focus:outline-none focus:border-[#10332C] focus:bg-white"
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-600">{errors.fullName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#2C483F] font-semibold">Téléphone WhatsApp / Appel *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ex: 77 094 89 94"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#10332C]/15 text-xs text-[#10332C] placeholder-[#8EA89F] focus:outline-none focus:border-[#10332C] focus:bg-white font-mono"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#2C483F] font-semibold">Adresse e-mail (facultatif)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Pour recevoir votre facture électronique"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#10332C]/15 text-xs text-[#10332C] placeholder-[#8EA89F] focus:outline-none focus:border-[#10332C] focus:bg-white"
                />
              </div>
            </div>

            {/* Step 2: Delivery Zone & Exact Address */}
            <div className="p-6 rounded-2xl bg-white border border-[#10332C]/10 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#10332C] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#10332C] text-[#C99E69] text-xs flex items-center justify-center font-bold">2</span>
                Zone &amp; Adresse de livraison
              </h3>

              <div className="space-y-2">
                <label className="text-xs text-[#2C483F] font-semibold">Sélectionnez votre zone :</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {deliveryZones.map((z) => {
                    const isSelected = formData.zoneId === z.id;
                    return (
                      <label
                        key={z.id}
                        className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#EBF4F0] border-[#10332C] text-[#10332C] shadow-sm'
                            : 'bg-[#F8FAF9] border-[#10332C]/10 text-[#4A635B] hover:border-[#10332C]/25 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="deliveryZone"
                            value={z.id}
                            checked={isSelected}
                            onChange={() => handleZoneChange(z.id)}
                            className="mt-1 accent-[#10332C]"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#10332C] block">{z.name}</span>
                            <span className="text-[11px] text-[#4A635B] block">{z.area}</span>
                            <span className="text-[10px] text-[#10332C] font-medium mt-0.5 block flex items-center gap-1">
                              <Truck className="w-3 h-3 text-[#C99E69]" />
                              {z.estimatedDelay}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono text-[#10332C] shrink-0">
                          {formatFCFA(z.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#2C483F] font-semibold">Quartier, rue et repère précis *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Almadies, Route du Méridien, en face de la pharmacie, Villa n°42"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#10332C]/15 text-xs text-[#10332C] placeholder-[#8EA89F] focus:outline-none focus:border-[#10332C] focus:bg-white"
                />
                {errors.address && <p className="text-[11px] text-rose-600">{errors.address}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#2C483F] font-semibold">Instructions spéciales pour le coursier</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Appelez-moi avant de partir ou livraison après 16h"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#10332C]/15 text-xs text-[#10332C] placeholder-[#8EA89F] focus:outline-none focus:border-[#10332C] focus:bg-white"
                />
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="p-6 rounded-2xl bg-white border border-[#10332C]/10 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#10332C] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#10332C] text-[#C99E69] text-xs flex items-center justify-center font-bold">3</span>
                Mode de règlement
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'wave'
                      ? 'bg-blue-50/80 border-blue-500 text-neutral-900 shadow-sm'
                      : 'bg-[#F8FAF9] border-[#10332C]/10 text-[#4A635B] hover:border-[#10332C]/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-blue-700">Wave Sénégal</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wave"
                      checked={formData.paymentMethod === 'wave'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'wave' })}
                      className="accent-blue-600"
                    />
                  </div>
                  <p className="text-[11px] text-[#4A635B]">0% de frais. Scan QR ou transfert direct au coursier.</p>
                </label>

                <label
                  className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'orange_money'
                      ? 'bg-orange-50/80 border-orange-500 text-neutral-900 shadow-sm'
                      : 'bg-[#F8FAF9] border-[#10332C]/10 text-[#4A635B] hover:border-[#10332C]/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-orange-700">Orange Money</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="orange_money"
                      checked={formData.paymentMethod === 'orange_money'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'orange_money' })}
                      className="accent-orange-600"
                    />
                  </div>
                  <p className="text-[11px] text-[#4A635B]">Transfert direct ou code marchand à la livraison.</p>
                </label>

                <label
                  className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'bg-[#EBF4F0] border-[#10332C] text-[#10332C] shadow-sm'
                      : 'bg-[#F8FAF9] border-[#10332C]/10 text-[#4A635B] hover:border-[#10332C]/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#10332C]">Cash à la livraison</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                      className="accent-[#10332C]"
                    />
                  </div>
                  <p className="text-[11px] text-[#4A635B]">Paiement en espèces après inspection du colis.</p>
                </label>
              </div>

              {formData.paymentMethod === 'wave' && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  📱 Numéro Wave officiel Friday Store : <strong>+221 77 094 89 94</strong>. Vous recevrez le lien direct dès validation.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#10332C] via-[#143E35] to-[#1A4C40] hover:from-[#17463B] hover:to-[#226353] text-[#F9F7F2] font-bold text-base flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#10332C]/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Traitement de la commande...' : `Confirmer ma commande (${formatFCFA(totals.total)})`}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-5 sticky top-28 space-y-6 bg-white p-6 rounded-2xl border border-[#10332C]/10 shadow-lg">
          <h3 className="text-base font-bold text-[#10332C] border-b border-[#10332C]/10 pb-3">
            Récapitulatif de votre panier ({totals.itemCount})
          </h3>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3 text-xs">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-lg object-cover bg-[#F8FAF9] border border-[#10332C]/10 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[#10332C] font-semibold truncate">{item.product.name}</h4>
                  <p className="text-[#6A887E] mt-0.5">
                    Modèle : {item.selectedSize} · {item.selectedColor.name} · Qté : {item.quantity}
                  </p>
                  <p className="text-[#10332C] font-mono font-bold mt-1">
                    {formatFCFA(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#10332C]/10 space-y-2 text-xs">
            <div className="flex justify-between text-[#4A635B]">
              <span>Sous-total articles</span>
              <span className="font-mono text-[#10332C] font-semibold">{formatFCFA(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Code promo {promoCode?.code}</span>
                <span className="font-mono">- {formatFCFA(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#4A635B]">
              <span>Frais d'expédition ({selectedZone.name})</span>
              <span className="font-mono text-[#10332C] font-semibold">{formatFCFA(totals.deliveryFee)}</span>
            </div>
            <div className="pt-3 border-t border-[#10332C]/10 flex justify-between text-base font-bold text-[#10332C]">
              <span>Total TTC</span>
              <span className="font-mono text-[#10332C] text-xl font-extrabold">{formatFCFA(totals.total)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F4FAF7] border border-[#10332C]/10 text-[11px] text-[#2C483F] space-y-1">
            <div className="flex items-center gap-1.5 text-[#10332C] font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantie Sérénité Friday Store</span>
            </div>
            <p>Inspection du colis avant paiement · Garantie échange 14j · Support direct sur WhatsApp à Dakar.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
