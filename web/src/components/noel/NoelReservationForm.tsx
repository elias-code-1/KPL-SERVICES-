import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  MessageCircle,
  HelpCircle,
  TreePine,
  DollarSign
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../hooks/useNotifications';
import { getWhatsAppUrl } from '../ui/WhatsAppButton';
import { MiniSapin } from './assets';

// Lazy load d'un asset festif pour l'écran de confirmation
const CadeauDoreLazy = lazy(() =>
  import('./assets').then((module) => ({ default: module.CadeauDore }))
);
const SapinDecoreLazy = lazy(() =>
  import('./assets').then((module) => ({ default: module.SapinDecore }))
);

export interface PackOption {
  id: string;
  nom: string;
  prix: number | null;
}

interface NoelReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackId?: string | null;
  initialPackNom?: string | null;
  initialPrixPack?: number | null;
  packs: PackOption[];
  dateLimiteCommandes: string | null;
}

const PRESTATION_TYPES = [
  'Surprise à domicile',
  'Décoration de salle ou d\'espace',
  'Panier ou cadeaux livrés',
  'Arbre de Noël entreprise',
  'Autre'
];

const TIME_SLOTS = [
  'Matin (08h - 12h)',
  'Après-midi (13h - 17h)',
  'Soirée (18h - 22h)',
  'Heure précise (à préciser dans les notes)'
];

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function NoelReservationForm({
  isOpen,
  onClose,
  initialPackId = null,
  initialPackNom = null,
  initialPrixPack = null,
  packs,
  dateLimiteCommandes
}: NoelReservationFormProps) {
  const { sendNotification } = useNotifications();

  // Détection de date limite dépassée
  const isDeadlinePassed = Boolean(
    dateLimiteCommandes && new Date(dateLimiteCommandes).getTime() < Date.now()
  );

  // État du formulaire
  const [selectedPackChoice, setSelectedPackChoice] = useState<string>('custom');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [typePrestation, setTypePrestation] = useState(PRESTATION_TYPES[0]);
  const [dateLivraison, setDateLivraison] = useState('');
  const [heureLivraison, setHeureLivraison] = useState(TIME_SLOTS[0]);
  const [villeLieu, setVilleLieu] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');

  // Piège anti-spam (honeypot) & horodatage d'ouverture
  const [honeypot, setHoneypot] = useState('');
  const openTimeRef = useRef<number>(Date.now());

  // Statuts de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Données de récapitulatif pour l'écran de succès
  const [submittedSummary, setSubmittedSummary] = useState<{
    nom: string;
    telephone: string;
    packNom: string;
    dateLivraison: string;
    villeLieu: string;
    typePrestation: string;
  } | null>(null);

  // Initialisation à l'ouverture de la modale
  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = Date.now();
      setIsSuccess(false);
      setErrorMessage(null);
      setValidationErrors({});

      if (initialPackId) {
        setSelectedPackChoice(initialPackId);
      } else if (initialPackNom && initialPackNom.toLowerCase().includes('mesure')) {
        setSelectedPackChoice('custom');
      } else if (packs.length > 0) {
        setSelectedPackChoice(packs[0].id);
      } else {
        setSelectedPackChoice('custom');
      }
    }
  }, [isOpen, initialPackId, initialPackNom, packs]);

  // Fermeture par la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calcul des raccourcis dates (24, 25, 31 décembre de l'année en cours)
  const currentYear = new Date().getFullYear();
  const todayStr = getLocalDateString();
  const dateShortcuts = [
    { label: '24 décembre', value: `${currentYear}-12-24` },
    { label: '25 décembre', value: `${currentYear}-12-25` },
    { label: '31 décembre', value: `${currentYear}-12-31` },
  ].filter((s) => s.value >= todayStr);

  // Trouver le pack actuellement sélectionné
  const currentPack = packs.find((p) => p.id === selectedPackChoice) || null;
  const currentPackNom = currentPack ? currentPack.nom : 'Sur mesure';
  const currentPrixPack = currentPack ? currentPack.prix : null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const cleanNom = nom.trim();
    if (!cleanNom) {
      errors.nom = 'Votre nom complet est obligatoire.';
    } else if (cleanNom.length < 2) {
      errors.nom = 'Le nom doit contenir au moins 2 caractères.';
    } else if (cleanNom.length > 120) {
      errors.nom = 'Le nom ne doit pas dépasser 120 caractères.';
    }

    const cleanPhoneDigits = telephone.replace(/[^0-9]/g, '');
    if (!telephone.trim()) {
      errors.telephone = 'Le numéro de téléphone est obligatoire.';
    } else if (cleanPhoneDigits.length < 8) {
      errors.telephone = 'Veuillez saisir un numéro de téléphone valide (au moins 8 chiffres).';
    } else if (telephone.trim().length > 30) {
      errors.telephone = 'Le numéro est trop long.';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Format d\'adresse email invalide.';
      } else if (email.trim().length > 200) {
        errors.email = 'L\'adresse email est trop longue.';
      }
    }

    if (!villeLieu.trim()) {
      errors.villeLieu = 'Le lieu ou la ville de livraison est obligatoire.';
    } else if (villeLieu.trim().length > 200) {
      errors.villeLieu = 'Le lieu ne doit pas dépasser 200 caractères.';
    }

    if (notes.trim().length > 2000) {
      errors.notes = 'Les notes ne peuvent pas dépasser 2000 caractères.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    // Détection bot / soumission trop rapide (< 3 secondes) ou honeypot rempli
    const isBot = Boolean(honeypot.trim()) || Date.now() - openTimeRef.current < 3000;
    if (isBot) {
      // Simuler le succès sans insérer pour neutraliser les bots
      setSubmittedSummary({
        nom: nom.trim(),
        telephone: telephone.trim(),
        packNom: currentPackNom,
        dateLivraison: dateLivraison || 'Non spécifiée',
        villeLieu: villeLieu.trim(),
        typePrestation
      });
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nom: nom.trim(),
        telephone: telephone.trim(),
        email: email.trim() || null,
        type_prestation: typePrestation,
        pack_id: currentPack ? currentPack.id : null,
        pack_nom: currentPackNom,
        prix_pack: currentPrixPack,
        date_livraison: dateLivraison || null,
        heure_livraison: heureLivraison,
        ville_lieu: villeLieu.trim(),
        budget: budget.trim() || null,
        notes: notes.trim() || null,
        statut: 'recu',
        acompte: 0,
      };

      // Important : Pas de .select() chaîné (anon n'a pas les droits de lecture)
      const { error } = await supabase
        .from('reservations_noel')
        .insert(payload);

      if (error) {
        throw error;
      }

      // Envoi de la notification push en arrière-plan sans bloquer
      try {
        sendNotification(
          '🎉 Nouvelle Réservation Noël !',
          `${payload.nom} — ${payload.pack_nom} — ${payload.date_livraison || 'Date à convenir'}`
        );
      } catch (notifErr) {
        console.warn('[NoelReservationForm] Notification non envoyée:', notifErr);
      }

      setSubmittedSummary({
        nom: payload.nom,
        telephone: payload.telephone,
        packNom: payload.pack_nom,
        dateLivraison: payload.date_livraison || 'À convenir',
        villeLieu: payload.ville_lieu,
        typePrestation: payload.type_prestation
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error('[NoelReservationForm] Erreur insertion:', err);
      setErrorMessage(
        err.message ||
        'Une erreur est survenue lors de l\'enregistrement de votre demande. Vous pouvez finaliser directement avec notre équipe via WhatsApp ci-dessous.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Message WhatsApp de secours en cas d'erreur
  const errorWhatsAppMessage = getWhatsAppUrl(
    `Bonjour KPL SERVICES, j'ai rencontré un souci sur le site en réservant ma formule de Noël : "${currentPackNom}" pour le ${dateLivraison || 'mois de décembre'} à ${villeLieu || 'Lomé'}. Mon nom est ${nom || ''} (${telephone || ''}). Pouvez-vous prendre ma réservation directement ?`
  );

  // Message WhatsApp de confirmation
  const confirmationWhatsAppMessage = submittedSummary
    ? getWhatsAppUrl(
        `Bonjour KPL SERVICES ! Je viens d'envoyer ma réservation pour la formule de Noël : "${submittedSummary.packNom}".\n\n- Nom : ${submittedSummary.nom}\n- Téléphone : ${submittedSummary.telephone}\n- Date souhaitée : ${submittedSummary.dateLivraison}\n- Prestation : ${submittedSummary.typePrestation}\n- Lieu : ${submittedSummary.villeLieu}\n\nMerci de me confirmer la disponibilité et le tarif !`
      )
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      {/* Overlay click to close */}
      <div 
        className="fixed inset-0 -z-10" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full md:max-w-2xl bg-white md:rounded-3xl shadow-2xl border border-[#D4AF37]/30 my-0 md:my-8 overflow-hidden min-h-screen md:min-h-0 flex flex-col"
      >
        {/* Header de la modale */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-[#9B1B30] via-[#851629] to-[#E91E8C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <MiniSapin size={22} className="text-[#F4E3A1]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Réservation Spéciale Noël</span>
                <Sparkles className="w-4 h-4 text-[#F4E3A1]" />
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                KPL SERVICES • Événements & Surprises Féeriques
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Fermer la fenêtre"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENU */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-grow">
          {/* CAS 1 : Date limite dépassée */}
          {isDeadlinePassed ? (
            <div className="py-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-red-50 text-[#9B1B30] flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                Les commandes de Noël sont closes
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                La date limite pour réserver en ligne nos surprises et scénographies de fêtes est désormais dépassée afin de garantir la préparation artisanale de toutes les commandes confirmées.
              </p>
              <div className="p-4 bg-[#FFF8F0] border border-[#D4AF37]/30 rounded-2xl mb-6 text-xs text-stone-600 text-left">
                <span className="font-bold text-[#9B1B30] block mb-1">Une demande urgente de dernière minute ?</span>
                Notre standard reste joignable par message instantané pour vérifier d'éventuels créneaux disponibles.
              </div>
              <a
                href={getWhatsAppUrl("Bonjour KPL SERVICES, je souhaite savoir s'il reste une disponibilité de dernière minute pour Noël / Réveillon.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20ba59] transition-all shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Nous contacter sur WhatsApp</span>
              </a>
            </div>
          ) : isSuccess ? (
            /* CAS 2 : Écran de confirmation de succès */
            <div className="py-4 text-center">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Suspense fallback={<div className="w-16 h-16 rounded-full bg-emerald-100 animate-pulse" />}>
                  <CadeauDoreLazy size={72} />
                </Suspense>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Demande bien reçue !</span>
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-2">
                Merci {submittedSummary?.nom} !
              </h3>

              <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed mb-6">
                Votre demande de réservation pour la formule <strong className="text-[#E91E8C] font-semibold">{submittedSummary?.packNom}</strong> a bien été enregistrée par notre équipe.
              </p>

              {/* Récapitulatif élégant */}
              <div className="bg-[#FFF8F0] border border-[#D4AF37]/30 rounded-2xl p-5 mb-6 text-left text-xs sm:text-sm text-stone-700 space-y-2">
                <div className="flex justify-between border-b border-stone-200/50 pb-2">
                  <span className="text-stone-500">Date souhaitée :</span>
                  <span className="font-bold text-[#9B1B30]">{submittedSummary?.dateLivraison}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200/50 pb-2">
                  <span className="text-stone-500">Lieu de livraison :</span>
                  <span className="font-semibold text-gray-800">{submittedSummary?.villeLieu}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200/50 pb-2">
                  <span className="text-stone-500">Prestation :</span>
                  <span className="font-semibold text-gray-800">{submittedSummary?.typePrestation}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-stone-500">Contact :</span>
                  <span className="font-semibold text-gray-800">{submittedSummary?.telephone}</span>
                </div>
              </div>

              <p className="text-xs text-stone-500 mb-6 italic">
                Notre conciergerie vous contactera sous peu pour confirmer la disponibilité exacte du créneau et les détails de livraison.
              </p>

              {/* Bouton WhatsApp direct */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={confirmationWhatsAppMessage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20ba59] transition-all shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Confirmer par WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            /* CAS 3 : Formulaire de réservation */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Message d'erreur avec solution WhatsApp */}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{errorMessage}</p>
                  </div>
                  <a
                    href={errorWhatsAppMessage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-lg bg-[#25D366] text-white font-semibold text-xs hover:bg-[#20ba59] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Transmettre directement sur WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Champ piège invisible anti-spam (honeypot) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="hp_field">Ne pas remplir</label>
                <input
                  id="hp_field"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Formule de Noël */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Formule de Noël choisie</span>
                  <span className="text-[#E91E8C] font-semibold text-xs">
                    {currentPrixPack ? `${new Intl.NumberFormat('fr-FR').format(currentPrixPack).replace(/\u202f/g, ' ')} FCFA` : 'Sur devis'}
                  </span>
                </label>
                <select
                  value={selectedPackChoice}
                  onChange={(e) => setSelectedPackChoice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-[#E91E8C] focus:bg-white outline-none transition-all"
                >
                  {packs.map((pack) => (
                    <option key={pack.id} value={pack.id}>
                      {pack.nom} {pack.prix ? `(${new Intl.NumberFormat('fr-FR').format(pack.prix).replace(/\u202f/g, ' ')} FCFA)` : '(Sur devis)'}
                    </option>
                  ))}
                  <option value="custom">✨ Projet Sur Mesure (Devis personnalisé)</option>
                </select>
              </div>

              {/* Type de prestation */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  Type de prestation
                </label>
                <select
                  value={typePrestation}
                  onChange={(e) => setTypePrestation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-[#E91E8C] focus:bg-white outline-none transition-all"
                >
                  {PRESTATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nom & Téléphone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Nom complet <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Akouvi Mensah"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 outline-none transition-all ${
                      validationErrors.nom
                        ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400'
                        : 'border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#E91E8C]'
                    }`}
                  />
                  {validationErrors.nom && (
                    <p className="text-[11px] text-red-600 mt-1">{validationErrors.nom}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>Téléphone (WhatsApp) <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex : +228 90 00 00 00"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 outline-none transition-all ${
                      validationErrors.telephone
                        ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400'
                        : 'border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#E91E8C]'
                    }`}
                  />
                  {validationErrors.telephone && (
                    <p className="text-[11px] text-red-600 mt-1">{validationErrors.telephone}</p>
                  )}
                </div>
              </div>

              {/* Email & Ville/Lieu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>Email (facultatif)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 outline-none transition-all ${
                      validationErrors.email
                        ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400'
                        : 'border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#E91E8C]'
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="text-[11px] text-red-600 mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>Lieu / Ville de livraison <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Lomé, Baguida, Adidogomé..."
                    value={villeLieu}
                    onChange={(e) => setVilleLieu(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 outline-none transition-all ${
                      validationErrors.villeLieu
                        ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400'
                        : 'border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#E91E8C]'
                    }`}
                  />
                  {validationErrors.villeLieu && (
                    <p className="text-[11px] text-red-600 mt-1">{validationErrors.villeLieu}</p>
                  )}
                </div>
              </div>

              {/* Date souhaitée & Raccourcis festifs */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Date souhaitée</span>
                  </span>
                  {dateShortcuts.length > 0 && (
                    <span className="text-[11px] text-[#E91E8C] font-semibold">Raccourcis réveillon :</span>
                  )}
                </label>

                {/* Boutons raccourcis cliquables (24, 25, 31 décembre) */}
                {dateShortcuts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {dateShortcuts.map((sc) => (
                      <button
                        key={sc.value}
                        type="button"
                        onClick={() => setDateLivraison(sc.value)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                          dateLivraison === sc.value
                            ? 'bg-[#E91E8C] text-white border-[#E91E8C] shadow-sm'
                            : 'bg-[#FFF8F0] text-[#9B1B30] border-[#D4AF37]/40 hover:bg-[#F4E3A1]/30'
                        }`}
                      >
                        🎄 {sc.label}
                      </button>
                    ))}
                  </div>
                )}

                <input
                  type="date"
                  min={todayStr}
                  value={dateLivraison}
                  onChange={(e) => setDateLivraison(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-[#E91E8C] focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Heure souhaitée & Budget estimé */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Créneau de livraison</span>
                  </label>
                  <select
                    value={heureLivraison}
                    onChange={(e) => setHeureLivraison(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-[#E91E8C] focus:bg-white outline-none transition-all"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                    <span>Budget estimé (facultatif)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : 50 000 FCFA"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-[#E91E8C] focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              {/* Notes et demandes particulières */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span>Notes & Précisions pour nos décorateurs (facultatif)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={2000}
                  placeholder="Thème de couleurs souhaité, heure précise de livraison, indications particulières pour l'accès..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-[#E91E8C] focus:bg-white outline-none transition-all resize-none"
                />
              </div>

              {/* Bouton de validation */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-base text-white bg-gradient-to-r from-[#9B1B30] to-[#E91E8C] hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Enregistrement en cours...</span>
                    </>
                  ) : (
                    <>
                      <TreePine className="w-5 h-5 text-[#F4E3A1]" />
                      <span>Confirmer ma réservation de Noël</span>
                    </>
                  )}
                </button>
              </div>

              {/* Lien secondaire WhatsApp */}
              <div className="text-center pt-1 border-t border-stone-100">
                <a
                  href={getWhatsAppUrl("Bonjour KPL SERVICES, j'ai une question concernant les réservations de Noël.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#25D366] font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Une question ? Écrivez-nous sur WhatsApp</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
