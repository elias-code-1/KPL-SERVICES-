import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  Loader2, 
  DollarSign, 
  MessageCircle, 
  CheckCircle2, 
  CalendarDays,
  Sparkles,
  TreePine,
  Layers
} from 'lucide-react';
import { supabase } from '../lib/supabase';

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

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatPriceFCFA(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0 FCFA';
  }
  return `${new Intl.NumberFormat('fr-FR').format(amount).replace(/\u202f/g, ' ')} FCFA`;
}

export function NoelReservations({ onCountsUpdated, showToast }: NoelReservationsProps) {
  const [reservations, setReservations] = useState<ReservationNoel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

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

  // État de copie du planning
  const [isCopied, setIsCopied] = useState(false);

  // Dates clés d'aujourd'hui et de demain
  const todayStr = useMemo(() => getLocalDateString(), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getLocalDateString(d);
  }, []);

  // Chargement des données
  const fetchReservations = useCallback(async () => {
    setTableError(null);
    try {
      const { data, error } = await supabase
        .from('reservations_noel')
        .select('*')
        .order('date_livraison', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const list: ReservationNoel[] = data || [];
      setReservations(list);

      const recuCount = list.filter((r) => r.statut === 'recu').length;
      if (onCountsUpdated) {
        onCountsUpdated({ recuCount, totalCount: list.length });
      }
    } catch (err: any) {
      console.error('[NoelReservations] Erreur chargement:', err);
      setTableError(
        err.message ||
        "Impossible de lire la table 'reservations_noel'. Veuillez exécuter le script supabase_noel_phase4.sql dans le SQL Editor de Supabase."
      );
    } finally {
      setIsLoading(false);
    }
  }, [onCountsUpdated]);

  useEffect(() => {
    fetchReservations();

    // Écoute Realtime sur reservations_noel pour rafraîchir la liste sans reset
    const channel = supabase
      .channel('admin_noel_reservations_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations_noel' },
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReservations]);

  // Synchronisation des états de la modale lors de la sélection
  useEffect(() => {
    if (selectedRes) {
      setModalStatut(selectedRes.statut);
      setModalAcompte(String(selectedRes.acompte || 0));
    }
  }, [selectedRes]);

  // Calcul des compteurs
  const counts = useMemo(() => {
    let recu = 0;
    let acompteVerse = 0;
    let enPreparation = 0;
    let livre = 0;
    let totalAcomptes = 0;

    for (const r of reservations) {
      if (r.statut === 'recu') recu++;
      else if (r.statut === 'acompte_verse') acompteVerse++;
      else if (r.statut === 'en_preparation') enPreparation++;
      else if (r.statut === 'livre') livre++;

      if (r.statut !== 'annule') {
        totalAcomptes += Number(r.acompte || 0);
      }
    }

    return { recu, acompteVerse, enPreparation, livre, totalAcomptes };
  }, [reservations]);

  // Filtrage côté client pour réactivité instantanée
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Recherche nom ou téléphone
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesNom = r.nom?.toLowerCase().includes(term);
        const matchesTel = r.telephone?.replace(/[^0-9]/g, '').includes(term.replace(/[^0-9]/g, ''));
        const matchesLieu = r.ville_lieu?.toLowerCase().includes(term);
        const matchesPack = r.pack_nom?.toLowerCase().includes(term);
        if (!matchesNom && !matchesTel && !matchesLieu && !matchesPack) {
          return false;
        }
      }

      // Filtre statut
      if (statusFilter !== 'all' && r.statut !== statusFilter) {
        return false;
      }

      // Filtre date de livraison
      if (dateFilter !== 'all') {
        const dateStr = r.date_livraison || '';
        if (dateFilter === '24' && !dateStr.endsWith('-12-24')) return false;
        if (dateFilter === '25' && !dateStr.endsWith('-12-25')) return false;
        if (dateFilter === '31' && !dateStr.endsWith('-12-31')) return false;
        if (dateFilter === 'autres') {
          if (
            dateStr.endsWith('-12-24') ||
            dateStr.endsWith('-12-25') ||
            dateStr.endsWith('-12-31')
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  // Reset page à 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage) || 1;
  const paginatedReservations = useMemo(() => {
    const from = (currentPage - 1) * itemsPerPage;
    return filteredReservations.slice(from, from + itemsPerPage);
  }, [filteredReservations, currentPage]);

  // Badges d'urgence (24 DÉC, 25 DÉC, 31 DÉC, AUJOURD'HUI, DEMAIN)
  const getUrgencyBadges = (dateStr: string | null) => {
    if (!dateStr) return null;
    const badges: { text: string; bg: string }[] = [];

    if (dateStr.endsWith('-12-24')) {
      badges.push({ text: '24 DÉC', bg: 'bg-red-600 text-white' });
    } else if (dateStr.endsWith('-12-25')) {
      badges.push({ text: '25 DÉC', bg: 'bg-emerald-600 text-white' });
    } else if (dateStr.endsWith('-12-31')) {
      badges.push({ text: '31 DÉC', bg: 'bg-purple-600 text-white' });
    }

    if (dateStr === todayStr) {
      badges.push({ text: 'AUJOURD\'HUI', bg: 'bg-[#E91E8C] text-white animate-pulse' });
    } else if (dateStr === tomorrowStr) {
      badges.push({ text: 'DEMAIN', bg: 'bg-amber-600 text-white' });
    }

    if (badges.length === 0) return null;

    return (
      <div className="flex items-center gap-1 flex-wrap mt-0.5">
        {badges.map((b, i) => (
          <span
            key={i}
            className={`text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm ${b.bg}`}
          >
            {b.text}
          </span>
        ))}
      </div>
    );
  };

  // Badge statut
  const getStatusBadge = (statut: ReservationNoel['statut']) => {
    switch (statut) {
      case 'recu':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Reçu
          </span>
        );
      case 'acompte_verse':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Acompte versé
          </span>
        );
      case 'en_preparation':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            En préparation
          </span>
        );
      case 'livre':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Livré
          </span>
        );
      case 'annule':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Annulé
          </span>
        );
    }
  };

  // Formatage de date lisible
  const formatDateDisplay = (dateString: string | null) => {
    if (!dateString) return 'Non précisée';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Enregistrement des modifications de la modale
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes) return;

    setIsSavingModal(true);
    try {
      const parsedAcompte = parseFloat(modalAcompte);
      const cleanAcompte = isNaN(parsedAcompte) || parsedAcompte < 0 ? 0 : parsedAcompte;

      const { error } = await supabase
        .from('reservations_noel')
        .update({
          statut: modalStatut,
          acompte: cleanAcompte,
        })
        .eq('id', selectedRes.id);

      if (error) throw error;

      showToast('Réservation mise à jour avec succès.', 'success');
      setSelectedRes((prev) => (prev ? { ...prev, statut: modalStatut, acompte: cleanAcompte } : null));
      fetchReservations();
    } catch (err: any) {
      console.error('[NoelReservations] Erreur update:', err);
      showToast(err.message || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setIsSavingModal(false);
    }
  };

  // Suppression d'une réservation
  const handleDeleteReservation = async (id: string, clientNom: string) => {
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer définitivement la réservation de "${clientNom}" ?`
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('reservations_noel')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Réservation supprimée.', 'success');
      if (selectedRes?.id === id) {
        setSelectedRes(null);
      }
      fetchReservations();
    } catch (err: any) {
      console.error('[NoelReservations] Erreur suppression:', err);
      showToast(err.message || 'Erreur lors de la suppression.', 'error');
    }
  };

  // Ouverture WhatsApp client avec message pré-rempli
  const handleWhatsAppCustomer = (res: ReservationNoel) => {
    const cleanPhone = res.telephone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Bonjour ${res.nom}, c'est l'équipe KPL SERVICES concernant votre réservation de Noël pour la formule "${res.pack_nom || 'Sur mesure'}" prévue le ${formatDateDisplay(res.date_livraison)} (${res.heure_livraison || 'créneau à convenir'}) à ${res.ville_lieu || 'Lomé'}. Nous vous contactons pour finaliser les détails !`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Export CSV avec BOM UTF-8 pour Excel
  const handleExportCSV = () => {
    if (filteredReservations.length === 0) {
      showToast('Aucune réservation à exporter.', 'error');
      return;
    }

    const headers = [
      'Nom',
      'Téléphone',
      'Email',
      'Type de prestation',
      'Formule',
      'Prix pack (FCFA)',
      'Date livraison',
      'Heure livraison',
      'Lieu / Ville',
      'Budget estimé',
      'Notes',
      'Statut',
      'Acompte versé (FCFA)',
      'Date de demande',
    ];

    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredReservations.map((r) => [
      escapeCSV(r.nom),
      escapeCSV(r.telephone),
      escapeCSV(r.email || ''),
      escapeCSV(r.type_prestation || ''),
      escapeCSV(r.pack_nom || 'Sur mesure'),
      escapeCSV(r.prix_pack !== null && r.prix_pack !== undefined ? r.prix_pack : 'Sur devis'),
      escapeCSV(r.date_livraison || ''),
      escapeCSV(r.heure_livraison || ''),
      escapeCSV(r.ville_lieu || ''),
      escapeCSV(r.budget || ''),
      escapeCSV(r.notes || ''),
      escapeCSV(r.statut),
      escapeCSV(r.acompte || 0),
      escapeCSV(new Date(r.created_at).toLocaleString('fr-FR')),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservations_noel_kpl_${getLocalDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Export CSV téléchargé avec succès !', 'success');
  };

  // Copier le planning pour WhatsApp
  const handleCopyPlanning = async () => {
    if (filteredReservations.length === 0) {
      showToast('Aucune réservation dans la sélection.', 'error');
      return;
    }

    // Grouper par date de livraison
    const grouped: Record<string, ReservationNoel[]> = {};
    for (const res of filteredReservations) {
      const dKey = res.date_livraison || 'Date non précisée';
      if (!grouped[dKey]) grouped[dKey] = [];
      grouped[dKey].push(res);
    }

    const lines: string[] = ['🎄 *PLANNING LIVRAISONS NOËL — KPL SERVICES* 🎄\n'];

    const sortedDates = Object.keys(grouped).sort();
    for (const dKey of sortedDates) {
      const formattedDate =
        dKey === 'Date non précisée' ? '📅 Date à définir' : `📅 Date : ${formatDateDisplay(dKey)}`;
      lines.push(`\n${formattedDate} (${grouped[dKey].length} commande${grouped[dKey].length > 1 ? 's' : ''}) :`);

      for (const item of grouped[dKey]) {
        const heure = item.heure_livraison || 'Horaire non précisé';
        const formule = item.pack_nom || 'Sur mesure';
        const lieu = item.ville_lieu || 'Lieu à préciser';
        const acompteText = item.acompte > 0 ? ` [Acompte: ${formatPriceFCFA(item.acompte)}]` : '';
        lines.push(`• ${heure} : *${item.nom}* (${item.telephone}) — ${formule} — 📍 ${lieu}${acompteText}`);
      }
    }

    const fullText = lines.join('\n');

    try {
      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      showToast('Planning copié dans le presse-papiers !', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Erreur clipboard:', err);
      showToast('Impossible de copier automatiquement.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerte si table absente */}
      {tableError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Table reservations_noel introuvable ou droits manquants</p>
            <p className="text-xs text-red-700 mt-1">{tableError}</p>
            <p className="text-xs text-red-600 mt-2 font-medium">
              Veuillez exécuter le script <code className="bg-red-100 px-1 py-0.5 rounded font-mono">supabase_noel_phase4.sql</code> dans le SQL Editor de Supabase pour créer la table et activer Realtime.
            </p>
          </div>
        </div>
      )}

      {/* RANGÉE DE COMPTEURS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Reçues */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Reçues</span>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-gray-900">{counts.recu}</div>
          <p className="text-[11px] text-gray-400 mt-1">À traiter / valider</p>
        </div>

        {/* Acomptes versés */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Acomptes versés</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-gray-900">{counts.acompteVerse}</div>
          <p className="text-[11px] text-gray-400 mt-1">Confirmées</p>
        </div>

        {/* En préparation */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">En préparation</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-gray-900">{counts.enPreparation}</div>
          <p className="text-[11px] text-gray-400 mt-1">En cours d'atelier</p>
        </div>

        {/* Livrées */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Livrées</span>
            <TreePine className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-gray-900">{counts.livre}</div>
          <p className="text-[11px] text-gray-400 mt-1">Finalisées</p>
        </div>

        {/* Total Acomptes Encaissés */}
        <div className="bg-gradient-to-br from-pink-50 to-white p-4 rounded-xl border border-pink-100 shadow-sm col-span-2 sm:col-span-1 lg:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#E91E8C] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Acomptes Encaissés</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-lg sm:text-xl font-black text-[#D4AF37] truncate">
            {formatPriceFCFA(counts.totalAcomptes)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Total trésorerie reçue</p>
        </div>
      </div>

      {/* BARRE D'ACTIONS : EXPORTS & PLANNING */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">
            {filteredReservations.length} réservation{filteredReservations.length > 1 ? 's' : ''} trouvée{filteredReservations.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyPlanning}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            title="Copier le planning groupé pour WhatsApp"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
            <span>{isCopied ? 'Copié !' : 'Copier le planning'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            title="Télécharger les réservations filtrées en CSV pour Excel"
          >
            <Download className="w-4 h-4" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* FILTRES RECHERCHE, STATUT & DATE */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, ville ou formule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-[#E91E8C] outline-none"
            />
          </div>

          {/* Filtre Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-[#E91E8C] outline-none bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="recu">Reçu</option>
            <option value="acompte_verse">Acompte versé</option>
            <option value="en_preparation">En préparation</option>
            <option value="livre">Livré</option>
            <option value="annule">Annulé</option>
          </select>
        </div>

        {/* Puces de filtrage par date de livraison */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
            Date de fête :
          </span>
          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              dateFilter === 'all'
                ? 'bg-[#E91E8C] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Toutes ({reservations.length})
          </button>

          <button
            type="button"
            onClick={() => setDateFilter('24')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              dateFilter === '24'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            }`}
          >
            🎄 24 décembre ({reservations.filter((r) => r.date_livraison?.endsWith('-12-24')).length})
          </button>

          <button
            type="button"
            onClick={() => setDateFilter('25')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              dateFilter === '25'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            ⭐ 25 décembre ({reservations.filter((r) => r.date_livraison?.endsWith('-12-25')).length})
          </button>

          <button
            type="button"
            onClick={() => setDateFilter('31')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              dateFilter === '31'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            🎉 31 décembre ({reservations.filter((r) => r.date_livraison?.endsWith('-12-31')).length})
          </button>

          <button
            type="button"
            onClick={() => setDateFilter('autres')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              dateFilter === 'autres'
                ? 'bg-gray-800 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Autres dates
          </button>
        </div>
      </div>

      {/* TABLEAU DES RÉSERVATIONS (DESKTOP) ET CARTES (MOBILE) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 text-[#E91E8C] animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Chargement des réservations de Noël...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-16 text-center">
            <TreePine className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">Aucune réservation trouvée</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              {reservations.length === 0
                ? "Les réservations effectuées sur le site s'afficheront ici en temps réel."
                : 'Aucune commande ne correspond aux filtres actuellement sélectionnés.'}
            </p>
          </div>
        ) : (
          <>
            {/* Version Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100 font-semibold uppercase tracking-wider">
                    <th className="p-4">Client</th>
                    <th className="p-4">Formule</th>
                    <th className="p-4">Livraison prévue</th>
                    <th className="p-4">Lieu</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4">Acompte</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {paginatedReservations.map((res) => (
                    <tr
                      key={res.id}
                      onClick={() => setSelectedRes(res)}
                      className="hover:bg-pink-50/20 transition-colors cursor-pointer"
                    >
                      {/* Client */}
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{res.nom}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{res.telephone}</div>
                        {res.email && <div className="text-[11px] text-gray-400">{res.email}</div>}
                      </td>

                      {/* Formule */}
                      <td className="p-4">
                        <div className="font-semibold text-[#E91E8C]">{res.pack_nom || 'Sur mesure'}</div>
                        <div className="text-xs text-gray-500">{res.type_prestation || 'Surprise'}</div>
                      </td>

                      {/* Livraison */}
                      <td className="p-4">
                        <div className="font-semibold text-gray-800">
                          {formatDateDisplay(res.date_livraison)}
                        </div>
                        <div className="text-xs text-stone-500">{res.heure_livraison || 'Horaire libre'}</div>
                        {getUrgencyBadges(res.date_livraison)}
                      </td>

                      {/* Lieu */}
                      <td className="p-4">
                        <div className="text-gray-800 font-medium line-clamp-1">{res.ville_lieu || '-'}</div>
                      </td>

                      {/* Statut */}
                      <td className="p-4">
                        {getStatusBadge(res.statut)}
                      </td>

                      {/* Acompte */}
                      <td className="p-4 font-mono font-semibold text-stone-700">
                        {res.acompte > 0 ? (
                          <span className="text-emerald-700">{formatPriceFCFA(res.acompte)}</span>
                        ) : (
                          <span className="text-gray-400">0 FCFA</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleWhatsAppCustomer(res)}
                            title="Contacter sur WhatsApp"
                            className="p-2 text-[#25D366] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRes(res)}
                            title="Voir la fiche complète"
                            className="p-2 text-gray-400 hover:text-[#E91E8C] hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Version Mobile (Cartes lisibles) */}
            <div className="lg:hidden divide-y divide-gray-100">
              {paginatedReservations.map((res) => (
                <div
                  key={res.id}
                  onClick={() => setSelectedRes(res)}
                  className="p-4 hover:bg-pink-50/20 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{res.nom}</h4>
                      <p className="text-xs text-gray-500 font-mono">{res.telephone}</p>
                    </div>
                    {getStatusBadge(res.statut)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <div>
                      <span className="font-bold text-[#E91E8C] block">{res.pack_nom || 'Sur mesure'}</span>
                      <span className="text-[11px] text-stone-500">{res.ville_lieu}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 block">{formatDateDisplay(res.date_livraison)}</span>
                      <span className="text-[11px] text-stone-500">{res.heure_livraison}</span>
                      {getUrgencyBadges(res.date_livraison)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-stone-500">
                      Acompte : <strong className="text-emerald-700">{formatPriceFCFA(res.acompte)}</strong>
                    </span>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleWhatsAppCustomer(res)}
                        className="p-2 bg-emerald-50 text-[#25D366] rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRes(res)}
                        className="p-2 bg-pink-50 text-[#E91E8C] rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Détails</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 text-xs sm:text-sm">
                <p className="text-gray-500">
                  Page <span className="font-bold text-gray-800">{currentPage}</span> sur{' '}
                  <span className="font-bold text-gray-800">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALE FICHE DÉTAIL D'UNE RÉSERVATION */}
      <AnimatePresence>
        {selectedRes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div 
              className="fixed inset-0 -z-10" 
              onClick={() => setSelectedRes(null)} 
              aria-hidden="true" 
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl my-6 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-pink-50 text-[#E91E8C] rounded-lg">
                    <TreePine className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Détail de la réservation Noël</h3>
                    <p className="text-xs text-gray-500 font-mono">ID : {selectedRes.id.slice(0, 8)}...</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRes(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulaire / Détails */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                {/* Info Client & Événement */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
                  {/* Client */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Client
                    </h4>
                    <div>
                      <span className="text-xs text-stone-500 block">Nom complet</span>
                      <span className="text-sm font-bold text-gray-900">{selectedRes.nom}</span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-500 block">Téléphone</span>
                      <span className="text-sm font-semibold text-gray-900 font-mono">{selectedRes.telephone}</span>
                    </div>
                    {selectedRes.email && (
                      <div>
                        <span className="text-xs text-stone-500 block">Email</span>
                        <span className="text-sm text-gray-800">{selectedRes.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Commande */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TreePine className="w-3.5 h-3.5" />
                      Formule Noël
                    </h4>
                    <div>
                      <span className="text-xs text-stone-500 block">Formule choisie</span>
                      <span className="text-sm font-bold text-[#E91E8C]">{selectedRes.pack_nom || 'Sur mesure'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-500 block">Prestation</span>
                      <span className="text-sm text-gray-800">{selectedRes.type_prestation || 'Non précisé'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-500 block">Prix estimé au moment de la demande</span>
                      <span className="text-sm font-semibold text-[#D4AF37]">
                        {selectedRes.prix_pack ? formatPriceFCFA(selectedRes.prix_pack) : 'Sur devis'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date & Lieu de livraison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 block mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Date de livraison
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatDateDisplay(selectedRes.date_livraison)}
                    </span>
                    <div className="mt-1">
                      {getUrgencyBadges(selectedRes.date_livraison)}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 block mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      Créneau horaire
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedRes.heure_livraison || 'Non précisé'}
                    </span>
                  </div>
                </div>

                {/* Lieu & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 block mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      Lieu / Ville
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedRes.ville_lieu || 'Non précisé'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 block mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                      Budget indicatif client
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedRes.budget || 'Non précisé'}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {selectedRes.notes && (
                  <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 block mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      Notes & Précisions client :
                    </span>
                    <p className="text-xs sm:text-sm text-stone-700 whitespace-pre-wrap">
                      {selectedRes.notes}
                    </p>
                  </div>
                )}

                {/* Actions directes : Appel & WhatsApp */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppCustomer(selectedRes)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#20ba59] shadow-sm transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp client</span>
                  </button>

                  <a
                    href={`tel:${selectedRes.telephone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-sm transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Appeler</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteReservation(selectedRes.id, selectedRes.nom)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Supprimer la réservation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* FORMULAIRE GESTION STATUT & ACOMPTE */}
                <form onSubmit={handleSaveModal} className="pt-4 border-t border-gray-200 space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Gestion de la commande
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sélecteur de statut */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Statut
                      </label>
                      <select
                        value={modalStatut}
                        onChange={(e) => setModalStatut(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-[#E91E8C] outline-none"
                      >
                        <option value="recu">Reçu</option>
                        <option value="acompte_verse">Acompte versé</option>
                        <option value="en_preparation">En préparation</option>
                        <option value="livre">Livré</option>
                        <option value="annule">Annulé</option>
                      </select>
                    </div>

                    {/* Acompte numérique */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Acompte versé (en FCFA)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={modalAcompte}
                        onChange={(e) => setModalAcompte(e.target.value)}
                        placeholder="Ex : 10000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-[#E91E8C] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRes(null)}
                      className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Fermer
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingModal}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#E91E8C] hover:bg-[#d8157f] disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                    >
                      {isSavingModal ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enregistrement...</span>
                        </>
                      ) : (
                        <span>Enregistrer les modifications</span>
                      )}
                    </button>
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
