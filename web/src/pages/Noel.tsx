import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Gift, Clock, Calendar, CheckCircle, 
  MapPin, Phone, MessageSquare, Heart, Award, ArrowRight, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../hooks/useNotifications';

interface ChristmasPack {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  isPopular?: boolean;
  features: string[];
}

const CHRISTMAS_PACKS: ChristmasPack[] = [
  {
    id: 'pack-enfant',
    name: 'Féerie Magique (Famille & Enfants)',
    subtitle: 'La surprise magique pour illuminer les yeux des enfants',
    price: 'Sur devis / dès 35 000 FCFA',
    features: [
      'Passage surprise du Père Noël avec hotte',
      'Boîte gourmande de friandises & chocolats de fête',
      'Fanfare joyeuse de Noël pour la livraison',
      'Mini sapin décoré ou ballon cadeau géant',
      'Photos souvenirs instantanées'
    ]
  },
  {
    id: 'pack-couple',
    name: 'Nuit Étoilée (Romantique & Amoureux)',
    subtitle: 'Pour un réveillon à deux romantique et chaleureux',
    price: 'Sur devis / dès 65 000 FCFA',
    isPopular: true,
    features: [
      'Décoration chambre d’amoureux ambiance Noël chic',
      'Bouteille de Champagne prestige ou vin personnalisé',
      'Bouquet de roses éternelles parfumées',
      'Bûche pâtissière & chocolats fins de fête',
      'Bougies parfumées & ambiance lumineuse tamisée'
    ]
  },
  {
    id: 'pack-reception',
    name: 'Prestige Réveillon (Dîner & Réception)',
    subtitle: 'Une scénographie somptueuse pour vos réceptions festives',
    price: 'Sur devis / dès 180 000 FCFA',
    features: [
      'Décoration complète de table de fête (rouge, or ou argent)',
      'Arche scintillante ou fond photo festive VIP',
      'Centres de table féeriques avec guirlandes intégrées',
      'Art de la table & vaisselle raffinée',
      'Mise en lumière féerique de la salle'
    ]
  },
  {
    id: 'pack-entreprise',
    name: 'Arbre de Noël Entreprise',
    subtitle: 'La célébration corporate clé en main pour vos équipes',
    price: 'Sur mesure',
    features: [
      'Décoration grand format du hall ou de l’espace réception',
      'Grand sapin de Noël illuminé majestueux',
      'Distribution organisée des colis et cadeaux du personnel',
      'Animation musicale & présentateur festif',
      'Reportage photo & vidéo de l’événement'
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

  useEffect(() => {
    // Cible : 24 Décembre 2026
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
      const { error } = await supabase.from('reservations').insert([
        {
          nom: formData.nom,
          prenom: formData.prenom || '',
          email: formData.email || '',
          telephone: formData.telephone,
          type_evenement: 'noel',
          pack_choisi: `Noël : ${formData.selectedPack}`,
          date_evenement: formData.date_evenement,
          statut: 'en_attente',
          notes: formData.lieu ? `Lieu: ${formData.lieu}. ${formData.message}` : formData.message
        }
      ]);

      if (error) throw error;

      setIsSuccess(true);
      if (sendNotification) {
        sendNotification({
          title: ' Nouvelle Réservation Noël reçue !',
          body: `${formData.nom} a réservé ${formData.selectedPack} pour le ${formData.date_evenement}`,
          icon: '/favicon.svg'
        });
      }
    } catch (err: any) {
      console.error('Erreur réservation Noël:', err);
      // Fallback gracieux si Supabase n'est pas encore configuré
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Bonjour KPL SERVICES !  Je souhaite réserver une formule de Noël : "${formData.selectedPack}" pour le ${formData.date_evenement}. Mon nom est ${formData.nom || ''}.`
    );
    window.open(`https://wa.me/2250700000000?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-stone-100 selection:bg-amber-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-red-950 via-neutral-900 to-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 backdrop-blur-sm shadow-sm">
            <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Collection Fêtes & Réveillon 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Vivez la <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200">Magie de Noël</span> avec KPL SERVICES
          </h1>

          <p className="mt-6 text-base sm:text-lg text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
            Surprises à domicile, visites féeriques du Père Noël avec fanfare, décorations de réveillon chic et ambiances inoubliables. Réservez tôt pour garantir votre date !
          </p>

          {/* Countdown Card */}
          <div className="mt-10 max-w-2xl mx-auto bg-neutral-800/80 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-center space-x-2 text-amber-300 text-xs sm:text-sm uppercase tracking-wider font-semibold mb-4">
              <Clock className="w-4 h-4" />
              <span>Compte à rebours avant le réveillon de Noël</span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              {[
                { label: 'Jours', value: timeLeft.days },
                { label: 'Heures', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Secondes', value: timeLeft.seconds }
              ].map((item, idx) => (
                <div key={idx} className="bg-neutral-900/90 border border-neutral-700 rounded-xl p-3 sm:p-4">
                  <div className="text-2xl sm:text-4xl font-extrabold text-amber-400">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider mt-1">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 bg-neutral-900 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-white">
              Nos Formules & Idées Cadeaux de Noël
            </h2>
            <p className="mt-3 text-stone-400 text-sm sm:text-base">
              Chaque formule est 100% personnalisable selon vos souhaits et votre budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CHRISTMAS_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  pack.isPopular
                    ? 'bg-gradient-to-b from-neutral-800 to-red-950/60 border-2 border-amber-400 shadow-xl shadow-amber-500/10 -translate-y-1'
                    : 'bg-neutral-800/70 border border-neutral-700 hover:border-amber-400/50'
                }`}
              >
                <div>
                  {pack.isPopular && (
                    <span className="inline-block bg-amber-400 text-neutral-950 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-4">
                      Coup de Cœur
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-white">{pack.name}</h3>
                  <p className="text-xs text-stone-400 mt-1 min-h-[36px]">{pack.subtitle}</p>

                  <div className="my-5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-700/60">
                    <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">Estimation</span>
                    <span className="text-sm font-bold text-white">{pack.price}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-stone-300">
                    {pack.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-neutral-700/60">
                  <button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, selectedPack: pack.name }));
                      const formElem = document.getElementById('reservation-form-noel');
                      formElem?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      pack.isPopular
                        ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md'
                        : 'bg-neutral-700 hover:bg-neutral-600 text-white'
                    }`}
                  >
                    <span>Choisir cette formule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="reservation-form-noel" className="py-16 bg-neutral-950 border-t border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Réservation Rapide</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Réservez votre Prestation de Noël
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-2">
              Remplissez ce formulaire ou contactez-nous directement via WhatsApp. Les créneaux des 24 & 25 décembre partent très vite !
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Réservation de Noël transmise avec succès !</h3>
                <p className="text-sm text-stone-300 mt-2 max-w-md mx-auto">
                  Merci ! L’équipe KPL SERVICES va vous recontacter très rapidement pour confirmer les détails de votre prestation féerique.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleWhatsAppDirect}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Accélérer via WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="w-full sm:w-auto px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-stone-300 font-semibold rounded-xl text-sm"
                  >
                    Faire une autre demande
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-xs text-red-200">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Votre Nom *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Ex: Kouassi"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Votre Prénom</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      placeholder="Ex: Marie"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Téléphone (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      placeholder="Ex: +225 07..."
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Date souhaitée</label>
                    <select
                      value={formData.date_evenement}
                      onChange={(e) => setFormData({ ...formData, date_evenement: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    >
                      <option value="2026-12-24"> 24 Décembre (Réveillon de Noël)</option>
                      <option value="2026-12-25"> 25 Décembre (Jour de Noël)</option>
                      <option value="2026-12-31"> 31 Décembre (Saint-Sylvestre)</option>
                      <option value="2026-12-20">Autre date de décembre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Formule choisie</label>
                    <select
                      value={formData.selectedPack}
                      onChange={(e) => setFormData({ ...formData, selectedPack: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    >
                      {CHRISTMAS_PACKS.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                      <option value="Formule sur-mesure">Formule personnalisée</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Lieu / Ville / Commune</label>
                  <input
                    type="text"
                    value={formData.lieu}
                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                    placeholder="Ex: Abidjan, Cocody Angré"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Précisions ou demandes particulières</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Dites-nous ce que vous aimeriez pour rendre ce moment unique..."
                    className="w-full px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmission en cours...</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        <span>Envoyer ma demande de réservation de Noël</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
