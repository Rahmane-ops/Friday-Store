import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    loginWithGoogle,
    login,
    register,
    resetPassword,
  } = useAuth();
  const { showToast } = useShop();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Dakar');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      showToast('Connexion Google réussie à Friday Store !');
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);
    if (res.success) {
      setInfoMsg(
        `Un email de réinitialisation de mot de passe vient d'être envoyé à ${email.trim().toLowerCase()}. Vérifiez votre boîte de réception ou vos spams.`
      );
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    if (authModalMode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        showToast('Connexion réussie à Friday Store !');
      } else {
        setErrorMsg(res.error || 'Erreur lors de la connexion.');
      }
    } else {
      if (!displayName.trim() || !phone.trim()) {
        setLoading(false);
        setErrorMsg('Veuillez renseigner votre nom complet et votre numéro de téléphone.');
        return;
      }
      const res = await register({
        email,
        pass: password,
        displayName,
        phone,
        city,
      });
      setLoading(false);
      if (res.success) {
        showToast('Compte client créé avec succès ! Bienvenue chez Friday Store.');
      } else {
        setErrorMsg(res.error || "Erreur lors de l'inscription.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#D5E5DE] rounded-3xl p-6 sm:p-7 text-[#10332C] space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-5 top-5 p-1 rounded-xl text-neutral-400 hover:text-[#10332C] hover:bg-[#EBF4F0] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/icone_friday_13e5679f.jpg"
            alt="Friday Store Icon"
            className="w-10 h-10 rounded-xl object-cover border border-[#C99E69]/40 shadow-xs"
          />
          <div>
            <h3 className="text-lg font-extrabold text-[#10332C] tracking-tight">
              {authModalMode === 'login' ? 'Connexion à votre espace' : 'Créer un compte client'}
            </h3>
            <p className="text-xs text-[#4A635B]">
              Friday Store Sénégal · Dakar &amp; Régions
            </p>
          </div>
        </div>

        {/* Google Sign-In Primary Button (configured via Firebase Auth) */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#F6FAF8] border border-[#D5E5DE] hover:border-[#10332C]/40 text-[#10332C] font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
            />
          </svg>
          <span>Continuer avec Google</span>
        </button>

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-[#EAF2EE]" />
          <span className="shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-[#6A887E]">
            ou avec email
          </span>
          <div className="flex-grow border-t border-[#EAF2EE]" />
        </div>

        {/* Toggle Login / Register Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#F6FAF8] rounded-2xl border border-[#D5E5DE]">
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setInfoMsg(null);
              openAuthModal('login');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              authModalMode === 'login'
                ? 'bg-white text-[#10332C] shadow-xs'
                : 'text-[#4A635B] hover:text-[#10332C]'
            }`}
          >
            Se Connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setInfoMsg(null);
              openAuthModal('register');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              authModalMode === 'register'
                ? 'bg-white text-[#10332C] shadow-xs'
                : 'text-[#4A635B] hover:text-[#10332C]'
            }`}
          >
            Créer un Compte
          </button>
        </div>

        {/* Info / Reset Confirmation Alert */}
        {infoMsg && (
          <div className="p-3.5 rounded-2xl bg-[#EBF4F0] border border-[#5CD1A9]/50 text-[#10332C] text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{infoMsg}</p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {authModalMode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="font-bold text-[#10332C] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#C99E69]" />
                  Nom &amp; Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Aminata Diallo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#10332C] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#5CD1A9]" />
                  Téléphone (Sénégal) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 77 094 89 94"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#10332C] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C99E69]" />
                  Quartier / Ville de Livraison
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Mermoz, Almadies, Thiès..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="font-bold text-[#10332C] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#C99E69]" />
              Adresse Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre-email@domaine.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="font-bold text-[#10332C] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C99E69]" />
                Mot de passe *
              </label>
              {authModalMode === 'login' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-[11px] font-semibold text-[#10332C] hover:text-[#C99E69] underline transition-colors disabled:opacity-50"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#0C241F] hover:to-[#143D34] text-[#C99E69] hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#10332C]/20 border border-[#C99E69]/30 disabled:opacity-50"
          >
            {loading ? 'Traitement en cours...' : authModalMode === 'login' ? 'Se Connecter' : 'Créer Mon Compte Client'}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-[#EAF2EE] text-[11px] text-[#4A635B]">
          Protection des données garantie · Conforme législation sénégalaise (CDP)
        </div>

      </div>
    </div>
  );
};
