import React, { useState } from 'react';
import {
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  MessageCircle,
  LogOut,
  ShoppingBag,
  Tag,
  Edit2,
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { formatFCFA, generateWhatsAppOrderLink } from '../utils/shopCalculations';

export const UserConsolePage: React.FC = () => {
  const { currentUser, logout, updateProfile, deleteMyAccount, openAuthModal } = useAuth();
  const {
    orders,
    navigateTo,
    showToast,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    browserPushPermission,
    requestBrowserPushPermission,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'club'>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [confirmSelfDelete, setConfirmSelfDelete] = useState(false);
  const [needsPasswordForDelete, setNeedsPasswordForDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingSelf, setIsDeletingSelf] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: currentUser?.displayName || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
  });

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-3xl bg-white border border-[#D5E5DE] text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#EBF4F0] text-[#10332C] flex items-center justify-center mx-auto">
          <User className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#10332C]">Console Utilisateur</h2>
        <p className="text-xs text-[#4A635B]">
          Vous devez être connecté(e) pour accéder à votre espace personnel Friday Store.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-[#10332C] text-[#C99E69] hover:text-white font-bold text-xs uppercase tracking-wider"
        >
          Se connecter / S'inscrire
        </button>
      </div>
    );
  }

  // Filter orders for current user (matching by email or phone or user id)
  const userOrders = orders.filter((o) => {
    if (o.userId && o.userId === currentUser.id) return true;
    if (o.customer.email && o.customer.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (o.customer.phone && o.customer.phone.replace(/\s+/g, '') === currentUser.phone.replace(/\s+/g, '')) return true;
    return false;
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(editForm);
    setIsEditing(false);
    showToast('Profil mis à jour avec succès !');
  };

  const handleConfirmSelfDelete = async () => {
    setDeleteError('');
    setIsDeletingSelf(true);
    try {
      const res = await deleteMyAccount(deletePassword || undefined);
      if (res.success) {
        showToast('Votre compte et vos identifiants ont été supprimés définitivement.');
        navigateTo('home');
        return;
      }
      if (res.requiresRecentLogin) {
        setNeedsPasswordForDelete(true);
      }
      setDeleteError(res.error || 'Impossible de supprimer le compte.');
    } finally {
      setIsDeletingSelf(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner: User Greeting & Quick Status */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#EBF4F0] via-white to-[#F6FAF8] border border-[#10332C]/15 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#10332C] text-[#C99E69] flex items-center justify-center font-extrabold text-xl shadow-md border border-[#C99E69]/40 shrink-0">
            {currentUser.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-[#10332C] tracking-tight">
                {currentUser.displayName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#10332C] text-[#C99E69] text-[10px] font-bold uppercase tracking-wider">
                Espace Client
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                currentUser.status === 'active' ? 'bg-[#5CD1A9]/20 text-[#10332C]' : 'bg-rose-100 text-rose-700'
              }`}>
                Compte {currentUser.status === 'active' ? 'Actif' : 'Suspendu'}
              </span>
            </div>
            <p className="text-xs text-[#4A635B] mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#C99E69]" />
                {currentUser.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#5CD1A9]" />
                {currentUser.phone}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={() => navigateTo('shop')}
            className="px-4 py-2 rounded-xl bg-white border border-[#10332C]/15 hover:border-[#10332C] text-[#10332C] text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Boutique
          </button>
          <button
            onClick={() => {
              logout();
              showToast('Déconnexion réussie');
            }}
            className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-[#EAF2EE] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'text-[#10332C] border-[#10332C]'
              : 'text-[#4A635B] border-transparent hover:text-[#10332C]'
          }`}
        >
          <Package className="w-4 h-4 text-[#C99E69]" />
          Mes Commandes ({userOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'text-[#10332C] border-[#10332C]'
              : 'text-[#4A635B] border-transparent hover:text-[#10332C]'
          }`}
        >
          <User className="w-4 h-4 text-[#C99E69]" />
          Mon Profil &amp; Coordonnées
        </button>

        <button
          onClick={() => setActiveTab('club')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'club'
              ? 'text-[#10332C] border-[#10332C]'
              : 'text-[#4A635B] border-transparent hover:text-[#10332C]'
          }`}
        >
          <Tag className="w-4 h-4 text-[#C99E69]" />
          Avantages &amp; Réductions
        </button>
      </div>

      {/* TAB 1: MES COMMANDES */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Live Order Notifications Banner */}
          <div className="p-5 rounded-3xl bg-white border border-[#D5E5DE] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF4F0] text-[#10332C] flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-[#C99E69]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#10332C]">
                    Notifications automatiques de livraison
                    {unreadNotificationsCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                        {unreadNotificationsCount} nouvelle(s)
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-[#4A635B]">
                    Recevez instantanément chaque changement d&apos;étape (préparation, départ coursier, livraison).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {browserPushPermission !== 'granted' && browserPushPermission !== 'unsupported' && (
                  <button
                    onClick={() => requestBrowserPushPermission()}
                    className="px-3.5 py-2 rounded-xl bg-[#10332C] text-[#C99E69] hover:text-white text-xs font-bold transition-colors"
                  >
                    Activer alertes navigateur
                  </button>
                )}
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="px-3 py-2 rounded-xl bg-[#EBF4F0] text-[#10332C] text-xs font-bold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout lire
                  </button>
                )}
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#EAF2EE]">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markNotificationRead(n.id)}
                    className={`p-3 rounded-2xl border text-xs flex items-start justify-between gap-3 cursor-pointer ${
                      !n.read
                        ? 'bg-[#EBF4F0]/50 border-[#10332C]/20'
                        : 'bg-[#F8FAF9] border-[#EAF2EE]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#10332C]">{n.title}</p>
                      <p className="text-[11px] text-[#4A635B]">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-[#8EA89F] font-mono shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {userOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#D5E5DE] space-y-4">
              <Package className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="text-lg font-bold text-[#10332C]">Aucune commande pour le moment</h3>
              <p className="text-xs text-[#4A635B] max-w-sm mx-auto">
                Vos commandes passées sur Friday Store s'afficheront ici avec le suivi en direct du coursier.
              </p>
              <button
                onClick={() => navigateTo('shop')}
                className="px-6 py-2.5 rounded-xl bg-[#10332C] text-[#C99E69] hover:text-white font-bold text-xs uppercase tracking-wider"
              >
                Découvrir le Catalogue
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-6 rounded-3xl bg-white border border-[#D5E5DE] shadow-sm space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAF2EE] gap-2">
                    <div>
                      <span className="text-[11px] text-[#4A635B] block">Numéro de commande</span>
                      <strong className="text-base font-mono font-bold text-[#10332C]">
                        {ord.orderNumber}
                      </strong>
                      <span className="text-xs text-[#4A635B] ml-2">
                        · Passée le {new Date(ord.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        ord.status === 'delivered'
                          ? 'bg-[#EBF4F0] text-[#10332C] border border-[#5CD1A9]/40'
                          : ord.status === 'shipping'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : ord.status === 'confirmed'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {ord.status === 'delivered' ? '✓ Livrée' : ord.status === 'shipping' ? '🚚 En livraison' : 'Prise en charge'}
                      </span>
                      <strong className="text-base font-mono font-black text-[#10332C]">
                        {formatFCFA(ord.total)}
                      </strong>
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8FAF9] border border-[#EAF2EE]">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-white border border-[#D5E5DE] shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-bold text-[#10332C] truncate">{item.product.name}</p>
                          <p className="text-[11px] text-[#4A635B]">
                            {item.quantity}x · {item.selectedSize} · {formatFCFA(item.product.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom tracking & WhatsApp link */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-[#EAF2EE] gap-3 text-xs">
                    <span className="text-[#4A635B] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C99E69]" />
                      Livraison à : {ord.customer.address} ({ord.customer.zoneId})
                    </span>

                    <a
                      href={generateWhatsAppOrderLink({ orderNumber: ord.orderNumber, customer: ord.customer })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] text-[#C99E69] hover:text-white font-bold text-xs transition-colors shadow-xs border border-[#C99E69]/30"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Assistance WhatsApp Coursier
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MON PROFIL */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E5DE] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAF2EE]">
            <div>
              <h3 className="text-lg font-bold text-[#10332C]">Informations Personnelles</h3>
              <p className="text-xs text-[#4A635B]">Vos coordonnées utilisées lors de la livraison de vos colis.</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => {
                  setEditForm({
                    displayName: currentUser.displayName,
                    phone: currentUser.phone,
                    address: currentUser.address || '',
                    city: currentUser.city || '',
                  });
                  setIsEditing(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#EBF4F0] hover:bg-[#D5E5DE] text-[#10332C] font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#C99E69]" />
                Modifier
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#10332C]">Nom &amp; Prénom</label>
                  <input
                    type="text"
                    required
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#10332C]">Téléphone au Sénégal</label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#10332C]">Adresse de livraison (rue, villa, appt)</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#10332C]">Quartier / Ville</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 text-[#4A635B] font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#10332C] text-[#C99E69] hover:text-white font-bold text-xs"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#EAF2EE] space-y-1">
                <span className="text-[#4A635B] text-[11px]">Nom complet</span>
                <p className="font-bold text-[#10332C] text-sm">{currentUser.displayName}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#EAF2EE] space-y-1">
                <span className="text-[#4A635B] text-[11px]">Adresse email</span>
                <p className="font-bold text-[#10332C] text-sm">{currentUser.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#EAF2EE] space-y-1">
                <span className="text-[#4A635B] text-[11px]">Numéro de téléphone</span>
                <p className="font-bold text-[#10332C] text-sm">{currentUser.phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#EAF2EE] space-y-1">
                <span className="text-[#4A635B] text-[11px]">Adresse habituelle de livraison</span>
                <p className="font-bold text-[#10332C] text-sm">
                  {currentUser.address || 'Non spécifiée'} {currentUser.city ? `(${currentUser.city})` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Permanent Account & Credentials Deletion */}
          <div className="pt-6 border-t border-[#EAF2EE]">
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Suppression définitive du compte et des identifiants
                  </h4>
                  <p className="text-xs text-rose-800/90">
                    Supprime définitivement votre profil, vos notifications et vos identifiants de connexion Firebase. Cette action est irréversible.
                  </p>
                </div>

                {!confirmSelfDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmSelfDelete(true);
                      setDeleteError('');
                    }}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs inline-flex items-center gap-1.5 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer mon compte
                  </button>
                )}
              </div>

              {confirmSelfDelete && (
                <div className="pt-3 border-t border-rose-200 space-y-3 text-xs">
                  {needsPasswordForDelete && (
                    <div className="space-y-1">
                      <label className="font-bold text-rose-900 block">
                        Confirmez votre mot de passe actuel pour valider la suppression :
                      </label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Votre mot de passe actuel"
                        className="w-full sm:max-w-xs px-3 py-2 rounded-xl bg-white border border-rose-300 text-[#10332C]"
                      />
                    </div>
                  )}

                  {deleteError && (
                    <p className="text-rose-700 font-semibold">{deleteError}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isDeletingSelf}
                      onClick={handleConfirmSelfDelete}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isDeletingSelf
                        ? 'Suppression en cours...'
                        : 'Confirmer la suppression définitive'}
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingSelf}
                      onClick={() => {
                        setConfirmSelfDelete(false);
                        setNeedsPasswordForDelete(false);
                        setDeletePassword('');
                        setDeleteError('');
                      }}
                      className="px-4 py-2 rounded-xl bg-white border border-[#D5E5DE] text-[#2D453D] font-semibold text-xs"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AVANTAGES FRIDAY CLUB */}
      {activeTab === 'club' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E5DE] shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#10332C]">Programme Privilège Friday Store</h3>
            <p className="text-xs text-[#4A635B]">Vos remises et codes promotionnels réservés aux clients fidèles.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#10332C] to-[#1A4C40] text-white space-y-3 shadow-md border border-[#C99E69]/30">
              <span className="text-[10px] font-bold text-[#C99E69] uppercase tracking-wider block">
                Code Promo Actif
              </span>
              <p className="text-2xl font-black font-mono text-[#C99E69]">FRIDAY10</p>
              <p className="text-xs text-neutral-300">
                Bénéficiez de 10% de réduction immédiate sur tous les articles de la boutique.
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('FRIDAY10');
                  showToast('Code FRIDAY10 copié !');
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#C99E69] text-xs font-bold"
              >
                Copier le code promo
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] space-y-3">
              <span className="text-[10px] font-bold text-[#10332C] uppercase tracking-wider block">
                Garantie Sécurité 14 Jours
              </span>
              <h4 className="font-bold text-[#10332C] text-sm">Échange direct à neuf ou remboursement</h4>
              <p className="text-xs text-[#4A635B]">
                Chaque achat effectué avec votre compte client bénéficie de la vérification avec le coursier avant paiement et de 14 jours de garantie totale.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
