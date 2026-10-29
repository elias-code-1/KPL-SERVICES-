import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bell, Globe, Lock, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../hooks/useNotifications';

export default function Parametres() {
  // Profil Administrateur
  const [email, setEmail] = useState<string>('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Notifications
  const { permission, isSupported, requestPermission, sendNotification } = useNotifications();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    fetchUser();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      showToast('Le nouveau mot de passe doit contenir au moins 8 caractères.', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showToast('Les nouveaux mots de passe ne correspondent pas.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Note: Supabase auth.updateUser only requires the new password if the user is logged in.
      // The old password isn't strictly necessary for the API call unless you're doing a re-authentication,
      // but we keep the UI as requested.
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      showToast('Mot de passe modifié avec succès', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      showToast(error.message || 'Erreur lors du changement de mot de passe', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestNotification = () => {
    if (permission === 'granted') {
      sendNotification('Test KPL SERVICES', 'Les notifications fonctionnent correctement !');
    } else {
      showToast('Veuillez activer les notifications d\'abord.', 'error');
    }
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

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">Gérez votre compte et les paramètres du site</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl space-y-6"
      >
        {/* SECTION 1 — Profil Administrateur */}
        <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Profil Administrateur</h2>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de connexion</label>
              <input 
                type="email" 
                value={email} 
                disabled 
                className="w-full md:w-1/2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">L'adresse email ne peut pas être modifiée.</p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-gray-500" />
                Changer le mot de passe
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ancien mot de passe</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !oldPassword || !newPassword || !confirmPassword}
                className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#E91E8C] text-white font-medium rounded-lg hover:bg-[#D81B82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Changer le mot de passe'
                )}
              </button>
            </form>
          </div>
        </motion.section>

        {/* SECTION 2 — Notifications Push */}
        <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Notifications Push</h2>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-6 max-w-2xl">
              Activez les notifications pour être alerté en temps réel lors de nouvelles réservations ou messages.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="text-sm font-medium text-gray-700">Statut actuel :</div>
              {permission === 'granted' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Notifications activées ✅
                </span>
              )}
              {permission === 'denied' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Notifications désactivées ❌
                </span>
              )}
              {permission === 'default' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Non configuré ⚠️
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {permission !== 'granted' && isSupported && (
                <button
                  onClick={requestPermission}
                  className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Activer les notifications
                </button>
              )}
              
              {permission === 'granted' && (
                <button
                  onClick={handleTestNotification}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tester la notification
                </button>
              )}
            </div>
            
            {permission === 'denied' && (
              <p className="text-sm text-gray-500 mt-4">
                Vous avez bloqué les notifications. Pour les réactiver, veuillez modifier les paramètres de votre navigateur (icône cadenas dans la barre d'adresse).
              </p>
            )}
          </div>
        </motion.section>

        {/* SECTION 3 — Informations du Site */}
        <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Informations du Site</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Site web</h4>
                <p className="text-gray-900 font-medium">kpl-services.com</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Email de contact</h4>
                <p className="text-gray-900 font-medium">kpllyly@gmail.com</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Téléphone 1</h4>
                <p className="text-gray-900 font-medium">+228 91 33 34 68</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Téléphone 2</h4>
                <p className="text-gray-900 font-medium">+228 90 43 87 98</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Adresse</h4>
                <p className="text-gray-900 font-medium">
                  Adidogomé Franciscain, face Station MRS<br />
                  Ségbé Douane, à 200m église Catholique
                </p>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Réseaux sociaux</h4>
                <div className="flex gap-4 mt-1">
                  <a href="#" className="text-[#E91E8C] hover:underline font-medium">TikTok</a>
                  <a href="#" className="text-[#E91E8C] hover:underline font-medium">Instagram</a>
                  <a href="#" className="text-[#E91E8C] hover:underline font-medium">Facebook</a>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">Note :</span> Pour modifier ces informations, veuillez contacter Logonova Agency.
              </p>
              <a href="mailto:devis.logonovaagency@gmail.com" className="text-sm text-[#E91E8C] hover:underline font-medium mt-1 inline-block">
                devis.logonovaagency@gmail.com
              </a>
            </div>
          </div>
        </motion.section>
      </motion.div>

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
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
