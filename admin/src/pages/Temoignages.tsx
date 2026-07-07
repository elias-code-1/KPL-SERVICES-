import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Plus, Trash2, Edit2, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Temoignage {
  id: string;
  nom: string;
  note: number;
  texte: string;
  actif: boolean;
  created_at: string;
}

export default function Temoignages() {
  const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'actifs' | 'attente'>('actifs');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nomClient, setNomClient] = useState('');
  const [note, setNote] = useState(5);
  const [hoveredNote, setHoveredNote] = useState(0);
  const [texte, setTexte] = useState('');

  const temoignagesActifs = temoignages.filter(t => t.actif);
  const temoignagesEnAttente = temoignages.filter(t => !t.actif);

  useEffect(() => {
    fetchTemoignages();
  }, []);

  const fetchTemoignages = async () => {
    try {
      const { data, error } = await supabase
        .from('temoignages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemoignages(data || []);
    } catch (error) {
      console.error('Error fetching temoignages:', error);
      showToast('Erreur lors du chargement des témoignages');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNomClient('');
    setNote(5);
    setHoveredNote(0);
    setTexte('');
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (temoignage: Temoignage) => {
    setEditingId(temoignage.id);
    setNomClient(temoignage.nom);
    setNote(temoignage.note);
    setTexte(temoignage.texte);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomClient.trim() || texte.trim().length < 10) return;

    setIsSubmitting(true);
    try {
      const payload = {
        nom: nomClient.trim(),
        note,
        texte: texte.trim(),
        actif: true // Auto validate admin-added testimonials
      };

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('temoignages')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        
        setTemoignages(prev => 
          prev.map(t => t.id === editingId ? { ...t, ...payload } : t)
        );
        showToast('Témoignage modifié avec succès');
      } else {
        // Insert
        const { data, error } = await supabase
          .from('temoignages')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          setTemoignages(prev => [data, ...prev]);
        }
        showToast('Témoignage ajouté avec succès');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving temoignage:', error);
      showToast('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) return;

    try {
      const { error } = await supabase
        .from('temoignages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTemoignages(prev => prev.filter(t => t.id !== id));
      showToast('Témoignage supprimé avec succès');
    } catch (error) {
      console.error('Error deleting temoignage:', error);
      showToast('Erreur lors de la suppression');
    }
  };

  const handleValider = async (id: string) => {
    try {
      const { error } = await supabase
        .from('temoignages')
        .update({ actif: true })
        .eq('id', id);

      if (error) throw error;
      
      setTemoignages(prev => 
        prev.map(t => t.id === id ? { ...t, actif: true } : t)
      );
      showToast('Témoignage validé avec succès');
    } catch (error) {
      console.error('Error validating temoignage:', error);
      showToast('Erreur lors de la validation');
    }
  };

  const handleDesactiver = async (id: string) => {
    try {
      const { error } = await supabase
        .from('temoignages')
        .update({ actif: false })
        .eq('id', id);

      if (error) throw error;
      
      setTemoignages(prev => 
        prev.map(t => t.id === id ? { ...t, actif: false } : t)
      );
      showToast('Témoignage désactivé avec succès');
    } catch (error) {
      console.error('Error deactivating temoignage:', error);
      showToast('Erreur lors de la désactivation');
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const currentList = activeTab === 'actifs' ? temoignagesActifs : temoignagesEnAttente;

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Témoignages</h1>
          <p className="text-gray-500 mt-1">{temoignages.length} témoignage(s) au total</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#E91E8C] text-white rounded-lg hover:bg-[#D81B82] transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Ajouter un témoignage
        </button>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-gray-200 mb-8 space-x-8">
        <button
          onClick={() => setActiveTab('actifs')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'actifs' ? 'text-[#E91E8C]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Témoignages actifs
          {activeTab === 'actifs' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E91E8C] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('attente')}
          className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === 'attente' ? 'text-[#E91E8C]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          En attente de validation
          {temoignagesEnAttente.length > 0 && (
            <span className="bg-red-500 text-white text-xs py-0.5 px-2 rounded-full">
              {temoignagesEnAttente.length}
            </span>
          )}
          {activeTab === 'attente' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E91E8C] rounded-t-full" />
          )}
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#E91E8C]" />
        </div>
      ) : currentList.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {currentList.map((temoignage) => (
            <motion.div
              key={temoignage.id}
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{temoignage.nom}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= temoignage.note
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {activeTab === 'actifs' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDesactiver(temoignage.id)}
                      className="p-2 text-orange-500 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors"
                      title="Désactiver"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(temoignage)}
                      className="p-2 text-[#E91E8C] bg-pink-50 rounded-full hover:bg-pink-100 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(temoignage.id)}
                      className="p-2 text-red-500 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleValider(temoignage.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Valider
                    </button>
                    <button
                      onClick={() => handleDelete(temoignage.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 flex-grow italic mb-4">
                "{truncateText(temoignage.texte)}"
              </p>
              
              <div className="text-sm text-gray-400 mt-auto pt-4 border-t border-gray-50">
                Ajouté le {formatDate(temoignage.created_at)}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center h-[50vh]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Star className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {activeTab === 'actifs' ? 'Aucun témoignage actif' : 'Aucun témoignage en attente'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            {activeTab === 'actifs' 
              ? 'Ajoutez le premier avis client pour rassurer vos futurs visiteurs sur la qualité de vos services.'
              : "Tous les témoignages ont été traités. Vous n'avez aucune validation en attente."}
          </p>
          {activeTab === 'actifs' && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 bg-[#E91E8C] text-white rounded-full hover:bg-[#D81B82] transition-colors font-medium shadow-md"
            >
              <Plus className="w-5 h-5" />
              Ajouter un avis
            </button>
          )}
        </div>
      )}

      {/* Modal Ajout/Modification */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? 'Modifier le témoignage' : 'Ajouter un témoignage'}
                </h2>
                <button
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5">
                  {/* Nom du client */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du client <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nomClient}
                      onChange={(e) => setNomClient(e.target.value)}
                      placeholder="Ex: Sophie Martin"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNote(star)}
                          onMouseEnter={() => setHoveredNote(star)}
                          onMouseLeave={() => setHoveredNote(0)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              star <= (hoveredNote || note)
                                ? 'fill-[#D4AF37] text-[#D4AF37]'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Texte */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Témoignage <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      minLength={10}
                      value={texte}
                      onChange={(e) => setTexte(e.target.value)}
                      placeholder="Le client a adoré la prestation..."
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 10 caractères. {texte.length} caractères saisis.
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !nomClient.trim() || texte.trim().length < 10}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#E91E8C] text-white font-medium rounded-lg hover:bg-[#D81B82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
