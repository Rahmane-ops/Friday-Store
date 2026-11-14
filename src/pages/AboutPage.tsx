import React from 'react';
import { Shield, Sparkles, Heart, Users, MapPin, ArrowRight, CheckCircle2, Truck, Eye } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useShop();

  const values = [
    {
      title: 'Inspection Avant Paiement',
      desc: 'Au Sénégal, la confiance se prouve sur le terrain. Nos clients ont le droit d\'ouvrir le colis et de tester le produit devant le coursier avant de valider leur paiement.',
      icon: Eye,
    },
    {
      title: 'Sélection & Contrôle Qualité',
      desc: 'Nous sourçons les meilleurs produits d\'électroménager, de high-tech, de vaisselle et de déco maison auprès d\'usines certifiées et testons chaque unité avant expédition.',
      icon: Sparkles,
    },
    {
      title: 'L\'Esprit Teranga & SAV 7j/7',
      desc: 'Un accueil chaleureux et une équipe dédiée basée à Dakar, joignable 7 jours sur 7 par téléphone et sur WhatsApp pour vous accompagner avec le sourire.',
      icon: Heart,
    },
    {
      title: 'Rapidité & Transparence',
      desc: 'Livraison express en 2 à 4h à Dakar et sous 48h dans les régions. Tarifs clairs en FCFA, sans frais cachés ni mauvaise surprise.',
      icon: Truck,
    },
  ];

  const team = [
    {
      name: 'Ousmane Diop',
      role: 'Directeur Général & Sourcing',
      bio: 'Passionné de commerce moderne et d\'innovation, Ousmane a fondé Friday Store pour démocratiser l\'accès aux meilleurs équipements pour chaque foyer sénégalais.',
    },
    {
      name: 'Marième Sène',
      role: 'Responsable Expérience Client & SAV',
      bio: 'Gérante de notre service client dakarois et du suivi WhatsApp. Elle veille quotidiennement à ce que chaque client reçoive son colis avec le sourire.',
    },
    {
      name: 'Ibrahima Ndao',
      role: 'Logistique & Flotte de Livraison',
      bio: 'Coordinateur des coursiers moto à Dakar et des expéditions quotidiennes vers Thiès, Saint-Louis, Mbour, Touba et Ziguinchor.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C99E69] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#10332C]" />
            <span>Notre Histoire &amp; Vision</span>
            <span aria-hidden="true">·</span>
            <span>E-Commerce Dropshipping Sénégal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#10332C] tracking-tight leading-tight">
            Rendre la vie plus facile et élégante à chaque foyer au <span className="text-[#C99E69]">Sénégal</span>.
          </h1>
          <p className="text-base text-[#2C483F] leading-relaxed">
            Friday Store est né pour répondre à une attente forte des familles et jeunes actifs sénégalais : trouver en un seul endroit le meilleur de l'électroménager moderne, de la tech utile, de l'art de la table et de la décoration intérieure au juste prix en FCFA.
          </p>
          <p className="text-sm text-[#4A635B] leading-relaxed">
            Grâce à notre plateforme logistique basée à Dakar, nous éliminons les intermédiaires superflus pour vous offrir des prix compétitifs, des tests rigoureux sur chaque article et un paiement en toute sécurité après vérification en mains propres.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigateTo('shop')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#17463B] hover:to-[#226353] text-[#F9F7F2] font-bold text-sm inline-flex items-center gap-2 transition-all shadow-lg shadow-[#10332C]/20"
            >
              Découvrir nos rayons
              <ArrowRight className="w-4 h-4 text-[#C99E69]" />
            </button>
          </div>
        </div>

        {/* Brand Showcase Card with Official Logo */}
        <div className="relative rounded-3xl overflow-hidden border border-[#10332C]/15 bg-gradient-to-b from-[#10332C] to-[#0A201B] p-8 text-center text-white shadow-2xl flex flex-col items-center justify-center space-y-6 min-h-[420px]">
          <div className="w-48 sm:w-56 overflow-hidden rounded-2xl shadow-xl border border-[#C99E69]/30">
            <img
              src="/assets/aistudio/logo_friday_de00ddef.jpg"
              alt="Logo officiel Friday Store"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="max-w-sm space-y-2">
            <h3 className="text-xl font-bold text-[#F9F7F2]">L'Excellence du Dropshipping Local</h3>
            <p className="text-xs text-[#CFE4DC] leading-relaxed">
              Une sélection triée sur le volet, stockée et testée à Dakar pour garantir zéro mauvaise surprise à l'ouverture de votre colis.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#C99E69] font-medium pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#5CD1A9]" />
              Dakar Express 2-4h
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#5CD1A9]" />
              Garantie 14 Jours
            </span>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider">Nos Engagements</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10332C] mt-1">Pourquoi Choisir Friday Store ?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-[#10332C]/10 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="w-11 h-11 rounded-xl bg-[#EBF4F0] text-[#10332C] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#10332C]" />
                </div>
                <h3 className="font-bold text-[#10332C] text-base">{v.title}</h3>
                <p className="text-xs text-[#4A635B] leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* The Team */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#C99E69] uppercase tracking-wider">L'Équipe</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10332C] mt-1">Les Artisans de Votre Satisfaction</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((m, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-[#10332C]/10 shadow-sm space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-[#10332C] text-[#C99E69] flex items-center justify-center font-bold text-base shadow-sm">
                {m.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#10332C]">{m.name}</h3>
                <span className="text-xs text-[#C99E69] font-bold">{m.role}</span>
              </div>
              <p className="text-xs text-[#4A635B] leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Online Express Delivery Callout */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-[#10332C] via-[#143E35] to-[#1A4C40] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start text-xs font-bold text-[#C99E69]">
            <Truck className="w-4 h-4 text-[#5CD1A9]" />
            <span>Livraison Express &amp; Inspection à Domicile</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#F9F7F2]">Recevez et testez vos commandes chez vous à Dakar</h3>
          <p className="text-xs text-[#CFE4DC] max-w-md">
            Expéditions 7j/7 partout à Dakar en 2h à 4h et en régions sous 48h. Vérifiez votre article devant le coursier avant de payer.
          </p>
        </div>
        <button
          onClick={() => navigateTo('contact')}
          className="px-6 py-3 rounded-xl bg-white hover:bg-[#F6FAF8] text-[#10332C] font-bold text-xs shrink-0 shadow-md transition-colors"
        >
          Contacter notre équipe
        </button>
      </div>

    </div>
  );
};
