import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Gift, Clock, Calendar, CheckCircle, 
  MapPin, Phone, MessageSquare, Heart, Award, ArrowRight, Loader2,
  ChevronDown, Star, Music, Check, ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../hooks/useNotifications';
import { SEO } from '../components/SEO';
import {
  ChristmasTreeSVG,
  SantaClausSVG,
  SantaSleighSVG,
  RudolphReindeerSVG,
  SnowmanSVG,
  GoldenBellsSVG,
  GiftBoxSVG,
  ChristmasWreathSVG,
  CandyCanesSVG,
  ChristmasStockingSVG,
  HolidayCandleSVG,
  GingerbreadManSVG,
  CrystalSnowflakeSVG,
  FairyLightsGarlandSVG,
  MagicBethlehemStarSVG,
  FanfareTrumpetSVG
} from '../components/christmas/ChristmasAssets';

interface ChristmasPack {
  id: string;
  name: string;
  badge: string;
  price: string;
  isPopular?: boolean;
  idealFor: string;
  features: string[];
}

const CHRISTMAS_PACKS: ChristmasPack[] = [
  {
    id: 'pack-magie-enfants',
    name: 'Féerie Magique (Famille & Enfants)',
    badge: 'Moment Enfantin',
    price: 'Sur devis / dès 35 000 FCFA',
    idealFor: 'Familles, enfants, neveux & nièces',
    features: [
      'Visite surprise du Père Noël en costume traditionnel VIP',
      'Arrivée festive avec fanfare de Noël en direct',
      'Hotte du Père Noël avec distribution des cadeaux',
      'Boîte gourmande de friandises, sablés & chocolats de fête',
      'Mini sapin décoré ou ballon cadeau géant festif',
      'Séance photo souvenir instantanée avec toute la famille'
    ]
  },
  {
    id: 'pack-amoureux-reveillon',
    name: 'Nuit Étoilée (Romantique & Amoureux)',
    badge: 'Coup de Cœur',
    price: 'Sur devis / dès 65 000 FCFA',
    isPopular: true,
    idealFor: 'Couples, fiancés, réveillon intime',
    features: [
      'Décoration chambre d’amoureux ambiance Noël & Réveillon chic',
      'Bouteille de Champagne prestige ou vin personnalisé étiquette fête',
      'Bouquet somptueux de roses éternelles parfumées',
      'Bûche pâtissière artisanale & chocolats fins de Noël',
      'Parfum d’ambiance festif, bougies parfumées & lumières tamisées',
      'Carte de vœux d’amour personnalisée calligraphiée'
    ]
  },
  {
    id: 'pack-prestige-diner',
    name: 'Prestige Réveillon (Dîner & Réception)',
    badge: 'Grande Réception',
    price: 'Sur devis / dès 180 000 FCFA',
    idealFor: 'Dîners de fête, grandes familles, réceptions du 24 & 31',
    features: [
      'Scénographie complète de table de fête (thème Rouge & Or ou Givré)',
      'Arche scintillante monumentale ou photocall de Noël VIP',
      'Centres de table féeriques avec guirlandes micro-LED intégrées',
      'Art de la table & vaisselle raffinée de gala',
      'Mise en lumière chaleureuse et féerique de tout votre salon',
      'Installation et désinstallation complètes par l’équipe KPL'
    ]
  },
  {
    id: 'pack-arbre-entreprise',
    name: 'Arbre de Noël Entreprise & Corporate',
    badge: 'Comités d’Entreprise',
    price: 'Sur mesure (devis personnalisé)',
    idealFor: 'Entreprises, institutions, écoles & associations',
    features: [
      'Grand sapin de Noël majestueux illuminé (2m50 à 4m)',
      'Décoration grand format du hall d’accueil et de la salle de fête',
      'Spectacle d’arrivée du Père Noël avec fanfare live et mascotte',
      'Logistique complète de distribution des colis du personnel',
      'Animation musicale féerique et sonorisation professionnelle',
      'Reportage photo & vidéo complet de votre événement d’entreprise'
    ]
  }
];

export default function Noel() {
  const { sendNotification } = useNotifications();

  // Compte à rebours Noël
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    date_evenement: '2026-12-24',
    selectedPack: CHRISTMAS_PACKS[1].name,
    lieu: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const targetDate = new Date('2026-12-24T18:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.telephone) {
      setErrorMsg('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const fullName = `${formData.prenom ? formData.prenom.trim() + ' ' : ''}${formData.nom.trim()}`.trim();
      const packDetail = formData.lieu 
        ? `${formData.selectedPack} | Lieu: ${formData.lieu}${formData.message ? ' | Note: ' + formData.message : ''}`
        : `${formData.selectedPack}${formData.message ? ' | Note: ' + formData.message : ''}`;

      const { error } = await supabase.from('reservations').insert([
        {
          nom: fullName,
          email: formData.email.trim() || null,
          telephone: formData.telephone.trim(),
          type_evenement: 'noel',
          pack_choisi: packDetail,
          date_evenement: formData.date_evenement,
          statut: 'en_attente',
          prix: 0
        }
      ]);

      if (error) {
        console.error('Erreur Supabase:', error);
        if (error.code === '42501') {
          setErrorMsg("Action requise dans Supabase : La table 'reservations' nécessite la règle d'insertion publique (RLS). Veuillez exécuter le fichier 'supabase_setup_noel.sql' dans votre SQL Editor Supabase.");
        } else {
          setErrorMsg(`Erreur base de données Supabase (${error.code || 'Inconnue'}) : ${error.message}`);
        }
        return;
      }

      setIsSuccess(true);
      if (sendNotification) {
        sendNotification({
          title: '🎄 Nouvelle Réservation Noël reçue !',
          body: `${fullName} a réservé ${formData.selectedPack} pour le ${formData.date_evenement}`,
          icon: '/favicon.svg'
        });
      }
    } catch (err: any) {
      console.error('Erreur réservation Noël:', err);
      setErrorMsg(`Erreur de connexion à Supabase : ${err.message || 'Impossible de joindre la base de données'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Bonjour KPL SERVICES ! 🎄 Je souhaite réserver la formule de Noël "${formData.selectedPack}" pour le ${formData.date_evenement}. Mon nom est ${formData.nom || ''}.`
    );
    window.open(`https://wa.me/22891333468?text=${text}`, '_blank');
  };

  const scrollToForm = (packName?: string) => {
    if (packName) {
      setFormData((prev) => ({ ...prev, selectedPack: packName }));
    }
    const elem = document.getElementById('reservation-section-noel');
    elem?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqItems = [
    {
      q: "Jusqu'à quelle date peut-on réserver pour le réveillon du 24 et le 25 décembre ?",
      a: "Pour garantir la disponibilité du Père Noël, de l'équipe de décoration et de la fanfare, nous recommandons de réserver au moins 2 à 3 semaines à l'avance. Les créneaux des 24 et 25 décembre sont très demandés et limités."
    },
    {
      q: "Comment se déroule la livraison surprise avec fanfare et Père Noël ?",
      a: "Notre équipe se coordonne discrètement avec vous en amont. À l'heure convenue, la fanfare commence à jouer des morceaux festifs en bas ou devant la porte, le Père Noël arrive avec sa hotte, remet les cadeaux, échange avec les enfants et pose pour une séance photo mémorable !"
    },
    {
      q: "Peut-on personnaliser le contenu des coffrets ou la décoration ?",
      a: "Absolument ! Toutes nos formules sont 100% modulables : choix des couleurs (rouge/or traditionnel, blanc/argent boréal, rose glamour), ajout de cadeaux spécifiques, champagnes personnalisés, gâteaux, etc."
    },
    {
      q: "Vous déplacez-vous à domicile et en entreprise ?",
      a: "Oui, nous intervenons partout à Lomé et ses environs (Adidogomé, Agoè, Baguida, Tokoin, Ségbé, etc.) ainsi qu'à l'intérieur du pays sur devis pour les entreprises et réceptions privées."
    },
    {
      q: "Quelles sont les modalités de paiement ?",
      a: "Un acompte de réservation confirme votre créneau et bloque la date sur notre planning de fêtes. Le solde s'effectue avant ou lors de la prestation (T-Money, Flooz, Virement ou Espèces)."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d0914] text-stone-100 overflow-x-hidden selection:bg-amber-500 selection:text-white">
      <SEO
        title="Féerie de Noël & Réveillon 2026 | KPL SERVICES"
        description="Vivez la magie de Noël avec KPL SERVICES : surprises du Père Noël avec fanfare à domicile, décorations féeriques de réveillon et packs d'entreprise."
        keywords="Noël Lomé, surprise Père Noël Togo, décoration réveillon, fanfare Noël KPL SERVICES, arbre de noël entreprise"
        image="https://i.postimg.cc/JHX7sMJC/accueil.jpg"
        url="/noel"
      />

      {/* Guirlande lumineuse supérieure */}
      <div className="w-full overflow-hidden bg-neutral-950/80 sticky top-0 z-30">
        <FairyLightsGarlandSVG className="w-full h-8 opacity-90" />
      </div>

      {/* ========================================================= */}
      {/* SECTION 1 : HERO FÉERIQUE IMMERSIF AVEC GRANDS VECTEURS */}
      {/* ========================================================= */}
      <section className="relative pt-8 pb-20 overflow-hidden bg-gradient-to-b from-[#1a0815] via-[#12071a] to-[#0d0914]">
        {/* Effets d'aurore boréale & lueur magique dorée */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-red-700/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-24 left-1/4 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Étoiles & Flocons flottants */}
        <div className="absolute top-12 left-10 hidden xl:block opacity-75 animate-pulse">
          <MagicBethlehemStarSVG className="w-16 h-16" />
        </div>
        <div className="absolute top-20 right-14 hidden xl:block opacity-60">
          <CrystalSnowflakeSVG className="w-14 h-14" />
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block opacity-40">
          <CandyCanesSVG className="w-16 h-16" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Colonne Gauche : Grand Sapin de Noël animé */}
            <div className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
              >
                <ChristmasTreeSVG className="w-56 h-72 xl:w-64 xl:h-80" animated={true} />
                <div className="absolute -bottom-4 -left-6 transform -rotate-12">
                  <GiftBoxSVG className="w-20 h-20" />
                </div>
                <div className="absolute -bottom-2 -right-4 transform rotate-12">
                  <HolidayCandleSVG className="w-16 h-20" />
                </div>
              </motion.div>
            </div>

            {/* Colonne Centrale : Titre & Message & Compte à Rebours */}
            <div className="lg:col-span-6 text-center flex flex-col items-center">
              
              {/* Badge Féerique */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600/30 to-amber-500/30 border border-amber-400/40 px-5 py-2 rounded-full text-xs sm:text-sm font-bold text-amber-300 tracking-wider uppercase backdrop-blur-md shadow-lg mb-6"
              >
                <GoldenBellsSVG className="w-5 h-5" />
                <span>Collection Fêtes & Réveillon 2026</span>
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              </motion.div>

              {/* Titre Majestueux */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight"
              >
                Vivez la <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-100">Féerie de Noël</span> avec KPL SERVICES
              </motion.h1>

              {/* Sous-titre */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-6 text-base sm:text-lg text-stone-300 max-w-xl mx-auto leading-relaxed font-light"
              >
                Illuminez vos fêtes : visite surprise du Père Noël avec fanfare live, décorations de réveillon sur-mesure, tables de gala et coffrets cadeaux féeriques.
              </motion.p>

              {/* Boutons d'action Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
              >
                <button
                  onClick={() => scrollToForm()}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transform hover:-translate-y-1 transition-all"
                >
                  <Gift className="w-5 h-5" />
                  <span>Réserver ma Prestation de Fête</span>
                </button>

                <button
                  onClick={handleWhatsAppDirect}
                  className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base rounded-2xl backdrop-blur-md flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span>Discuter sur WhatsApp</span>
                </button>
              </motion.div>

              {/* Compte à rebours Noël */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-12 w-full max-w-lg bg-neutral-900/80 border border-amber-500/30 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-center space-x-2 text-amber-300 text-xs uppercase tracking-wider font-bold mb-4">
                  <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
                  <span>Compte à rebours avant le réveillon du 24 Décembre</span>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                  {[
                    { label: 'Jours', value: timeLeft.days },
                    { label: 'Heures', value: timeLeft.hours },
                    { label: 'Minutes', value: timeLeft.minutes },
                    { label: 'Secondes', value: timeLeft.seconds }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-inner">
                      <div className="text-2xl sm:text-3xl font-black text-amber-400">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider mt-1 font-medium">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Colonne Droite : Père Noël chaleureux en SVG animé */}
            <div className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
              >
                <SantaClausSVG className="w-56 h-72 xl:w-64 xl:h-80" animated={true} />
                <div className="absolute -bottom-4 -right-4 transform rotate-6">
                  <FanfareTrumpetSVG className="w-24 h-24" />
                </div>
                <div className="absolute -top-6 -left-6 transform -rotate-12">
                  <ChristmasWreathSVG className="w-24 h-24" />
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Bannière de transition en bas du Hero */}
        <div className="w-full mt-16 border-y border-amber-500/20 bg-amber-500/5 py-4 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-around gap-6 text-xs sm:text-sm text-stone-300 font-medium">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400" />
              Père Noël en costume VIP & Fanfare en direct
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400" />
              Scénographies de fêtes & Décorations de table
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400" />
              Livraisons surprises les 24, 25 & 31 Décembre
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2 : LES 4 EXPÉRIENCES FÉERIQUES KPL SERVICES */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#0f0b18] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Nos Savoir-Faire Festifs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Comment nous sublimons votre Noël
            </h2>
            <p className="mt-3 text-stone-400 text-sm sm:text-base">
              Chaque détail est pensé pour créer une émotion intense et des souvenirs qui durent toute une vie.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Carte 1 : Visite Père Noël & Fanfare */}
            <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 rounded-3xl border border-neutral-800 hover:border-amber-400/50 transition-all group flex flex-col justify-between shadow-xl">
              <div>
                <div className="h-40 flex items-center justify-center relative mb-4">
                  <SantaClausSVG className="w-32 h-36 group-hover:scale-105 transition-transform" />
                  <div className="absolute bottom-0 right-2">
                    <FanfareTrumpetSVG className="w-16 h-16" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Père Noël & Fanfare Live
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-400 leading-relaxed">
                  L'arrivée triomphale du Père Noël au son d'une joyeuse fanfare cuivrée devant votre domicile ou votre entreprise. Un moment de pur bonheur pour petits et grands.
                </p>
              </div>
              <button
                onClick={() => scrollToForm('Féerie Magique (Famille & Enfants)')}
                className="mt-6 text-xs font-bold text-amber-400 flex items-center gap-1.5 hover:text-amber-300"
              >
                <span>Découvrir la formule enfants</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Carte 2 : Décoration Féerique de Salon */}
            <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 rounded-3xl border border-neutral-800 hover:border-amber-400/50 transition-all group flex flex-col justify-between shadow-xl">
              <div>
                <div className="h-40 flex items-center justify-center relative mb-4">
                  <ChristmasTreeSVG className="w-32 h-40 group-hover:scale-105 transition-transform" />
                  <div className="absolute bottom-2 left-2">
                    <GoldenBellsSVG className="w-14 h-14" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Sapins & Scénographies
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-400 leading-relaxed">
                  Sapins majestueux ornés avec art, guirlandes scintillantes, chemins de table royaux et mise en lumière tamisée pour transformer votre intérieur en conte de fées.
                </p>
              </div>
              <button
                onClick={() => scrollToForm('Prestige Réveillon (Dîner & Réception)')}
                className="mt-6 text-xs font-bold text-amber-400 flex items-center gap-1.5 hover:text-amber-300"
              >
                <span>Voir nos décors de fête</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Carte 3 : Réveillon Romantique */}
            <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 rounded-3xl border border-neutral-800 hover:border-amber-400/50 transition-all group flex flex-col justify-between shadow-xl">
              <div>
                <div className="h-40 flex items-center justify-center relative mb-4">
                  <HolidayCandleSVG className="w-24 h-32 group-hover:scale-105 transition-transform" />
                  <div className="absolute bottom-0 right-4">
                    <ChristmasStockingSVG className="w-16 h-20" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Nuit Étoilée à Deux
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-400 leading-relaxed">
                  Passez un réveillon à deux inoubliable avec notre décoration romantique de chambre d’amoureux, champagne, roses parfumées et chocolats fins.
                </p>
              </div>
              <button
                onClick={() => scrollToForm('Nuit Étoilée (Romantique & Amoureux)')}
                className="mt-6 text-xs font-bold text-amber-400 flex items-center gap-1.5 hover:text-amber-300"
              >
                <span>Découvrir la formule couple</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Carte 4 : Arbre de Noël & Entreprise */}
            <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 rounded-3xl border border-neutral-800 hover:border-amber-400/50 transition-all group flex flex-col justify-between shadow-xl">
              <div>
                <div className="h-40 flex items-center justify-center relative mb-4">
                  <SantaSleighSVG className="w-36 h-28 group-hover:scale-105 transition-transform" />
                  <div className="absolute top-0 right-2">
                    <GiftBoxSVG className="w-16 h-16" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Arbre de Noël Entreprise
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-400 leading-relaxed">
                  Offrez à vos collaborateurs et à leurs enfants un événement inoubliable : grand sapin, distribution de colis, spectacle, sonorisation et traiteur.
                </p>
              </div>
              <button
                onClick={() => scrollToForm('Arbre de Noël Entreprise & Corporate')}
                className="mt-6 text-xs font-bold text-amber-400 flex items-center gap-1.5 hover:text-amber-300"
              >
                <span>Demander un devis pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3 : SHOWCASE DES SCÉNOGRAPHIES & AMBIANCES */}
      {/* ========================================================= */}
      <section className="py-20 bg-gradient-to-b from-[#0f0b18] to-[#140a1d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-1">
                Univers Thématiques KPL
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Les Scénographies de Réveillon
              </h2>
            </div>
            <p className="text-stone-400 text-xs sm:text-sm max-w-md">
              Des décors féeriques créés sur-mesure pour sublimer vos salons, réceptions et événements d'entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Ambiance 1 */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden group hover:border-red-500/50 transition-all shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold rounded-full uppercase">
                  Classique Féerie
                </span>
                <GoldenBellsSVG className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Rouge Velours & Or Royal</h3>
              <p className="text-xs text-stone-300 leading-relaxed mb-6">
                Le charme intemporel de Noël : sapin illuminé de rouge et d'or scintillant, rubans de velours, cheminée décorée et boules en verre soufflé.
              </p>
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-stone-400">
                <span>Inclus : Sapin, Guirlandes & Cadeaux déco</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            </div>

            {/* Ambiance 2 */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-full uppercase">
                  Prestige Gala
                </span>
                <HolidayCandleSVG className="w-12 h-14" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">La Table Étoilée des Fêtes</h3>
              <p className="text-xs text-stone-300 leading-relaxed mb-6">
                L'art de recevoir au sommet : centres de table végétaux en sapin noble, chandeliers dorés, marque-places personnalisés et vaisselle d'apparat.
              </p>
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-stone-400">
                <span>Inclus : Chandeliers, Art de table & Menu</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            </div>

            {/* Ambiance 3 */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full uppercase">
                  Romantisme
                </span>
                <ChristmasWreathSVG className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nuit Romantique sous le Gui</h3>
              <p className="text-xs text-stone-300 leading-relaxed mb-6">
                Une parenthèse enchantée en amoureux : couronnes délicates, chemin de pétales, champagne frais et surprise déposée par le Père Noël.
              </p>
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-stone-400">
                <span>Inclus : Champagne, Fleurs & Ambiance</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4 : NOS FORMULES & PACKS DE NOËL 2026 */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#0d0914] border-t border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Tarifs & Formules Prêtes à Réserver
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
              Choisissez votre Pack de Fête
            </h2>
            <p className="mt-3 text-stone-400 text-sm sm:text-base">
              Nos packs incluent tout ce qu'il faut pour un réveillon sans stress. Disponibilités limitées pour les 24 et 25 décembre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CHRISTMAS_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                  pack.isPopular
                    ? 'bg-gradient-to-b from-neutral-800 via-neutral-900 to-red-950/70 border-2 border-amber-400 shadow-2xl shadow-amber-500/15 -translate-y-2'
                    : 'bg-neutral-900/80 border border-neutral-800 hover:border-amber-400/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      pack.isPopular
                        ? 'bg-amber-400 text-neutral-950 shadow-sm'
                        : 'bg-neutral-800 text-stone-300 border border-neutral-700'
                    }`}>
                      {pack.badge}
                    </span>
                    {pack.isPopular && (
                      <span className="flex items-center text-amber-400 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Top Choix
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white">{pack.name}</h3>
                  <div className="text-xs text-amber-300/80 font-medium mt-1">
                    Pour : {pack.idealFor}
                  </div>

                  {/* Prix / Estimation */}
                  <div className="my-5 p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Tarif indicatif</span>
                    <span className="text-base sm:text-lg font-extrabold text-white">{pack.price}</span>
                  </div>

                  {/* Inclusions */}
                  <ul className="space-y-3 text-xs text-stone-300">
                    {pack.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-neutral-800">
                  <button
                    onClick={() => scrollToForm(pack.name)}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                      pack.isPopular
                        ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-lg shadow-amber-500/20'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                    }`}
                  >
                    <span>Choisir cette formule</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-xs sm:text-sm text-stone-400 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 max-w-2xl mx-auto">
            <span>✨ Vous avez une demande particulière ? Nous créons des formules 100% sur-mesure adaptées à votre budget !</span>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5 : ZOOM SUR L'EXPÉRIENCE FANFARE & PÈRE NOËL */}
      {/* ========================================================= */}
      <section className="py-20 bg-gradient-to-r from-red-950 via-neutral-950 to-amber-950/80 relative overflow-hidden border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="relative">
                <SantaClausSVG className="w-52 h-64" animated={true} />
                <div className="absolute -bottom-6 -right-6">
                  <FanfareTrumpetSVG className="w-32 h-32" />
                </div>
                <div className="absolute top-0 -left-6">
                  <SnowmanSVG className="w-24 h-32" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-red-600/20 border border-red-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-red-300 uppercase tracking-wider">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>L'Exclusivité KPL SERVICES</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Une Fanfare en Direct pour accompagner le Père Noël
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Imaginez : la porte de votre maison s’ouvre au son joyeux des trompettes, saxophones et percussions interprétant les plus beaux cantiques de Noël. Le Père Noël fait alors son entrée avec sa hotte débordante de cadeaux et de sourires.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                  <h4 className="font-bold text-amber-300 text-sm">Émotion & Surprise Totale</h4>
                  <p className="text-xs text-stone-400 mt-1">Larmes de joie et émerveillement garantis pour votre famille ou vos collègues.</p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                  <h4 className="font-bold text-amber-300 text-sm">Photos & Vidéos Souvenirs</h4>
                  <p className="text-xs text-stone-400 mt-1">Un moment inestimable immortalisé avec toute la troupe en tenues de fête.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleWhatsAppDirect}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Réserver un passage avec Fanfare</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6 : FORMULAIRE DE RÉSERVATION NOËL DIRECT */}
      {/* ========================================================= */}
      <section id="reservation-section-noel" className="py-20 bg-[#09060e] relative border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-1">
              Réservation Rapide & Sécurisée
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Réservez votre Moment Féerique
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
              Remplissez ce formulaire pour bloquer votre date. Notre équipe vous recontacte dans l’heure pour finaliser les détails.
            </p>
          </div>

          <div className="bg-neutral-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
            
            {/* Décorations d'angles */}
            <div className="absolute -top-6 -right-6 opacity-30 pointer-events-none">
              <ChristmasWreathSVG className="w-28 h-28" />
            </div>
            <div className="absolute -bottom-6 -left-6 opacity-30 pointer-events-none">
              <GiftBoxSVG className="w-28 h-28" />
            </div>

            {isSuccess ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-green-500/40 shadow-lg">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  Votre demande de Noël est bien reçue !
                </h3>
                <p className="text-sm text-stone-300 mt-2 max-w-md mx-auto leading-relaxed">
                  Merci de faire confiance à KPL SERVICES ! Un responsable féerique va vous appeler ou vous écrire pour confirmer votre réservation et organiser votre moment magique.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleWhatsAppDirect}
                    className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-xl"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Accélérer sur WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="w-full sm:w-auto px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-stone-300 font-semibold rounded-xl text-sm"
                  >
                    Nouvelle demande
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {errorMsg && (
                  <div className="p-4 bg-red-950/60 border border-red-500/60 rounded-2xl text-xs sm:text-sm text-red-200">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Ex: Madame Lawson"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950/90 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      placeholder="Ex: Sophie"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950/90 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                      Téléphone WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      placeholder="Ex: +228 91 33 34 68"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950/90 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                      Adresse Email (facultatif)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950/90 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                      Date souhaitée de la prestation
                    </label>
                    <select
                      value={formData.date_evenement}
                      onChange={(e) => setFormData({ ...formData, date_evenement: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950/90 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    >
                      <option value="2026-12-24">🎄 24 Décembre (Réveillon de Noël)</option>
                      <option value="2026-12-25">🎅 25 Décembre (Jour de Noël)</option>
                      <option value="2026-12-31">🥂 31 Décembre (Réveillon Saint-Sylvestre)</option>
                      <option value="2026-12-20">Autre date en décembre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                      Formule choisie
                    </label>
                    <select
                      value={formData.selectedPack}
                      onChange={(e) => setFormData({ ...formData, selectedPack: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950/90 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    >
                      {CHRISTMAS_PACKS.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                      <option value="Formule sur-mesure">✨ Formule Sur-Mesure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Lieu / Quartier de livraison ou de fête
                  </label>
                  <input
                    type="text"
                    value={formData.lieu}
                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                    placeholder="Ex: Lomé, Adidogomé / Tokoin / Ségbé..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950/90 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Précisions ou souhaits particuliers
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Prénom et âge des enfants, heure idéale, chanson préférée pour la fanfare..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950/90 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black rounded-2xl text-sm sm:text-base transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 transform hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Transmission en cours...</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        <span>Envoyer ma Réservation de Noël</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7 : FOIRE AUX QUESTIONS DE NOËL */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#0d0914] border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-1">
              Tout savoir
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Questions Fréquentes sur nos Prestations de Fêtes
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-white hover:text-amber-300 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-5 h-5 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-stone-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Footer Banner Festif */}
      <div className="py-8 bg-neutral-950 text-center border-t border-neutral-900 text-xs text-stone-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-400" />
        <span>KPL SERVICES — Agence Événementielle d'Élite • Joyeuses Fêtes de Fin d'Année !</span>
      </div>
    </div>
  );
}
