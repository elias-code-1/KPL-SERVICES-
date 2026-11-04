import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  FileText, 
  Eye, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Loader2, 
  DollarSign, 
  CheckCircle2, 
  Sparkles,
  Package
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../pages/Noel';

export interface ReservationNoel {
  id: string;
  nom: string;
  telephone: string;
  email: string | null;
  type_prestation: string | null;
  pack_id: string | null;
  pack_nom: string | null;
  prix_pack: number | null;
  date_livraison: string | null; // YYYY-MM-DD
  heure_livraison: string | null;
  ville_lieu: string | null;
  budget: string | null;
  notes: string | null;
  statut: 'recu' | 'acompte_verse' | 'en_preparation' | 'livre' | 'annule';
  acompte: number;
  created_at: string;
}

interface NoelReservationsProps {
  onCountsUpdated?: (counts: { recuCount: number; totalCount: number }) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLivraison(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function NoelReservations({ onCountsUpdated, showToast }: NoelReservationsProps) {
  const [reservations, setReservations] = useState<ReservationNoel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  // Compteurs globaux
  const [counts, setCounts] = useState({
    recu: 0,
    acompteVerse: 0,
    enPreparation: 0,
    livre: 0,
    totalAcomptes: 0,
  });

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '24' | '25' | '31' | 'autres'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modale de détail
  const [selectedRes, setSelectedRes] = useState<ReservationNoel | null>(null);
  const [modalStatut, setModalStatut] = useState<ReservationNoel['statut']>('recu');
  const [modalAcompte, setModalAcompte] = useState<string>('0');
  const [isSavingModal, setIsSavingModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Requête légère pour les compteurs (calculés sur l'ensemble de la table)
  const fetchCounters = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reservations_noel')
        .select('statut, acompte');

      if (error) throw error;

      let recu = 0;
      let acompteVerse = 0;
      let enPreparation = 0;
      let livre = 0;
      let totalAcomptes = 0;

      if (data) {
        for (const r of data) {
          if (r.statut === 'recu') recu++;
          else if (r.statut === 'acompte_verse') acompteVerse++;
          else if (r.statut === 'en_preparation') enPreparation++;
          else if (r.statut === 'livre') livre++;

          if (r.statut !== 'annule') {
            totalAcomptes += Number(r.acompte || 0);
          }
        }
      }

      setCounts({ recu, acompteVerse, enPreparation, livre, totalAcomptes });
      if (onCountsUpdated) {
        onCountsUpdated({ recuCount: recu, totalCount: data?.length || 0 });
      }
    } catch (err: any) {
      console.error('[NoelReservations] Erreur chargement compteurs:', err);
    }
  }, [onCountsUpdated]);

  // 2. Requête unique pour la liste paginée avec le compte exact
  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    setTableError(null);

    try {
      let query = supabase
        .from('reservations_noel')
        .select('*', { count: 'exact' });

      // Filtre de recherche par nom ou téléphone
      if (searchTerm.trim()) {
        const term = searchTerm.trim();
        query = query.or(`nom.ilike.%${term}%,telephone.ilike.%${term}%`);
      }

      // Filtre par statut
      if (statusFilter !== 'all') {
        query = query.eq('statut', statusFilter);
      }

      // Puces de date de livraison (24, 25, 31 décembre sur toute année, ou autres dates)
      const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
      if (dateFilter === '24') {
        const dates = years.map((y) => `${y}-12-24`);
        query = query.in('date_livraison', dates);
      } else if (dateFilter === '25') {
        const dates = years.map((y) => `${y}-12-25`);
        query = query.in('date_livraison', dates);
      } else if (dateFilter === '31') {
        const dates = years.map((y) => `${y}-12-31`);
        query = query.in('date_livraison', dates);
      } else if (dateFilter === 'autres') {
        const specialDates = years.flatMap((y) => [
          `${y}-12-24`,
          `${y}-12-25`,
          `${y}-12-31`,
        ]);
        query = query.not('date_livraison', 'in', `(${specialDates.join(',')})`);
      }

      // Tri : date de livraison croissante (nulls à la fin), puis date de création décroissante
      query = query
        .order('date_livraison', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      // Pagination de 10
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      setReservations(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('[NoelReservations] Erreur chargement liste:', err);
      const isMissingTable =
        err?.code === '42P01' ||
        (typeof err?.message === 'string' && err.message.includes('reservations_noel'));

      const msg = isMissingTable
        ? "La table 'reservations_noel' est introuvable. Veuillez exécuter le script SQL de la Phase 4 (supabase_noel_phase4.sql) dans l'éditeur SQL de Supabase."
        : err?.message || 'Erreur lors du chargement des réservations de Noël.';

      setTableError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, dateFilter, showToast]);

  // Initialisation et rechargement lors des changements de filtres ou de page
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    fetchCounters();
  }, [fetchCounters]);

  // Réinitialiser la page à 1 lors de la modification des filtres
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  // Synchronisation des états de la modale lors de la sélection
  useEffect(() => {
    if (selectedRes) {
      setModalStatut(selectedRes.statut);
      setModalAcompte(String(selectedRes.acompte ?? 0));
    }
  }, [selectedRes]);

  // Badges d'urgence : 24 DÉC, 25 DÉC, 31 DÉC (en comparant mois et jour), AUJOURD'HUI, DEMAIN (en heure locale)
  const getUrgencyBadges = (dateStr: string | null) => {
    if (!dateStr) return null;
    const badges: { text: string; bg: string }[] = [];

    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const month = parts[1];
      const day = parts[2];
      if (month === '12' && day === '24') {
        badges.push({ text: '24 DÉC', bg: 'bg-red-600 text-white' });
      } else if (month === '12' && day === '25') {
        badges.push({ text: '25 DÉC', bg: 'bg-red-600 text-white' });
      } else if (month === '12' && day === '31') {
        badges.push({ text: '31 DÉC', bg: 'bg-red-600 text-white' });
      }
    }

    const todayStr = getLocalDateString(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    if (dateStr === todayStr) {
      badges.push({ text: "AUJOURD'HUI", bg: 'bg-red-600 text-white animate-pulse' });
    } else if (dateStr === tomorrowStr) {
      badges.push({ text: 'DEMAIN', bg: 'bg-amber-600 text-white' });
    }

    if (badges.length === 0) return null;

    return (
      <div className="flex items-center gap-1 flex-wrap mt-0.5">
        {badges.map((b, i) => (
          <span
            key={i}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${b.bg}`}
          >
            {b.text}
          </span>
        ))}
      </div>
    );
  };

  // Badge de statut stylisé selon Reservations.tsx
  const getStatusBadge = (statut: ReservationNoel['statut']) => {
    switch (statut) {
      case 'recu':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            Reçu
          </span>
        );
      case 'acompte_verse':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            Acompte versé
          </span>
        );
      case 'en_preparation':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            En préparation
          </span>
        );
      case 'livre':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Livré
          </span>
        );
      case 'annule':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
            Annulé
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {statut}
          </span>
        );
    }
  };

  // Enregistrement de la fiche détail (mise à jour statut + acompte uniquement)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes) return;

    const numAcompte = parseFloat(modalAcompte);
    if (isNaN(numAcompte) || numAcompte < 0) {
      showToast("L'acompte doit être un montant valide supérieur ou égal à 0.", 'error');
      return;
    }

    setIsSavingModal(true);
    try {
      const { error } = await supabase
        .from('reservations_noel')
        .update({
          statut: modalStatut,
          acompte: numAcompte,
        })
        .eq('id', selectedRes.id);

      if (error) throw error;

      showToast('Réservation mise à jour avec succès', 'success');
      setSelectedRes(null);
      await Promise.all([fetchReservations(), fetchCounters()]);
    } catch (err: any) {
      console.error('Erreur mise à jour réservation Noël:', err);
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setIsSavingModal(false);
    }
  };

  // Suppression d'une réservation avec confirmation
  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cette réservation de Noël ?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('reservations_noel')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Réservation supprimée avec succès', 'success');
      setSelectedRes(null);
      await Promise.all([fetchReservations(), fetchCounters()]);
    } catch (err: any) {
      console.error('Erreur suppression réservation Noël:', err);
      showToast(err.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="space-y-6">
      {/* Bannière d'erreur en cas de table absente ou défaillance Supabase */}
      {tableError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Erreur de lecture de la table 'reservations_noel'</p>
            <p className="text-xs text-red-700 mt-1">{tableError}</p>
          </div>
        </div>
      )}

      {/* SECTION 1 : 5 Compteurs en haut (calculés sur l'ensemble des réservations non annulées) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Reçues */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500">Reçues</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{counts.recu}</div>
          <div className="text-xs text-gray-400 mt-1">À traiter</div>
        </div>

        {/* Acomptes versés */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500">Acomptes versés</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{counts.acompteVerse}</div>
          <div className="text-xs text-gray-400 mt-1">Confirmées</div>
        </div>

        {/* En préparation */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500">En préparation</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700">{counts.enPreparation}</div>
          <div className="text-xs text-gray-400 mt-1">En cours</div>
        </div>

        {/* Livrées */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500">Livrées</span>
            <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-700">{counts.livre}</div>
          <div className="text-xs text-gray-400 mt-1">Terminées</div>
        </div>

        {/* Total des acomptes encaissés */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-white to-pink-50/30 p-4 rounded-xl border border-pink-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-[#E91E8C]">Acomptes encaissés</span>
            <div className="w-7 h-7 rounded-lg bg-pink-100 text-[#E91E8C] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#E91E8C] truncate" title={formatPrice(counts.totalAcomptes)}>
            {formatPrice(counts.totalAcomptes)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Sur réservations actives</div>
        </div>
      </div>

      {/* SECTION 2 : Filtres (Recherche, statut, puces de date de livraison) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recherche par nom ou téléphone */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Filtre par statut */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none bg-white text-sm text-gray-700 cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="recu">Reçu</option>
              <option value="acompte_verse">Acompte versé</option>
              <option value="en_preparation">En préparation</option>
              <option value="livre">Livré</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
        </div>

        {/* Puces de date de livraison : Toutes, 24 décembre, 25 décembre, 31 décembre, Autres dates */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            Livraison :
          </span>
          {[
            { id: 'all', label: 'Toutes' },
            { id: '24', label: '24 décembre' },
            { id: '25', label: '25 décembre' },
            { id: '31', label: '31 décembre' },
            { id: 'autres', label: 'Autres dates' },
          ].map((chip) => {
            const isSelected = dateFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setDateFilter(chip.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E91E8C] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3 : Liste des réservations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Vue Desktop : Tableau */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Téléphone</th>
                <th className="p-4 font-semibold">Formule</th>
                <th className="p-4 font-semibold">Date & Heure</th>
                <th className="p-4 font-semibold">Ville</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#E91E8C] animate-spin mb-2" />
                      <span className="text-sm text-gray-500 font-medium">
                        Chargement des réservations de Noël...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : reservations.length > 0 ? (
                reservations.map((res) => (
                  <tr
                    key={res.id}
                    onClick={() => setSelectedRes(res)}
                    className="hover:bg-pink-50/20 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{res.nom}</p>
                      {res.email && <p className="text-xs text-gray-400">{res.email}</p>}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-800 font-medium">{res.telephone}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-sm text-[#E91E8C]">
                        {res.pack_nom ? `Pack ${res.pack_nom}` : 'Sur mesure'}
                      </span>
                      {res.prix_pack !== null && res.prix_pack !== undefined && (
                        <p className="text-xs text-gray-500">{formatPrice(res.prix_pack)}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-gray-800">
                        {formatDateLivraison(res.date_livraison)}
                      </div>
                      {res.heure_livraison && (
                        <p className="text-xs text-gray-500">{res.heure_livraison}</p>
                      )}
                      {getUrgencyBadges(res.date_livraison)}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {res.ville_lieu || '-'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(res.statut)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRes(res);
                        }}
                        className="p-2 text-gray-400 hover:text-[#E91E8C] hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                        title="Voir la fiche détaillée"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Calendar className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-base font-semibold text-gray-700">
                        Aucune réservation de Noël pour le moment
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                          ? 'Aucun résultat ne correspond à vos filtres actuels.'
                          : 'Les réservations passées sur le site public apparaîtront ici.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vue Mobile : Cartes lisibles */}
        <div className="md:hidden p-3 space-y-3">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#E91E8C] animate-spin mb-2" />
              <span className="text-sm text-gray-500 font-medium">Chargement...</span>
            </div>
          ) : reservations.length > 0 ? (
            reservations.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedRes(res)}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-[#E91E8C]/40 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{res.nom}</h4>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {res.telephone}
                    </p>
                  </div>
                  <div>{getStatusBadge(res.statut)}</div>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-lg text-xs space-y-1 mb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Formule :</span>
                    <span className="font-semibold text-[#E91E8C]">
                      {res.pack_nom ? `Pack ${res.pack_nom}` : 'Sur mesure'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Livraison :</span>
                    <span className="font-medium text-gray-800">
                      {formatDateLivraison(res.date_livraison)} {res.heure_livraison ? `à ${res.heure_livraison}` : ''}
                    </span>
                  </div>
                  {res.ville_lieu && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Lieu :</span>
                      <span className="text-gray-700">{res.ville_lieu}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                    <span className="text-gray-500">Acompte :</span>
                    <span className="font-semibold text-emerald-700">
                      {formatPrice(res.acompte)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>{getUrgencyBadges(res.date_livraison)}</div>
                  <span className="text-xs font-semibold text-[#E91E8C] flex items-center gap-1">
                    Voir détails
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">
                Aucune réservation de Noël pour le moment
              </p>
            </div>
          )}
        </div>

        {/* Pagination reprenant le style de Reservations.tsx */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-800">{currentPage}</span> sur{' '}
              <span className="font-medium text-gray-800">{totalPages}</span>
              <span className="hidden sm:inline text-gray-400 ml-2">
                ({totalCount} réservation{totalCount > 1 ? 's' : ''})
              </span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Page précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Page suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4 : Fiche de détail en modale */}
      <AnimatePresence>
        {selectedRes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl my-8 overflow-hidden"
            >
              {/* Entête modale */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white via-white to-pink-50/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-pink-50 text-[#E91E8C] rounded-xl">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedRes.nom}</h3>
                    <p className="text-xs text-gray-500">
                      Dossier créé le{' '}
                      {new Date(selectedRes.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRes(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu modale */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Récapitulatif prestation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-400">Formule</span>
                    <p className="font-bold text-[#E91E8C] text-base mt-0.5">
                      {selectedRes.pack_nom ? `Pack ${selectedRes.pack_nom}` : 'Sur mesure'}
                    </p>
                    {selectedRes.prix_pack !== null && selectedRes.prix_pack !== undefined && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        Tarif formule : <strong>{formatPrice(selectedRes.prix_pack)}</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-400">Prestation</span>
                    <p className="font-medium text-gray-800 text-sm mt-0.5">
                      {selectedRes.type_prestation || 'Non renseigné'}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-400">Livraison prévue</span>
                    <p className="font-semibold text-gray-900 text-sm mt-0.5">
                      {formatDateLivraison(selectedRes.date_livraison)}
                    </p>
                    {selectedRes.heure_livraison && (
                      <p className="text-xs text-gray-600">Créneau : {selectedRes.heure_livraison}</p>
                    )}
                    {getUrgencyBadges(selectedRes.date_livraison)}
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-400">Lieu / Ville</span>
                    <p className="font-medium text-gray-800 text-sm mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {selectedRes.ville_lieu || 'Non renseigné'}
                    </p>
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Coordonnées du client
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-white border border-gray-200 rounded-lg flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#E91E8C]" />
                      <span className="font-medium text-gray-800">{selectedRes.telephone}</span>
                    </div>

                    <div className="p-3 bg-white border border-gray-200 rounded-lg flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-[#E91E8C]" />
                      <span className="text-gray-700 truncate">
                        {selectedRes.email || 'Email non précisé'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Budget et Notes */}
                {(selectedRes.budget || selectedRes.notes) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Informations complémentaires
                    </h4>
                    {selectedRes.budget && (
                      <div className="text-xs text-gray-700 p-3 bg-white border border-gray-200 rounded-lg">
                        <strong className="text-gray-900">Budget indicatif :</strong> {selectedRes.budget}
                      </div>
                    )}
                    {selectedRes.notes && (
                      <div className="text-xs text-gray-700 p-3 bg-white border border-gray-200 rounded-lg">
                        <strong className="text-gray-900">Notes & précisions du client :</strong>
                        <p className="mt-1 whitespace-pre-wrap text-gray-600">{selectedRes.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Formulaire de mise à jour (Statut et Acompte uniquement) */}
                <form onSubmit={handleSaveModal} className="p-4 bg-pink-50/30 rounded-xl border border-pink-100 space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#E91E8C]" />
                    Mise à jour du dossier (Statut & Acompte)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sélecteur de statut */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Statut de la réservation
                      </label>
                      <select
                        value={modalStatut}
                        onChange={(e) => setModalStatut(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-[#E91E8C] outline-none cursor-pointer"
                      >
                        <option value="recu">Reçu</option>
                        <option value="acompte_verse">Acompte versé</option>
                        <option value="en_preparation">En préparation</option>
                        <option value="livre">Livré</option>
                        <option value="annule">Annulé</option>
                      </select>
                    </div>

                    {/* Champ acompte */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Acompte encaissé (FCFA)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={modalAcompte}
                        onChange={(e) => setModalAcompte(e.target.value)}
                        placeholder="Ex : 5000"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-[#E91E8C] outline-none"
                      />
                    </div>
                  </div>

                  {/* Actions du formulaire */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-pink-100/60">
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedRes.id)}
                      disabled={isDeleting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer la réservation</span>
                    </button>

                    <div className="w-full sm:w-auto flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRes(null)}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Annuler
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingModal}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#E91E8C] hover:bg-[#d8157f] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSavingModal ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Enregistrement...</span>
                          </>
                        ) : (
                          <span>Enregistrer</span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
