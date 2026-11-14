import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Phone,
  Truck,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  User,
  ShieldAlert,
  LogOut,
  Settings,
  Bell,
  CheckCheck,
  AlertTriangle,
  Package
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { ViewMode } from '../types';
import { HeaderSearchBar } from './HeaderSearchBar';

export const Header: React.FC = () => {
  const {
    totals,
    activeView,
    navigateTo,
    setIsCartOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    browserPushPermission,
    browserPushEnabled,
    requestBrowserPushPermission,
    toggleBrowserPush,
  } = useShop();
  const { currentUser, isAdmin, isAuthenticated, logout, openAuthModal } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const cartCount = totals.itemCount;

  const navLinks: { label: string; view: ViewMode }[] = [
    { label: 'Accueil', view: 'home' },
    { label: 'Boutique', view: 'shop' },
    { label: 'À Propos', view: 'about' },
    { label: 'Contact & FAQ', view: 'contact' },
    { label: 'Suivi Colis', view: 'tracking' },
  ];

  const handleNavClick = (view: ViewMode) => {
    navigateTo(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <>
      {/* Top Banner Notice with deep green gradient and gold highlights */}
      <div className="bg-gradient-to-r from-[#0C241F] via-[#10332C] to-[#17463B] border-b border-[#C99E69]/20 text-xs py-2 px-4 text-center text-[#CFE4DC]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-4 text-[#CFE4DC]">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#C99E69]" />
              Livraison Dakar en 24h &amp; partout au Sénégal
            </span>
            <span aria-hidden="true" className="text-[#C99E69]/40">·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5CD1A9]" />
              Paiement Wave, Orange Money ou à la livraison
            </span>
          </div>
          
          <div className="mx-auto sm:mx-0 flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-[#CFE4DC]">
                  Connecté : <strong className="text-white">{currentUser?.displayName}</strong>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin ? 'bg-[#C99E69] text-[#10332C]' : 'bg-[#EBF4F0] text-[#10332C]'
                }`}>
                  {isAdmin ? '👑 Admin' : '👤 Client'}
                </span>
              </div>
            ) : (
              <span className="text-[#C99E69] font-bold">Offre de lancement : -10% avec le code FRIDAY10</span>
            )}
            
            <span aria-hidden="true" className="text-[#C99E69]/40">·</span>
            
            {isAdmin ? (
              <button
                onClick={() => handleNavClick('admin')}
                className="text-[#C99E69] hover:text-[#E8D4B8] font-mono text-[11px] font-bold whitespace-nowrap flex items-center gap-1"
              >
                <span>Console Admin</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick(isAuthenticated ? 'user-console' : 'home')}
                onClickCapture={() => {
                  if (!isAuthenticated) openAuthModal('login');
                }}
                className="text-[#C99E69] hover:text-[#E8D4B8] text-[11px] font-bold whitespace-nowrap"
              >
                {isAuthenticated ? 'Console Client' : 'Connexion'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header adhering to Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#10332C]/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 lg:gap-5 xl:gap-6">
          
          {/* Zone 1: Brand Wordmark with Official Friday Icon */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-2.5 group text-left focus:outline-none shrink-0"
            aria-label="Friday Store Accueil"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm border border-[#C99E69]/30 shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/assets/aistudio/icone_friday_13e5679f.jpg"
                alt="Friday Store Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl xl:text-2xl font-extrabold tracking-tight text-[#10332C] whitespace-nowrap">
                FRIDAY<span className="text-[#C99E69]">STORE</span>
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 Navigation Links (single-line, whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-5 text-sm font-semibold text-[#2C483F] shrink-0">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => handleNavClick(link.view)}
                className={`whitespace-nowrap transition-colors py-1 relative ${
                  activeView === link.view
                    ? 'text-[#10332C] font-bold'
                    : 'text-[#4A635B] hover:text-[#10332C]'
                }`}
              >
                {link.label}
                {activeView === link.view && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C99E69] rounded-full" />
                )}
              </button>
            ))}

            {/* If Admin, show shortcut tab in Zone 2 on wide screens */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`hidden 2xl:flex whitespace-nowrap transition-colors py-1 px-2.5 rounded-lg items-center gap-1 text-xs font-bold ${
                  activeView === 'admin'
                    ? 'bg-[#10332C] text-[#C99E69]'
                    : 'bg-[#EBF4F0] text-[#10332C] hover:bg-[#10332C] hover:text-[#C99E69]'
                }`}
              >
                <span>Admin</span>
              </button>
            )}

            {/* If Client, show User Console tab in Zone 2 on wide screens */}
            {isAuthenticated && !isAdmin && (
              <button
                onClick={() => handleNavClick('user-console')}
                className={`hidden 2xl:flex whitespace-nowrap transition-colors py-1 px-2.5 rounded-lg items-center gap-1 text-xs font-bold ${
                  activeView === 'user-console'
                    ? 'bg-[#10332C] text-[#C99E69]'
                    : 'bg-[#EBF4F0] text-[#10332C] hover:bg-[#10332C] hover:text-[#C99E69]'
                }`}
              >
                <span>Espace Client</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Search + User Account + Cart + Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Desktop Real-time Search Bar (visible on XL screens) */}
            <HeaderSearchBar className="hidden xl:block w-52 2xl:w-64" />

            {/* Quick search toggle (visible on screens below XL) */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 sm:p-2.5 rounded-xl transition-colors xl:hidden ${
                searchOpen
                  ? 'bg-[#10332C] text-[#C99E69]'
                  : 'text-[#4A635B] hover:text-[#10332C] hover:bg-[#EBF4F0]'
              }`}
              aria-label="Rechercher des produits en temps réel"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Real-time Notifications Bell (Authenticated Users & Admins) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen((prev) => !prev);
                    setUserDropdownOpen(false);
                  }}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-[#F6FAF8] hover:bg-[#EBF4F0] border border-[#10332C]/15 text-[#10332C] transition-colors"
                  aria-label={`Notifications (${unreadNotificationsCount} non lues)`}
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#10332C]" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-xs">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#D5E5DE] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 bg-[#F8FAF9] border-b border-[#EAF2EE] flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-extrabold text-[#10332C]">
                          Notifications en direct
                        </p>
                        <p className="text-[10px] text-[#4A635B]">
                          {unreadNotificationsCount > 0
                            ? `${unreadNotificationsCount} non lue(s)`
                            : 'Tout est à jour'}
                        </p>
                      </div>
                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={() => markAllNotificationsRead()}
                          className="text-[11px] font-bold text-[#10332C] hover:text-[#C99E69] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#EBF4F0]"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Tout lire
                        </button>
                      )}
                    </div>

                    {/* Browser Push Opt-in Bar */}
                    <div className="px-4 py-2.5 bg-[#EBF4F0]/60 border-b border-[#EAF2EE] flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold text-[#10332C]">Alertes Push Navigateur</span>
                      {browserPushPermission === 'granted' ? (
                        <button
                          type="button"
                          onClick={() => toggleBrowserPush(!browserPushEnabled)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                            browserPushEnabled
                              ? 'bg-[#10332C] text-[#C99E69]'
                              : 'bg-white border border-[#D5E5DE] text-[#4A635B]'
                          }`}
                        >
                          {browserPushEnabled ? 'Actives ✓' : 'En pause'}
                        </button>
                      ) : browserPushPermission === 'unsupported' ? (
                        <span className="text-[10px] text-[#6A887E]">Non supporté</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => requestBrowserPushPermission()}
                          className="px-2.5 py-1 rounded-lg bg-[#10332C] text-[#C99E69] hover:text-white font-bold text-[10px]"
                        >
                          Activer
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#EAF2EE]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#6A887E]">
                          Aucune notification automatique reçue pour le moment.
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => {
                              if (!n.read) markNotificationRead(n.id);
                              setNotifDropdownOpen(false);
                              handleNavClick(isAdmin ? 'admin' : 'user-console');
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-[#F8FAF9] transition-colors flex items-start gap-3 ${
                              !n.read ? 'bg-[#EBF4F0]/35' : ''
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {n.type === 'low_stock' ? (
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                              ) : n.type === 'order_status' ? (
                                <Truck className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Package className="w-4 h-4 text-[#10332C]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold text-[#10332C] truncate">{n.title}</p>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-[#4A635B] line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-[#8EA89F] font-mono">
                                {new Date(n.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account / Connexion Trigger */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#F6FAF8] hover:bg-[#EBF4F0] border border-[#10332C]/15 transition-all text-left"
                  aria-label="Menu profil utilisateur"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                    isAdmin ? 'bg-[#10332C] text-[#C99E69]' : 'bg-[#10332C] text-white'
                  }`}>
                    {currentUser?.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-[#10332C] truncate max-w-[110px]">
                      {currentUser?.displayName.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-[#4A635B] font-mono leading-none">
                      {isAdmin ? 'Admin' : 'Client'}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#D5E5DE] rounded-2xl p-2 shadow-xl z-50 text-xs text-[#10332C] space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2.5 bg-[#F8FAF9] rounded-xl border border-[#EAF2EE] space-y-0.5">
                      <p className="font-bold text-[#10332C] truncate">{currentUser?.displayName}</p>
                      <p className="text-[11px] text-[#4A635B] truncate">{currentUser?.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        isAdmin ? 'bg-[#10332C] text-[#C99E69]' : 'bg-[#EBF4F0] text-[#10332C]'
                      }`}>
                        {isAdmin ? '👑 Super Admin' : '👤 Client Friday Store'}
                      </span>
                    </div>

                    {isAdmin ? (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#EBF4F0] flex items-center gap-2 font-bold text-[#10332C]"
                      >
                        <Settings className="w-4 h-4 text-[#C99E69]" />
                        Console Administrateur
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNavClick('user-console')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#EBF4F0] flex items-center gap-2 font-bold text-[#10332C]"
                      >
                        <User className="w-4 h-4 text-[#10332C]" />
                        Console Utilisateur (Client)
                      </button>
                    )}

                    <button
                      onClick={() => handleNavClick('tracking')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-[#EBF4F0] flex items-center gap-2 font-medium text-[#4A635B]"
                    >
                      <Truck className="w-4 h-4" />
                      Suivi Colis &amp; Livraisons
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-bold border-t border-[#EAF2EE] mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Se Déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-2 p-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#F6FAF8] hover:bg-[#EBF4F0] border border-[#10332C]/15 text-[#10332C] text-xs font-bold transition-all shadow-xs"
                aria-label="Connexion"
              >
                <User className="w-4 h-4 text-[#C99E69]" />
                <span className="hidden sm:inline">Connexion</span>
              </button>
            )}

            {/* Primary Action Button: Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#17463B] hover:to-[#226353] text-[#F9F7F2] text-sm font-semibold transition-all shadow-md"
              aria-label={`Panier d'achats avec ${cartCount} articles`}
            >
              <ShoppingBag className="w-4 h-4 text-[#C99E69]" />
              <span className="hidden sm:inline">Panier</span>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#C99E69] text-[#10332C] text-xs font-bold font-mono">
                {cartCount}
              </span>
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#4A635B] hover:text-[#10332C] hover:bg-[#EBF4F0]"
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Expandable Real-Time Search Row for Tablets / Mobile */}
        {searchOpen && (
          <div className="border-t border-[#10332C]/10 bg-[#F6FAF8] px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="max-w-2xl mx-auto">
              <HeaderSearchBar
                isMobile={false}
                onCloseMobile={() => setSearchOpen(false)}
              />
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white border-r border-[#10332C]/10 p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#10332C]/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#C99E69]/30">
                    <img
                      src="/assets/aistudio/icone_friday_13e5679f.jpg"
                      alt="Friday Store"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-lg font-extrabold text-[#10332C]">
                    FRIDAY<span className="text-[#C99E69]">STORE</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#6A887E] hover:text-[#10332C]"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User badge in mobile menu */}
              {isAuthenticated ? (
                <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#10332C] text-[#C99E69] font-bold flex items-center justify-center text-xs">
                      {currentUser?.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#10332C]">{currentUser?.displayName}</p>
                      <span className="text-[10px] text-[#4A635B]">{isAdmin ? '👑 Admin' : '👤 Client'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#10332C] text-[#C99E69] font-bold text-xs flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Se Connecter / S'Inscrire
                </button>
              )}

              {/* Real-time search inside mobile drawer */}
              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#10332C] block mb-1.5">
                  Recherche rapide en direct :
                </span>
                <HeaderSearchBar
                  isMobile={true}
                  onCloseMobile={() => setMobileMenuOpen(false)}
                />
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.view}
                    onClick={() => handleNavClick(link.view)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      activeView === link.view
                        ? 'bg-[#EBF4F0] text-[#10332C]'
                        : 'text-[#4A635B] hover:bg-[#F8FAF9]'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#8EA89F]" />
                  </button>
                ))}
              </nav>

              <div className="pt-2 border-t border-[#10332C]/10 flex flex-col gap-1 text-xs">
                {isAuthenticated && !isAdmin && (
                  <button
                    onClick={() => handleNavClick('user-console')}
                    className="text-left py-2 px-3 text-[#10332C] font-bold bg-[#EBF4F0] rounded-xl flex items-center justify-between"
                  >
                    <span>👤 Console Utilisateur</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="text-left py-2 px-3 text-[#C99E69] font-bold bg-[#10332C] rounded-xl flex items-center justify-between"
                  >
                    <span>👑 Console Administrateur</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => handleNavClick('strategy-guide')}
                  className="text-left py-2 px-3 text-[#4A635B] hover:text-[#10332C]"
                >
                  Guide Déploiement &amp; Stratégie
                </button>
              </div>
            </div>

            {/* Mobile Footer Area */}
            <div className="pt-4 border-t border-[#10332C]/10 space-y-3">
              <a
                href="https://wa.me/221770948994"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                Service Client Dakar (+221 77 094 89 94)
              </a>
              <p className="text-[10px] text-[#6A887E] text-center">
                Livraison express à Dakar · Wave &amp; OM acceptés
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
