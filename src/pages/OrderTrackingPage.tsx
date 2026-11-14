import React, { useState } from 'react';
import { Search, MessageCircle, AlertCircle, PackageCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatFCFA, generateWhatsAppOrderLink } from '../utils/shopCalculations';
import { Order, OrderStatus, OrderTrackingRecord } from '../types';

type TrackingResult =
  | { kind: 'full'; order: Order }
  | { kind: 'public'; tracking: OrderTrackingRecord };

export const OrderTrackingPage: React.FC = () => {
  const { orders, trackOrderByNumber } = useShop();

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) {
      setResult(null);
      return;
    }

    // 1. Check user/session orders first (contains full details when signed in or same session)
    const localFound = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === cleanQuery ||
        (o.customer.phone && o.customer.phone.replace(/\s+/g, '').includes(cleanQuery.replace(/\s+/g, '')))
    );

    if (localFound) {
      setResult({ kind: 'full', order: localFound });
      return;
    }

    // 2. Otherwise query live non-PII Firestore tracking document by exact FS-XX-XXXX reference
    setLoading(true);
    try {
      const remoteTracking = await trackOrderByNumber(cleanQuery);
      if (remoteTracking) {
        setResult({ kind: 'public', tracking: remoteTracking });
      } else {
        setResult(null);
      }
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'shipping':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const steps = [
    { title: 'Commande Reçue', desc: 'Prise en compte immédiate' },
    { title: 'En Préparation', desc: 'Contrôle qualité & emballage' },
    { title: 'En Livraison', desc: 'Coursier moto en route' },
    { title: 'Livrée avec succès', desc: 'Remise & paiement' },
  ];

  const activeStatus: OrderStatus | null =
    result?.kind === 'full'
      ? result.order.status
      : result?.kind === 'public'
      ? result.tracking.status
      : null;

  const activeOrderNumber =
    result?.kind === 'full'
      ? result.order.orderNumber
      : result?.kind === 'public'
      ? result.tracking.orderNumber
      : '';

  const activeCreatedAt =
    result?.kind === 'full'
      ? result.order.createdAt
      : result?.kind === 'public'
      ? result.tracking.createdAt
      : '';

  const activeTotal =
    result?.kind === 'full'
      ? result.order.total
      : result?.kind === 'public'
      ? result.tracking.total
      : 0;

  const activePaymentMethod =
    result?.kind === 'full'
      ? result.order.customer.paymentMethod
      : result?.kind === 'public'
      ? result.tracking.paymentMethod
      : 'wave';

  const activeItemCount =
    result?.kind === 'full'
      ? result.order.items.reduce((sum, it) => sum + it.quantity, 0)
      : result?.kind === 'public'
      ? result.tracking.itemCount
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider bg-[#EBF4F0] px-3 py-1 rounded-full border border-[#D5E5DE]">
          Suivi en direct
        </span>
        <h1 className="text-3xl font-extrabold text-[#10332C] tracking-tight">
          Où en est ma livraison Friday Store ?
        </h1>
        <p className="text-xs sm:text-sm text-[#2D453D]">
          Entrez votre numéro de commande officiel (ex: <strong>FS-26-XXXX</strong>) pour suivre l'avancement de votre colis en temps réel.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Référence commande (ex: FS-26-1042)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#D5E5DE] text-xs sm:text-sm text-[#10332C] placeholder-neutral-400 focus:outline-none focus:border-[#10332C] font-mono shadow-sm uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#0C241F] hover:to-[#143D34] text-[#C99E69] hover:text-white font-bold text-xs sm:text-sm transition-colors shrink-0 shadow-md border border-[#C99E69]/30 disabled:opacity-50"
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {result && activeStatus ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D5E5DE] shadow-sm space-y-8 animate-in fade-in duration-300">

          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EAF2EE] gap-4">
            <div>
              <span className="text-xs text-neutral-500">Numéro de Commande</span>
              <h2 className="text-2xl font-extrabold text-[#10332C] font-mono">
                {activeOrderNumber}
              </h2>
              <span className="text-xs text-[#2D453D] block mt-0.5">
                Passée le {new Date(activeCreatedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {result.kind === 'full' ? (
              <div className="text-left sm:text-right">
                <span className="text-xs text-neutral-500 block">Destinataire</span>
                <strong className="text-[#10332C] text-sm block">{result.order.customer.fullName}</strong>
                <span className="text-xs text-[#2D453D] block">{result.order.customer.address}</span>
              </div>
            ) : (
              <div className="text-left sm:text-right">
                <span className="text-xs text-neutral-500 block">Zone de livraison</span>
                <strong className="text-[#10332C] text-sm block">{result.tracking.zoneName}</strong>
                <span className="text-[11px] text-[#4A635B] block">Coordonnées personnelles protégées</span>
              </div>
            )}
          </div>

          {/* Stepper Progress */}
          {activeStatus === 'cancelled' ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Cette commande a été annulée. Veuillez contacter notre support sur WhatsApp.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#10332C] uppercase tracking-wider">
                Progression de l'acheminement :
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {steps.map((st, idx) => {
                  const currentStep = getStepIndex(activeStatus);
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-[#EBF4F0] border-[#10332C] shadow-sm ring-1 ring-[#10332C]/30'
                          : isCompleted
                          ? 'bg-white border-[#5CD1A9]'
                          : 'bg-[#F8FAF9] border-[#E2ECE7] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted
                              ? 'bg-[#10332C] text-[#C99E69]'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span className={`text-xs font-bold ${isCurrent ? 'text-[#10332C]' : isCompleted ? 'text-[#10332C]' : 'text-neutral-400'}`}>
                          {st.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#2D453D]">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items & Total Summary */}
          <div className="pt-4 border-t border-[#EAF2EE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs space-y-1">
              <span className="text-neutral-500">Total réglé / à régler à la livraison :</span>
              <p className="text-2xl font-bold text-[#10332C] font-mono">{formatFCFA(activeTotal)}</p>
              <p className="text-[11px] text-[#2D453D]">
                Mode : {activePaymentMethod.toUpperCase()} · {activeItemCount} article(s)
              </p>
            </div>

            <a
              href={generateWhatsAppOrderLink({
                orderNumber: activeOrderNumber,
                customer: result.kind === 'full' ? result.order.customer : undefined,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#0C241F] hover:to-[#143D34] text-[#C99E69] hover:text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm border border-[#C99E69]/30"
            >
              <MessageCircle className="w-4 h-4" />
              Contacter le service coursier WhatsApp
            </a>
          </div>

        </div>
      ) : hasSearched && !loading ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-[#D5E5DE] space-y-3 max-w-md mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8 text-[#C99E69] mx-auto" />
          <h4 className="text-base font-bold text-[#10332C]">Aucune commande trouvée</h4>
          <p className="text-xs text-[#2D453D]">
            Vérifiez l'orthographe de votre numéro (format <strong>FS-26-XXXX</strong>). Si vous venez de commander via WhatsApp ou êtes connecté(e), consultez votre Espace Client.
          </p>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white border border-[#D5E5DE] max-w-xl mx-auto space-y-2 text-xs text-[#2D453D] shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#10332C]">
            <PackageCheck className="w-4 h-4 text-[#5CD1A9]" />
            <span>Suivi confidentiel en temps réel</span>
          </div>
          <p>
            Saisissez la référence communiquée lors de la validation de votre panier (format <code className="bg-[#EBF4F0] text-[#10332C] font-bold px-2 py-0.5 rounded font-mono border border-[#D5E5DE]">FS-26-XXXX</code>). Connectez-vous pour retrouver automatiquement tout l'historique détaillé de vos commandes.
          </p>
        </div>
      )}

    </div>
  );
};
