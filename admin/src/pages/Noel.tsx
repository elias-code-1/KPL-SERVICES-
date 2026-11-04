import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TreePine, 
  Settings as SettingsIcon, 
  Package, 
  CalendarCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Calendar, 
  Clock, 
  Type, 
  X, 
  Sparkles,
  Info,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NoelReservations } from '../components/NoelReservations';

export type NoelMode = 'off' | 'on' | 'auto';

export interface NoelSettings {
  mode: NoelMode;
  date_debut: string; // YYYY-MM-DD
  date_fin: string; // YYYY-MM-DD
  texte_banniere: string;
  date_limite_commandes: string | null;
}

export interface PackNoel {
  id: string;
  nom: string;
  description: string | null;
  prix: number | null; // null = Sur devis
  contenu: string[];
  actif: boolean;
  ordre: number;
  created_at?: string;
}

const DEFAULT_SETTINGS: NoelSettings = {
  mode: 'off',
  date_debut: '2026-12-01',
  date_fin: '2027-01-02',
  texte_banniere: 'Les réservations pour Noël et le Réveillon sont ouvertes ! Places limitées',
  date_limite_commandes: null,
};

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function computeIsNoel(mode: NoelMode, dateDebut: string, dateFin: string): boolean {
  if (mode === 'on') return true;
  if (mode === 'off') return false;
  if (mode === 'auto') {
    const todayStr = getLocalDateString();
    return todayStr >= dateDebut && todayStr <= dateFin;
  }
  return false;
}

function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
}

function datetimeLocalToIso(val: string): string | null {
  if (!val || !val.trim()) return null;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

// Formatage de prix identique à la page Tarifs (ex: 25 000 FCFA ou Sur devis)
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || price === ('' as any)) {
    return 'Sur devis';
  }
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return 'Sur devis';
  return `${new Intl.NumberFormat('fr-FR').format(num).replace(/\u202f/g, ' ')} FCFA`;
}

export default function Noel() {
  const [activeTab, setActiveTab] = useState<'reglages' | 'reservations' | 'packs'>('reglages');

  // Form state Réglages
  const [mode, setMode] = useState<NoelMode>(DEFAULT_SETTINGS.mode);
  const [dateDebut, setDateDebut] = useState<string>(DEFAULT_SETTINGS.date_debut);
  const [dateFin, setDateFin] = useState<string>(DEFAULT_SETTINGS.date_fin);
  const [texteBanniere, setTexteBanniere] = useState<string>(DEFAULT_SETTINGS.texte_banniere);
  const [dateLimiteCommandes, setDateLimiteCommandes] = useState<string>('');

  // Persisted state from DB to power the live indicator ACTIF / INACTIF
  const [persistedSettings, setPersistedSettings] = useState<NoelSettings>(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // State Packs
  const [packs, setPacks] = useState<PackNoel[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [packsError, setPacksError] = useState<string | null>(null);

  // Modal Pack (Ajout / Modification)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<PackNoel | null>(null);
  const [modalNom, setModalNom] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalPrix, setModalPrix] = useState<string>(''); // string pour gérer le champ vide
  const [modalContenu, setModalContenu] = useState<string[]>([]);
  const [newContenuLine, setNewContenuLine] = useState('');
  const [modalActif, setModalActif] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Chargement des réglages généraux
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'noel')
        .maybeSingle();

      if (error) throw error;

      const rawValue = data?.value;
      const merged: NoelSettings = {
        ...DEFAULT_SETTINGS,
        ...(rawValue && typeof rawValue === 'object' ? rawValue : {}),
      };

      setMode(merged.mode || DEFAULT_SETTINGS.mode);
      setDateDebut(merged.date_debut || DEFAULT_SETTINGS.date_debut);
      setDateFin(merged.date_fin || DEFAULT_SETTINGS.date_fin);
      setTexteBanniere(merged.texte_banniere || DEFAULT_SETTINGS.texte_banniere);
      setDateLimiteCommandes(isoToDatetimeLocal(merged.date_limite_commandes));
      setPersistedSettings(merged);
    } catch (err: any) {
      console.error('Erreur chargement réglages Noël:', err);
      setFetchError(err.message || 'Impossible de contacter Supabase pour lire la table site_settings.');
      showToast(err.message || 'Erreur lors du chargement des réglages', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement des packs de Noël
  const fetchPacks = useCallback(async () => {
    setLoadingPacks(true);
    setPacksError(null);
    try {
      const { data, error } = await supabase
        .from('packs_noel')
        .select('*')
        .order('ordre', { ascending: true });

      if (error) {
        throw error;
      }

      setPacks(data || []);
    } catch (err: any) {
      console.error('Erreur chargement packs Noël:', err);
      setPacksError(
        err.message ||
        "Impossible de lire la table 'packs_noel'. Veuillez exécuter le script supabase_noel_phase3.sql dans l'éditeur SQL de Supabase."
      );
      showToast('Impossible de charger les packs de Noël', 'error');
    } finally {
      setLoadingPacks(false);
    }
  }, []);

  // State Réservations reçues (pour badge d'onglet)
  const [recuReservationsCount, setRecuReservationsCount] = useState<number>(0);

  const fetchRecuCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('reservations_noel')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'recu');
      if (!error && typeof count === 'number') {
        setRecuReservationsCount(count);
      }
    } catch {
      // Ignore si la table n'existe pas encore
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchRecuCount();

    const channel = supabase
      .channel('noel_page_reservations_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations_noel' }, () => {
        fetchRecuCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings, fetchRecuCount]);

  useEffect(() => {
    if (activeTab === 'packs') {
      fetchPacks();
    }
  }, [activeTab, fetchPacks]);

  // Sauvegarde des réglages du mode Noël
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (import.meta.env.DEV) {
      let hostname = '';
      try {
        hostname = new URL(import.meta.env.VITE_SUPABASE_URL).hostname;
      } catch {
        hostname = 'invalide';
      }
      console.log('[Noël] Clic Enregistrer:', {
        mode,
        dateDebut,
        dateFin,
        texteBanniere,
        dateLimiteCommandes,
        supabaseHost: hostname,
      });
    }

    // Validation explicite pour éviter tout blocage silencieux
    if (!dateDebut || !dateFin) {
      showToast('Veuillez renseigner les dates de début et de fin.', 'error');
      return;
    }
    if (!texteBanniere.trim()) {
      showToast('Veuillez renseigner le texte de la bannière.', 'error');
      return;
    }

    // Vérification de la session active
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        showToast('Session expirée, reconnectez-vous', 'error');
        if (import.meta.env.DEV) {
          console.warn('[Noël] Session expirée ou absente:', sessionError);
        }
        return;
      }
    } catch (sessionErr: any) {
      showToast('Session expirée, reconnectez-vous', 'error');
      return;
    }

    setSaving(true);

    try {
      const payload: NoelSettings = {
        mode,
        date_debut: dateDebut,
        date_fin: dateFin,
        texte_banniere: texteBanniere,
        date_limite_commandes: datetimeLocalToIso(dateLimiteCommandes),
      };

      const { data, error } = await supabase
        .from('site_settings')
        .upsert(
          {
            key: 'noel',
            value: payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        )
        .select()
        .single();

      if (import.meta.env.DEV) {
        console.log('[Noël] Résultat upsert:', { data, error });
      }

      if (error || !data) {
        const code = error?.code ? ` [Code: ${error.code}]` : '';
        const msg = error?.message || 'Aucune ligne retournée après enregistrement.';
        showToast(`Erreur Supabase${code} : ${msg}`, 'error');
        return;
      }

      // Après un succès, relis la ligne depuis la base et mets l'indicateur ACTIF ou INACTIF à jour à partir de cette lecture
      const { data: reloadedData, error: reloadError } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'noel')
        .single();

      const confirmedValue = ((!reloadError && reloadedData?.value) ? reloadedData.value : data.value) as NoelSettings;
      setPersistedSettings(confirmedValue);
      setMode(confirmedValue.mode || DEFAULT_SETTINGS.mode);
      setDateDebut(confirmedValue.date_debut || DEFAULT_SETTINGS.date_debut);
      setDateFin(confirmedValue.date_fin || DEFAULT_SETTINGS.date_fin);
      setTexteBanniere(confirmedValue.texte_banniere || DEFAULT_SETTINGS.texte_banniere);
      setDateLimiteCommandes(isoToDatetimeLocal(confirmedValue.date_limite_commandes));

      showToast('Réglages de Noël enregistrés avec succès !', 'success');
    } catch (err: any) {
      console.error('Erreur enregistrement réglages Noël:', err);
      const code = err?.code ? ` [Code: ${err.code}]` : '';
      showToast(`Erreur${code} : ${err?.message || "Erreur lors de l'enregistrement dans Supabase"}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Gestion du toggle rapide de publication d'un pack
  const handleToggleActif = async (pack: PackNoel) => {
    const nextActif = !pack.actif;

    // Validation stricte : bloquer la publication si pas de nom ou aucune ligne de contenu
    if (nextActif) {
      if (!pack.nom.trim()) {
        showToast('Impossible de publier un pack sans nom.', 'error');
        return;
      }
      if (!pack.contenu || pack.contenu.length === 0) {
        showToast('Impossible de publier un pack sans aucune prestation de contenu.', 'error');
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('packs_noel')
        .update({ actif: nextActif })
        .eq('id', pack.id);

      if (error) throw error;

      setPacks((prev) =>
        prev.map((p) => (p.id === pack.id ? { ...p, actif: nextActif } : p))
      );
      showToast(
        nextActif ? `Le pack "${pack.nom}" est maintenant publié.` : `Le pack "${pack.nom}" est repassé en brouillon.`,
        'success'
      );
    } catch (err: any) {
      console.error('Erreur modification statut pack:', err);
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    }
  };

  // Échange d'ordre avec le pack précédent ou suivant
  const handleMovePack = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= packs.length) return;

    const currentPack = packs[index];
    const targetPack = packs[targetIndex];

    const currentOrdre = currentPack.ordre;
    const targetOrdre = targetPack.ordre;

    // Si les ordres sont identiques par accident, on décale
    const newCurrentOrdre = currentOrdre === targetOrdre ? targetOrdre + (direction === 'up' ? -1 : 1) : targetOrdre;
    const newTargetOrdre = currentOrdre;

    try {
      // Mise à jour des deux packs
      const update1 = supabase
        .from('packs_noel')
        .update({ ordre: newCurrentOrdre })
        .eq('id', currentPack.id);

      const update2 = supabase
        .from('packs_noel')
        .update({ ordre: newTargetOrdre })
        .eq('id', targetPack.id);

      const [res1, res2] = await Promise.all([update1, update2]);

      if (res1.error) throw res1.error;
      if (res2.error) throw res2.error;

      // Réactualisation locale et tri
      const updatedPacks = [...packs];
      updatedPacks[index] = { ...currentPack, ordre: newCurrentOrdre };
      updatedPacks[targetIndex] = { ...targetPack, ordre: newTargetOrdre };
      updatedPacks.sort((a, b) => a.ordre - b.ordre);

      setPacks(updatedPacks);
      showToast("Ordre d'affichage mis à jour.", 'success');
    } catch (err: any) {
      console.error('Erreur réordonnancement packs:', err);
      showToast(err.message || 'Erreur lors du déplacement', 'error');
    }
  };

  // Suppression d'un pack
  const handleDeletePack = async (pack: PackNoel) => {
    const confirmed = window.confirm(
      `Êtes-vous certain de vouloir supprimer définitivement le pack "${pack.nom}" ?`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('packs_noel')
        .delete()
        .eq('id', pack.id);

      if (error) throw error;

      setPacks((prev) => prev.filter((p) => p.id !== pack.id));
      showToast(`Le pack "${pack.nom}" a été supprimé.`, 'success');
    } catch (err: any) {
      console.error('Erreur suppression pack:', err);
      showToast(err.message || 'Erreur lors de la suppression', 'error');
    }
  };

  // Ouverture modale d'ajout
  const handleOpenAddModal = () => {
    setEditingPack(null);
    setModalNom('');
    setModalDescription('');
    setModalPrix('');
    setModalContenu([]);
    setNewContenuLine('');
    setModalActif(false);
    setIsModalOpen(true);
  };

  // Ouverture modale d'édition
  const handleOpenEditModal = (pack: PackNoel) => {
    setEditingPack(pack);
    setModalNom(pack.nom);
    setModalDescription(pack.description || '');
    setModalPrix(pack.prix !== null && pack.prix !== undefined ? String(pack.prix) : '');
    setModalContenu(Array.isArray(pack.contenu) ? [...pack.contenu] : []);
    setNewContenuLine('');
    setModalActif(pack.actif);
    setIsModalOpen(true);
  };

  // Ajout d'une ligne de contenu
  const handleAddContenuLine = () => {
    const trimmed = newContenuLine.trim();
    if (!trimmed) return;
    setModalContenu((prev) => [...prev, trimmed]);
    setNewContenuLine('');
  };

  // Suppression d'une ligne de contenu
  const handleRemoveContenuLine = (idx: number) => {
    setModalContenu((prev) => prev.filter((_, i) => i !== idx));
  };

  // Enregistrement pack (création / modification)
  const handleSavePackModal = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNom = modalNom.trim();
    if (!cleanNom) {
      showToast('Le nom du pack est obligatoire.', 'error');
      return;
    }

    // Validation de publication : bloquer si actif est coché mais aucune prestation
    if (modalActif && modalContenu.length === 0) {
      showToast('Impossible de publier un pack sans aucune ligne de contenu.', 'error');
      return;
    }

    setModalSaving(true);

    try {
      const parsedPrix = modalPrix.trim() === '' ? null : parseFloat(modalPrix);
      if (parsedPrix !== null && isNaN(parsedPrix)) {
        showToast('Le prix saisi est invalide.', 'error');
        setModalSaving(false);
        return;
      }

      if (editingPack) {
        // Modification
        const { error } = await supabase
          .from('packs_noel')
          .update({
            nom: cleanNom,
            description: modalDescription.trim() || null,
            prix: parsedPrix,
            contenu: modalContenu,
            actif: modalActif,
          })
          .eq('id', editingPack.id);

        if (error) throw error;

        showToast(`Pack "${cleanNom}" mis à jour avec succès.`, 'success');
      } else {
        // Création : assigner ordre max + 1
        const maxOrdre = packs.reduce((max, p) => Math.max(max, p.ordre), 0);
        const { error } = await supabase
          .from('packs_noel')
          .insert({
            nom: cleanNom,
            description: modalDescription.trim() || null,
            prix: parsedPrix,
            contenu: modalContenu,
            actif: modalActif,
            ordre: maxOrdre + 1,
          });

        if (error) throw error;

        showToast(`Pack "${cleanNom}" créé avec succès.`, 'success');
      }

      setIsModalOpen(false);
      fetchPacks();
    } catch (err: any) {
      console.error('Erreur enregistrement pack:', err);
      showToast(err.message || "Erreur lors de l'enregistrement", 'error');
    } finally {
      setModalSaving(false);
    }
  };

  const isCurrentlyActive = computeIsNoel(
    persistedSettings.mode,
    persistedSettings.date_debut,
    persistedSettings.date_fin
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-50 text-[#E91E8C] rounded-lg">
              <TreePine className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Noël</h1>
          </div>
          <p className="text-gray-500 mt-1">
            Gérez l'activation du mode Noël, les packs de fêtes et les réservations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('reglages')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${
            activeTab === 'reglages'
              ? 'bg-white text-[#E91E8C] shadow-sm border border-gray-200'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          Réglages
        </button>

        <button
          onClick={() => setActiveTab('packs')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${
            activeTab === 'packs'
              ? 'bg-white text-[#E91E8C] shadow-sm border border-gray-200'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Packs
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'reservations'
              ? 'bg-white text-[#E91E8C] shadow-sm border border-gray-200'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Réservations</span>
          {recuReservationsCount > 0 && (
            <span className="text-[10px] font-bold bg-[#E91E8C] text-white px-2 py-0.5 rounded-full shadow-sm">
              {recuReservationsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1 : RÉGLAGES */}
      {activeTab === 'reglages' && (
        <>
          {/* Error message banner */}
          {fetchError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Erreur lors de la lecture de Supabase</p>
                <p className="text-xs text-red-700 mt-1">{fetchError}</p>
                <p className="text-xs text-red-600 mt-2">
                  Vérifiez que la table <code className="bg-red-100 px-1 py-0.5 rounded font-mono">site_settings</code> est bien accessible.
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-gray-100 shadow-sm max-w-4xl">
              <Loader2 className="w-8 h-8 text-[#E91E8C] animate-spin mb-3" />
              <p className="text-sm text-gray-500 font-medium">Chargement des réglages de Noël...</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl space-y-6"
            >
              {/* Main Settings Card */}
              <motion.section
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Card Header with Live Status Indicator */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-pink-50/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-50 text-[#E91E8C] rounded-lg">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Configuration du Mode Noël</h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Contrôlez la visibilité du thème et de la bannière sur le site public
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div
                    className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isCurrentlyActive
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm'
                        : 'bg-gray-100 border-gray-200 text-gray-600'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCurrentlyActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                      }`}
                    />
                    <span>
                      Le mode Noël est actuellement{' '}
                      <strong className={isCurrentlyActive ? 'text-emerald-700' : 'text-gray-800'}>
                        {isCurrentlyActive ? 'ACTIF' : 'INACTIF'}
                      </strong>{' '}
                      sur le site
                    </span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveSettings} noValidate className="p-6 space-y-6">
                  {/* Segmented Mode Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Mode d'activation
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-xl border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setMode('off')}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center ${
                          mode === 'off'
                            ? 'bg-white text-gray-900 shadow-sm font-semibold'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Désactivé
                      </button>

                      <button
                        type="button"
                        onClick={() => setMode('auto')}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center ${
                          mode === 'auto'
                            ? 'bg-white text-[#E91E8C] shadow-sm font-semibold ring-1 ring-[#E91E8C]/20'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Automatique (selon dates)
                      </button>

                      <button
                        type="button"
                        onClick={() => setMode('on')}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center ${
                          mode === 'on'
                            ? 'bg-[#E91E8C] text-white shadow-sm font-semibold'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Activé en permanence
                      </button>
                    </div>

                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {mode === 'off' && (
                        <span>Le thème de Noël reste éteint en toutes circonstances.</span>
                      )}
                      {mode === 'auto' && (
                        <span>
                          Actif uniquement si la date du jour ({getLocalDateString()}) est comprise entre{' '}
                          <strong>{dateDebut}</strong> et <strong>{dateFin}</strong> inclus.
                        </span>
                      )}
                      {mode === 'on' && (
                        <span className="text-[#E91E8C] font-medium">
                          Le thème de Noël sera immédiatement actif sur le site public pour tous les visiteurs.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dates début et fin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Date de début (mode auto)
                      </label>
                      <input
                        type="date"
                        required
                        value={dateDebut}
                        onChange={(e) => setDateDebut(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none transition-all text-sm text-gray-800"
                      />
                      <p className="text-xs text-gray-400 mt-1">Inclus dans la période d'activation automatique.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Date de fin (mode auto)
                      </label>
                      <input
                        type="date"
                        required
                        value={dateFin}
                        onChange={(e) => setDateFin(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none transition-all text-sm text-gray-800"
                      />
                      <p className="text-xs text-gray-400 mt-1">Dernier jour où le mode Noël reste actif.</p>
                    </div>
                  </div>

                  {/* Texte de la bannière */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-gray-400" />
                      Texte de la bannière
                    </label>
                    <input
                      type="text"
                      required
                      value={texteBanniere}
                      onChange={(e) => setTexteBanniere(e.target.value)}
                      placeholder="Ex : Les réservations pour Noël et le Réveillon sont ouvertes ! Places limitées"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none transition-all text-sm text-gray-800"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Message promotionnel affiché en en-tête sur le site lorsque le mode Noël est actif.
                    </p>
                  </div>

                  {/* Date limite des commandes */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        Date limite des commandes (optionnel)
                      </label>
                      {dateLimiteCommandes && (
                        <button
                          type="button"
                          onClick={() => setDateLimiteCommandes('')}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Effacer la date
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        value={dateLimiteCommandes}
                        onChange={(e) => setDateLimiteCommandes(e.target.value)}
                        className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none transition-all text-sm text-gray-800"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Laissez vide si aucune date butoir n'est fixée pour les commandes de Noël.
                    </p>
                  </div>

                  {/* Submit button */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#E91E8C] hover:bg-[#d8157f] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm transition-all"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enregistrement...</span>
                        </>
                      ) : (
                        <span>Enregistrer</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.section>
            </motion.div>
          )}
        </>
      )}

      {/* TAB 2 : PACKS */}
      {activeTab === 'packs' && (
        <div className="max-w-5xl space-y-6">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Formules & Packs de Noël</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Organisez et publiez vos offres de fête sur la page publique /noel
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#E91E8C] hover:bg-[#d8157f] shadow-sm transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un pack</span>
            </button>
          </div>

          {/* Erreur packs */}
          {packsError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Table packs_noel introuvable ou erreur de lecture</p>
                <p className="text-xs text-red-700 mt-1">{packsError}</p>
                <p className="text-xs text-red-600 mt-2 font-medium">
                  Veuillez coller et exécuter le fichier <code className="bg-red-100 px-1 py-0.5 rounded font-mono">supabase_noel_phase3.sql</code> dans le SQL Editor de Supabase pour créer la table et activer les droits.
                </p>
              </div>
            </div>
          )}

          {/* Liste des packs */}
          {loadingPacks ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Loader2 className="w-8 h-8 text-[#E91E8C] animate-spin mb-3" />
              <p className="text-sm text-gray-500 font-medium">Chargement des packs de Noël...</p>
            </div>
          ) : packs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-xl border border-dashed border-gray-300">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">Aucun pack de Noël pour l'instant</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                Commencez par créer votre première formule festive ou chargez les brouillons initiaux via le script SQL.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#E91E8C] hover:bg-[#d8157f]"
              >
                <Plus className="w-4 h-4" />
                Ajouter un pack
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {packs.map((pack, idx) => (
                <div
                  key={pack.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Left: Reorder buttons & Pack Details */}
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Up / Down arrows */}
                    <div className="flex flex-col gap-1 items-center justify-center pr-2 border-r border-gray-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMovePack(idx, 'up')}
                        disabled={idx === 0}
                        title="Monter"
                        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePack(idx, 'down')}
                        disabled={idx === packs.length - 1}
                        title="Descendre"
                        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Pack Info */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900">{pack.nom}</h3>
                        
                        {/* Statut Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            pack.actif
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              pack.actif ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          {pack.actif ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>

                      {pack.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {pack.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        {/* Prix */}
                        <span className="font-bold text-[#D4AF37]">
                          {formatPrice(pack.prix)}
                        </span>

                        <span>•</span>

                        {/* Lignes de contenu */}
                        <span className="flex items-center gap-1 text-gray-500">
                          <Layers className="w-3.5 h-3.5 text-gray-400" />
                          {pack.contenu?.length || 0} prestation{(pack.contenu?.length || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Publish toggle + Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    {/* Interrupteur rapide Publié */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pack.actif}
                        onChange={() => handleToggleActif(pack)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E91E8C] relative" />
                      <span className="text-xs font-medium text-gray-700">Publié</span>
                    </label>

                    <div className="flex items-center gap-1.5 pl-2">
                      <button
                        onClick={() => handleOpenEditModal(pack)}
                        title="Modifier le pack"
                        className="p-2 rounded-lg text-gray-600 hover:text-[#E91E8C] hover:bg-pink-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePack(pack)}
                        title="Supprimer le pack"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3 : RÉSERVATIONS */}
      {activeTab === 'reservations' && (
        <NoelReservations
          onCountsUpdated={({ recuCount }) => setRecuReservationsCount(recuCount)}
          showToast={showToast}
        />
      )}

      {/* MODALE AJOUT / MODIFICATION PACK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl my-8 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-pink-50 text-[#E91E8C] rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingPack ? 'Modifier le pack' : 'Ajouter un pack de Noël'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackModal} className="p-6 space-y-5">
              {/* Nom */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Nom du pack <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalNom}
                  onChange={(e) => setModalNom(e.target.value)}
                  placeholder="Ex : Féerie Magique Enfant"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  placeholder="Courte description de l'ambiance et du public cible..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none text-sm resize-none"
                />
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Prix numérique (en FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={modalPrix}
                  onChange={(e) => setModalPrix(e.target.value)}
                  placeholder="Ex : 35000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laissez le champ vide pour afficher automatiquement <strong className="text-stone-700">Sur devis</strong>.
                </p>
              </div>

              {/* Contenu / Prestations incluses */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Contenu & Prestations incluses
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Ajoutez les détails des prestations incluses (appuyez sur la touche Entrée pour valider une ligne).
                </p>

                {/* Champ ajout ligne */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newContenuLine}
                    onChange={(e) => setNewContenuLine(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddContenuLine();
                      }
                    }}
                    placeholder="Ex : Visite surprise du Père Noël en costume traditionnel VIP"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddContenuLine}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>

                {/* Liste des lignes */}
                {modalContenu.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-200">
                    {modalContenu.map((line, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 bg-white rounded-md border border-gray-200 text-xs text-gray-800"
                      >
                        <span className="flex items-center gap-2 line-clamp-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E91E8C]" />
                          {line}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveContenuLine(idx)}
                          className="text-gray-400 hover:text-red-600 p-0.5 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Aucune ligne de prestation ajoutée. Un pack sans contenu ne pourra pas être publié.</span>
                  </div>
                )}
              </div>

              {/* Interrupteur Publié sur le site */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">Publier sur le site</span>
                  <span className="text-xs text-gray-500">
                    Rend le pack immédiatement visible par le public sur la page /noel
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={modalActif}
                    onChange={(e) => setModalActif(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E91E8C] relative" />
                </label>
              </div>

              {/* Boutons actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white bg-[#E91E8C] hover:bg-[#d8157f] disabled:opacity-50 transition-all shadow-sm"
                >
                  {modalSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>{editingPack ? 'Mettre à jour' : 'Créer le pack'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3 text-white ${
              toast.type === 'success' ? 'bg-gray-900' : 'bg-red-600'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-white" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
