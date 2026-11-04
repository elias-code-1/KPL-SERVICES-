import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Calendar, Eye, Trash2, X, 
  ChevronLeft, ChevronRight, Gift, Sparkles, 
  Phone, MessageSquare, CheckCircle, Clock, AlertCircle, RefreshCw, PlusCircle, Database
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Reservation {
  id: string;
  nom: string;
  email?: string;
  telephone: string;
  type_evenement: string;
  pack_choisi: string;
  date_evenement: string;
  statut: string;
  prix?: number;
  created_at: string;
}

export default function ReservationsNoel() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isInsertingTest, setIsInsertingTest] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Selected for Modal
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  const fetchChristmasReservations = async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .or('type_evenement.ilike.%noel%,pack_choisi.ilike.%noel%,pack_choisi.ilike.%fêtes%')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase fetch:', error);
        setDbError(`Erreur Supabase (${error.code || 'inconnue'}) : ${error.message}`);
        setReservations([]);
      } else {
        setReservations(data || []);
      }
    } catch (err: any) {
      console.error(err);
      setDbError(`Erreur de connexion : ${err.message || 'Impossible de joindre Supabase'}`);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChristmasReservations();

    const channel = supabase
      .channel('realtime:reservations_noel_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        fetchChristmasReservations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ statut: newStatus })
        .eq('id', id);

      if (error) throw error;

      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, statut: newStatus } : r))
      );
      if (selectedRes && selectedRes.id === id) {
        setSelectedRes({ ...selectedRes, statut: newStatus });
      }
    } catch (err: any) {
      alert(`Erreur de mise à jour dans Supabase: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette réservation de la base de données Supabase ?')) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReservations((prev) => prev.filter((r) => r.id !== id));
      if (selectedRes?.id === id) setSelectedRes(null);
    } catch (err: any) {
      alert(`Erreur de suppression dans Supabase: ${err.message}`);
    }
  };

  const handleInsertTest = async () => {
    setIsInsertingTest(true);
    try {
      const { error } = await supabase.from('reservations').insert([
        {
          nom: 'Mme Mensah Estelle (Test)',
          telephone: '+228 91 33 34 68',
          email: 'estelle.mensah@gmail.com',
          type_evenement: 'noel',
          pack_choisi: 'Noël : Nuit Étoilée (Romantique & Amoureux) | Lieu: Lomé Tokoin',
          date_evenement: '2026-12-24',
          statut: 'en_attente',
          prix: 65000
        }
      ]);

      if (error) {
        alert(`Erreur Supabase (${error.code}) : ${error.message}`);
      } else {
        await fetchChristmasReservations();
      }
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setIsInsertingTest(false);
    }
  };

  const handleWhatsAppCustomer = (res: Reservation) => {
    const text = encodeURIComponent(
      `Bonjour ${res.nom}, nous avons bien reçu votre réservation KPL SERVICES pour votre formule de Noël (${res.pack_choisi}) prévue le ${res.date_evenement}. Nous vous contactons pour finaliser votre commande.`
    );
    const cleanPhone = res.telephone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Filtrage
  const filtered = reservations.filter((r) => {
    const matchesSearch =
      r.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.telephone.includes(searchTerm) ||
      r.pack_choisi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.statut === statusFilter;

    const matchesDate =
      dateFilter === 'all' ||
      (dateFilter === '24' && r.date_evenement.includes('-12-24')) ||
      (dateFilter === '25' && r.date_evenement.includes('-12-25')) ||
      (dateFilter === '31' && r.date_evenement.includes('-12-31'));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const count24 = reservations.filter((r) => r.date_evenement.includes('-12-24')).length;
  const count25 = reservations.filter((r) => r.date_evenement.includes('-12-25')).length;
  const countPending = reservations.filter((r) => r.statut === 'en_attente').length;

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-red-900 via-rose-900 to-amber-900 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5" />
            <span>Connecté à la table Supabase `reservations`</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            Réservations Spéciales Noël
            <Sparkles className="w-6 h-6 text-amber-300" />
          </h1>
          <p className="text-stone-200 text-sm mt-1">
            Données réelles synchronisées en temps réel avec votre base PostgreSQL Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleInsertTest}
            disabled={isInsertingTest}
            className="inline-flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isInsertingTest ? 'Insertion...' : 'Tester insert BDD'}</span>
          </button>

          <button
            onClick={fetchChristmasReservations}
            className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Alerte Erreur BDD */}
      {dbError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Alerte Base de Données Supabase :</div>
            <p className="mt-0.5 text-red-700">{dbError}</p>
            <p className="mt-2 text-red-600 font-medium">
              💡 Si l'erreur mentionne RLS ou 42501, exécutez le script <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono">supabase_setup_noel.sql</code> dans votre SQL Editor Supabase.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Noël (BDD)</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">{reservations.length}</div>
          <span className="text-xs text-amber-600 font-medium">Enregistrées dans Supabase</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Réveillon 24 Déc.</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-1">{count24}</div>
          <span className="text-xs text-stone-500">Livraisons du 24</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Jour de Noël 25</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{count25}</div>
          <span className="text-xs text-stone-500">Surprises du 25</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">En Attente</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-1">{countPending}</div>
          <span className="text-xs text-stone-500">À traiter en priorité</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, téléphone, pack..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-red-500"
          >
            <option value="all">Toutes les dates</option>
            <option value="24">24 Décembre uniquement</option>
            <option value="25">25 Décembre uniquement</option>
            <option value="31">31 Décembre (Saint-Sylvestre)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-red-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="confirmee">Confirmée</option>
            <option value="terminee">Terminée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
            <span>Connexion à Supabase & chargement des réservations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-stone-800">
              0 réservation de Noël dans la base Supabase
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              La table Supabase est bien connectée. Dès qu'un client réserve sur la page <a href="/noel" target="_blank" className="text-red-600 underline font-semibold">/noel</a>, la ligne apparaîtra ici en direct.
            </p>
            <button
              onClick={handleInsertTest}
              disabled={isInsertingTest}
              className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-amber-500" />
              <span>Créer une réservation de test dans Supabase</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50/80 text-xs text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Client</th>
                  <th className="py-3.5 px-4 font-semibold">Date Prévue</th>
                  <th className="py-3.5 px-4 font-semibold">Formule / Détails</th>
                  <th className="py-3.5 px-4 font-semibold">Statut</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-stone-900">{r.nom}</div>
                      <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{r.telephone}</span>
                      </div>
                      {r.email && (
                        <div className="text-[11px] text-stone-400">{r.email}</div>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        r.date_evenement.includes('-12-24')
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : r.date_evenement.includes('-12-25')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {r.date_evenement}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs sm:text-sm font-medium text-stone-800">{r.pack_choisi}</div>
                      {r.prix ? (
                        <div className="text-xs text-amber-600 font-bold mt-0.5">
                          {r.prix.toLocaleString()} FCFA
                        </div>
                      ) : null}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <select
                        value={r.statut}
                        onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none ${
                          r.statut === 'confirmee'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : r.statut === 'terminee'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : r.statut === 'annulee'
                            ? 'bg-stone-100 text-stone-600 border-stone-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="en_attente">En attente</option>
                        <option value="confirmee">Confirmée</option>
                        <option value="terminee">Terminée</option>
                        <option value="annulee">Annulée</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleWhatsAppCustomer(r)}
                          title="Contacter sur WhatsApp"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedRes(r)}
                          title="Voir les détails"
                          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          title="Supprimer de la BDD"
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedRes(null)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-red-600 mb-3">
              <Gift className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Fiche Réservation Supabase</span>
            </div>

            <h3 className="text-xl font-bold text-stone-900">{selectedRes.nom}</h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-xs text-stone-500 font-semibold uppercase block">Formule & Détails</span>
                <span className="font-bold text-stone-900">{selectedRes.pack_choisi}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-xs text-stone-500 font-semibold uppercase block">Date prévue</span>
                  <span className="font-bold text-stone-900">{selectedRes.date_evenement}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-xs text-stone-500 font-semibold uppercase block">Téléphone</span>
                  <span className="font-bold text-stone-900">{selectedRes.telephone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-xs text-stone-500 font-semibold uppercase block">Statut Supabase</span>
                  <span className="font-bold text-stone-900 capitalize">{selectedRes.statut}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-xs text-stone-500 font-semibold uppercase block">ID BDD</span>
                  <span className="font-mono text-xs text-stone-600 truncate block">{selectedRes.id}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 flex gap-3">
              <button
                onClick={() => handleWhatsAppCustomer(selectedRes)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ouvrir WhatsApp</span>
              </button>
              <button
                onClick={() => setSelectedRes(null)}
                className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs sm:text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
