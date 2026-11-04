import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Sparkles, MessageCircle, ArrowRight, TreePine } from 'lucide-react';
import { useNoel } from '../../context/NoelContext';
import { supabase } from '../../lib/supabase';
import { SEO } from '../../components/SEO';
import { Countdown } from '../../components/noel/Countdown';
import { MiniSapin, Etoile } from '../../components/noel/assets';
import { getWhatsAppUrl } from '../../components/ui/WhatsAppButton';
import { NoelReservationForm } from '../../components/noel/NoelReservationForm';

// Lazy loading du décor festif pour respecter la contrainte de performance
const HeroDecorations = lazy(() => import('../../components/noel/HeroDecorations'));

interface PackNoel {
  id: string;
  nom: string;
  description: string | null;
  prix: number | null;
  contenu: string[];
  actif: boolean;
  ordre: number;
}

function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || price === ('' as any)) {
    return 'Sur devis';
  }
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return 'Sur devis';
  return `${new Intl.NumberFormat('fr-FR').format(num).replace(/\u202f/g, ' ')} FCFA`;
}

export default function NoelPage() {
  const { isNoel, settings, loading } = useNoel();
  const shouldReduceMotion = useReducedMotion();

  const [packs, setPacks] = useState<PackNoel[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(true);

  // État de la modale de réservation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackForModal, setSelectedPackForModal] = useState<{
    id: string | null;
    nom: string | null;
    prix: number | null;
  }>({ id: null, nom: null, prix: null });

  // Chargement des packs actifs
  useEffect(() => {
    if (!isNoel) return;

    const fetchPacks = async () => {
      try {
        const { data, error } = await supabase
          .from('packs_noel')
          .select('*')
          .eq('actif', true)
          .order('ordre', { ascending: true });

        if (error) {
          console.error('[NoelPage] Erreur lecture packs_noel:', error);
          setPacks([]);
        } else {
          setPacks(data || []);
        }
      } catch (err) {
        console.error('[NoelPage] Erreur inattendue:', err);
        setPacks([]);
      } finally {
        setLoadingPacks(false);
      }
    };

    fetchPacks();
  }, [isNoel]);

  // Si le chargement initial du contexte n'est pas terminé, ne rien afficher pour éviter une redirection prématurée
  if (loading && settings === null) {
    return null;
  }

  // Si le mode Noël est désactivé, redirection immédiate vers l'accueil
  if (!isNoel && !loading) {
    return <Navigate to="/" replace />;
  }

  // Ouverture modale pour un pack spécifique
  const handleOpenPackModal = (pack: PackNoel) => {
    setSelectedPackForModal({
      id: pack.id,
      nom: pack.nom,
      prix: pack.prix,
    });
    setIsModalOpen(true);
  };

  // Ouverture modale pour projet sur mesure
  const handleOpenCustomModal = () => {
    setSelectedPackForModal({
      id: null,
      nom: 'Sur mesure',
      prix: null,
    });
    setIsModalOpen(true);
  };

  // Ouverture générique depuis le bouton hero
  const handleOpenHeroModal = () => {
    if (packs.length > 0) {
      setSelectedPackForModal({
        id: packs[0].id,
        nom: packs[0].nom,
        prix: packs[0].prix,
      });
    } else {
      setSelectedPackForModal({
        id: null,
        nom: 'Sur mesure',
        prix: null,
      });
    }
    setIsModalOpen(true);
  };

  // Lien WhatsApp secondaire
  const secondaryWhatsAppLink = getWhatsAppUrl(
    "Bonjour KPL SERVICES, j'ai une question concernant les réservations et formules de Noël."
  );

  return (
    <div className="flex flex-col w-full bg-white">
      <SEO
        title="Formules de Noël & Fêtes"
        description="Vivez la magie des fêtes avec KPL SERVICES à Lomé. Découvrez nos formules féeriques pour enfants, couples et réceptions de fin d'année."
      />

      {/* HERO FESTIF */}
      <section className="relative w-full bg-[#FFF8F0] border-b border-[#F4E3A1]/50 py-16 md:py-24 px-4 overflow-hidden">
        {/* Décorations festives en lazy load */}
        {isNoel && (
          <Suspense fallback={null}>
            <HeroDecorations />
          </Suspense>
        )}

        <div className="relative max-w-4xl mx-auto text-center z-10">
          {/* Badge chic */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#D4AF37]/40 shadow-sm text-xs font-bold text-[#9B1B30] uppercase tracking-wider mb-6"
          >
            <MiniSapin size={16} />
            <span>Édition Spéciale Fêtes de Fin d'Année</span>
            <Etoile size={14} />
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6"
          >
            La magie de Noël avec{' '}
            <span className="text-[#E91E8C]">KPL SERVICES</span>
          </motion.h1>

          {/* Phrase d'accroche */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed mb-6"
          >
            Des scénographies féeriques, des surprises chaleureuses et une organisation raffinée pour illuminer vos réveillons et célébrations de Noël.
          </motion.p>

          {/* Bouton principal de réservation & Lien secondaire WhatsApp */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <button
              onClick={handleOpenHeroModal}
              className="px-8 py-4 bg-gradient-to-r from-[#9B1B30] to-[#E91E8C] hover:opacity-95 text-white rounded-xl text-base sm:text-lg font-bold transition-all shadow-xl hover:shadow-2xl border border-[#F4E3A1]/40 flex items-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <TreePine className="w-5 h-5 text-[#F4E3A1]" />
              <span>Réserver ma surprise de Noël</span>
            </button>

            <a
              href={secondaryWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-4 bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 rounded-xl text-sm font-semibold transition-all border border-stone-200 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Une question ? Écrivez-nous sur WhatsApp</span>
            </a>
          </motion.div>

          {/* Compte à rebours large si date limite définie */}
          {settings?.date_limite_commandes && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Countdown targetDate={settings.date_limite_commandes} variant="large" />
            </motion.div>
          )}
        </div>
      </section>

      {/* SECTION FORMULES DE NOËL */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#E91E8C] mb-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Nos Offres Festives</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Choisissez votre formule de Noël
          </h2>
          <p className="text-stone-500 mt-2 max-w-xl mx-auto text-sm sm:text-base">
            Chaque formule est minutieusement préparée par nos équipes pour vous offrir un moment d'émerveillement inoubliable.
          </p>
        </div>

        {/* Grille des packs ou bloc d'attente */}
        {loadingPacks ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#E91E8C] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-stone-500 mt-3 font-medium">Préparation des offres féeriques...</p>
          </div>
        ) : packs.length === 0 ? (
          /* Bloc élégant quand aucun pack n'est encore publié */
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto my-8 p-8 md:p-12 rounded-3xl bg-gradient-to-b from-[#FFF8F0] to-white border border-[#D4AF37]/30 text-center shadow-lg"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-pink-50 rounded-2xl flex items-center justify-center text-[#E91E8C]">
              <MiniSapin size={36} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Nos formules de Noël arrivent très bientôt
            </h3>
            <p className="text-stone-600 text-sm md:text-base leading-relaxed mb-6">
              Nos équipes finalisent actuellement les scénographies et les surprises de fin d'année. Pour toute demande urgente ou réservation anticipée, écrivez-nous directement sur WhatsApp.
            </p>
            <a
              href={secondaryWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-white bg-[#25D366] hover:bg-[#20ba59] shadow-md hover:shadow-lg transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Contacter KPL SERVICES sur WhatsApp</span>
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {packs.map((pack, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={pack.id}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="relative flex flex-col bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border-2 border-stone-100 hover:border-[#D4AF37]/50"
                >
                  {/* Badge icône alterné */}
                  <div className="absolute -top-3.5 left-8 bg-[#FFF8F0] border border-[#D4AF37]/40 px-3 py-0.5 rounded-full text-xs font-semibold text-[#9B1B30] flex items-center gap-1.5 shadow-sm">
                    {isEven ? <MiniSapin size={14} /> : <Etoile size={13} />}
                    <span>Formule Féerique</span>
                  </div>

                  {/* Header de la carte */}
                  <div className="text-center mb-6 pt-2">
                    <h3 className="text-xl font-bold text-[#E91E8C] mb-3 leading-snug">
                      {pack.nom}
                    </h3>

                    <div className="text-2xl lg:text-3xl font-black text-[#D4AF37] mb-2 tracking-tight">
                      {formatPrice(pack.prix)}
                    </div>

                    {pack.description && (
                      <p className="text-xs text-stone-500 leading-relaxed italic mt-2">
                        {pack.description}
                      </p>
                    )}
                  </div>

                  {/* Liste des prestations incluses */}
                  <div className="flex-grow my-4 pt-4 border-t border-stone-100">
                    <ul className="space-y-3.5">
                      {pack.contenu && pack.contenu.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bouton de réservation ouvrant le formulaire modal */}
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => handleOpenPackModal(pack)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#E91E8C] hover:bg-[#d8157f] active:scale-[0.99] shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <TreePine className="w-4 h-4 text-[#F4E3A1]" />
                      <span>Réserver cette formule</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {/* Carte Sur-Mesure */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: packs.length * 0.08 }}
              className="relative flex flex-col justify-between bg-gradient-to-br from-[#FFF8F0] via-white to-[#FFFDF9] rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border-2 border-dashed border-[#D4AF37]/60"
            >
              <div>
                <div className="text-center mb-6 pt-2">
                  <div className="w-12 h-12 mx-auto mb-3 bg-[#D4AF37]/15 rounded-full flex items-center justify-center text-[#D4AF37]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Projet Sur Mesure
                  </h3>
                  <div className="text-xl font-extrabold text-[#D4AF37]">
                    Sur devis personnalisé
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed text-center mb-6">
                  Vous préparez un arbre de Noël d'entreprise, un dîner de réveillon d'envergure ou vous avez un concept particulier en tête ? Notre équipe conçoit votre décor de A à Z.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Scénographie & sapins XXL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lumières & décors féeriques personnalisés</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Animation Père Noël & logistique complète</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-200/60">
                <button
                  type="button"
                  onClick={handleOpenCustomModal}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-gray-900 bg-stone-100 hover:bg-stone-200 transition-colors shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Demander un devis sur mesure</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      {/* SECTION COMMENT ÇA MARCHE */}
      <section className="py-16 md:py-20 bg-stone-50 border-t border-stone-200/60 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Comment réserver votre magie de Noël ?
            </h2>
            <p className="text-stone-500 text-sm mt-2">
              Un processus simple et serein en 3 étapes pour préparer vos fêtes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Étape 1 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm text-center relative">
              <div className="w-12 h-12 rounded-full bg-pink-50 text-[#E91E8C] font-black text-lg flex items-center justify-center mx-auto mb-4 border border-pink-100">
                1
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Choisissez votre formule
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Parcourez nos offres de Noël et sélectionnez la prestation adaptée à votre famille, votre couple ou votre entreprise.
              </p>
            </div>

            {/* Étape 2 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm text-center relative">
              <div className="w-12 h-12 rounded-full bg-[#FFF8F0] text-[#D4AF37] font-black text-lg flex items-center justify-center mx-auto mb-4 border border-[#F4E3A1]/50">
                2
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Envoyez votre demande
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Remplissez notre formulaire en quelques clics en choisissant votre date (24, 25 ou 31 déc.) et votre lieu de livraison.
              </p>
            </div>

            {/* Étape 3 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm text-center relative">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 font-black text-lg flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                3
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Nous créons la magie
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Installation scénographique, livraison surprise ou visite du Père Noël : notre équipe gère tout avec le plus grand soin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODALE DE RÉSERVATION NOËL */}
      <NoelReservationForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialPackId={selectedPackForModal.id}
        initialPackNom={selectedPackForModal.nom}
        initialPrixPack={selectedPackForModal.prix}
        packs={packs.map((p) => ({ id: p.id, nom: p.nom, prix: p.prix }))}
        dateLimiteCommandes={settings?.date_limite_commandes || null}
      />
    </div>
  );
}
