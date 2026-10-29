import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Cake, Crown, Heart, CheckCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../hooks/useNotifications';
import { SEO } from '../../components/SEO';

interface FormData {
  nom: string;
  telephone: string;
  email: string;
  date_evenement: string;
  type_evenement: string;
  pack_choisi: string;
  prix: number;
}

const PACKAGES = {
  queen: [
    { id: 'q1', name: 'Éclat de joie', price: 15000 },
    { id: 'q2', name: 'Douce Reine', price: 25000 },
    { id: 'q3', name: 'Prestige Anniversaire', price: 45000 },
    { id: 'q4', name: 'Queen Signature', price: 75000 },
    { id: 'q5', name: 'Impératrice', price: 125000 }
  ],
  king: [
    { id: 'k1', name: 'Birthday Crush', price: 15000 },
    { id: 'k2', name: 'Birthday King', price: 25000 },
    { id: 'k3', name: 'Birthday Boss', price: 50000 }
  ],
  wedding: [
    { id: 'w1', name: 'Élégance - 50 invités', price: 1250000 },
    { id: 'w2', name: 'Glamour - 70 invités', price: 1450000 },
    { id: 'w3', name: 'Luxury - 100 invités', price: 2050000 },
    { id: 'w4', name: 'Extra - 150 invités', price: 3050000 },
    { id: 'w5', name: 'Royal - 200 invités', price: 4050000 }
  ]
};

export default function Reservation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  
  const { sendNotification } = useNotifications();
  
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    telephone: '',
    email: '',
    date_evenement: '',
    type_evenement: '',
    pack_choisi: '',
    prix: 0
  });

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEventSelect = (type: string) => {
    setFormData({ 
      ...formData, 
      type_evenement: type,
      pack_choisi: '', // Reset package when event changes
      prix: 0
    });
  };

  const handlePackageSelect = (packName: string, price: number) => {
    setFormData({ ...formData, pack_choisi: packName, prix: price });
  };

  const handleSubmit = async () => {
    try {
      setStatus('loading');
      
      const { error } = await supabase
        .from('reservations')
        .insert([
          { 
            nom: formData.nom,
            telephone: formData.telephone,
            email: formData.email,
            date_evenement: formData.date_evenement,
            type_evenement: formData.type_evenement,
            pack_choisi: formData.pack_choisi,
            prix: formData.prix,
            statut: 'en_attente'
          }
        ]);

      if (error) throw error;
      
      // Envoi des notifications
      try {
        sendNotification(
          '🎉 Nouvelle Réservation !',
          `${formData.nom} — ${formData.pack_choisi} — ${formData.type_evenement}`
        );
      } catch (notifError) {
        console.error('Erreur lors de l\'envoi des notifications:', notifError);
        // On ne bloque pas l'utilisateur si la notification échoue
      }
      
      setStatus('idle');
      nextStep(); // Go to step 5 (Confirmation)
      
    } catch (error) {
      console.error('Error submitting reservation:', error);
      setStatus('error');
    }
  };

  // Framer Motion variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const today = new Date().toISOString().split('T')[0];

  const steps = [
    t('reservation.steps.details'),
    t('reservation.steps.event'),
    t('reservation.steps.package'),
    t('reservation.steps.summary'),
    t('reservation.steps.confirmation')
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <SEO 
        title="Réserver"
        description="Réservez votre décoration événementielle avec KPL SERVICES. Choisissez votre pack et planifiez votre événement à Lomé en quelques clics."
        keywords="réservation décoration, réserver événement Lomé, pack anniversaire, devis mariage Togo"
        url="/reservation"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Réservation - KPL SERVICES",
          "description": "Formulaire de réservation pour nos services de décoration."
        }}
      />
      
      {/* Progress Bar */}
      <div className="w-full max-w-4xl mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 -z-10 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = step === stepNumber;
            const isCompleted = step > stepNumber;
            
            return (
              <div key={label} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                    isActive 
                      ? 'bg-primary text-white ring-4 ring-primary/20' 
                      : isCompleted 
                        ? 'bg-primary text-white' 
                        : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <span className={`mt-2 text-xs md:text-sm font-medium hidden sm:block ${
                  isActive || isCompleted ? 'text-stone-900' : 'text-stone-400'
                }`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden relative min-h-[500px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.3 }}
            className="w-full h-full p-6 md:p-10"
          >
            
            {/* STEP 1: Details */}
            {step === 1 && (
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">{t('reservation.step1.title')}</h2>
                <form 
                  onSubmit={(e) => { e.preventDefault(); nextStep(); }}
                  className="space-y-6 flex-grow"
                >
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      {t('reservation.step1.name')} *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      required
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      {t('reservation.step1.phone')} *
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      required
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      {t('reservation.step1.email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      {t('reservation.step1.date')} *
                    </label>
                    <input
                      type="date"
                      name="date_evenement"
                      required
                      min={today}
                      value={formData.date_evenement}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary bg-stone-50"
                    />
                  </div>
                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center"
                    >
                      {t('reservation.step1.next')}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: Event */}
            {step === 2 && (
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">{t('reservation.step2.title')}</h2>
                <div className="space-y-4 flex-grow">
                  
                  <button
                    onClick={() => handleEventSelect('queen')}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all flex items-start ${
                      formData.type_evenement === 'queen' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-stone-200 hover:border-primary/50'
                    }`}
                  >
                    <div className={`p-3 rounded-full mr-4 ${formData.type_evenement === 'queen' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-500'}`}>
                      <Cake className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">{t('reservation.step2.events.queen.title')}</h3>
                      <p className="text-stone-600 mt-1">{t('reservation.step2.events.queen.desc')}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleEventSelect('king')}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all flex items-start ${
                      formData.type_evenement === 'king' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-stone-200 hover:border-primary/50'
                    }`}
                  >
                    <div className={`p-3 rounded-full mr-4 ${formData.type_evenement === 'king' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-500'}`}>
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">{t('reservation.step2.events.king.title')}</h3>
                      <p className="text-stone-600 mt-1">{t('reservation.step2.events.king.desc')}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleEventSelect('wedding')}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all flex items-start ${
                      formData.type_evenement === 'wedding' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-stone-200 hover:border-primary/50'
                    }`}
                  >
                    <div className={`p-3 rounded-full mr-4 ${formData.type_evenement === 'wedding' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-500'}`}>
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">{t('reservation.step2.events.wedding.title')}</h3>
                      <p className="text-stone-600 mt-1">{t('reservation.step2.events.wedding.desc')}</p>
                    </div>
                  </button>

                </div>
                <div className="pt-8 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 text-stone-600 font-medium hover:bg-stone-100 rounded-xl transition-colors flex items-center"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    {t('reservation.step2.prev')}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!formData.type_evenement}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('reservation.step2.next')}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Package */}
            {step === 3 && (
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">{t('reservation.step3.title')}</h2>
                <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                  
                  {PACKAGES[formData.type_evenement as keyof typeof PACKAGES]?.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handlePackageSelect(pkg.name, pkg.price)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between ${
                        formData.pack_choisi === pkg.name 
                          ? 'border-primary bg-primary/10' 
                          : 'border-stone-200 hover:border-primary/50'
                      }`}
                    >
                      <h3 className="text-lg font-bold text-stone-900">{pkg.name}</h3>
                      <span className="text-lg font-bold text-[#D4AF37]">{formatPrice(pkg.price)}</span>
                    </button>
                  ))}

                </div>
                <div className="pt-8 flex justify-between mt-auto">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 text-stone-600 font-medium hover:bg-stone-100 rounded-xl transition-colors flex items-center"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    {t('reservation.step3.prev')}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!formData.pack_choisi}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('reservation.step3.next')}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Summary */}
            {step === 4 && (
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">{t('reservation.step4.title')}</h2>
                
                <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 flex-grow space-y-4">
                  <div className="grid grid-cols-2 gap-4 border-b border-stone-200 pb-4">
                    <div>
                      <p className="text-sm text-stone-500">{t('reservation.step4.name')}</p>
                      <p className="font-medium text-stone-900">{formData.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">{t('reservation.step4.phone')}</p>
                      <p className="font-medium text-stone-900">{formData.telephone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">{t('reservation.step4.email')}</p>
                      <p className="font-medium text-stone-900">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">{t('reservation.step4.date')}</p>
                      <p className="font-medium text-stone-900">{new Date(formData.date_evenement).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm text-stone-500 mb-1">{t('reservation.step4.event')}</p>
                    <p className="font-medium text-stone-900 capitalize">{t(`reservation.step2.events.${formData.type_evenement}.title`)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-stone-500 mb-1">{t('reservation.step4.package')}</p>
                    <p className="font-medium text-stone-900">{formData.pack_choisi}</p>
                  </div>
                  
                  <div className="pt-4 flex items-end justify-between">
                    <p className="text-stone-500 font-medium">{t('reservation.step4.price')}</p>
                    <p className="text-3xl font-bold text-[#D4AF37]">{formatPrice(formData.prix)}</p>
                  </div>
                </div>

                <p className="text-sm text-stone-500 mt-6 text-center">
                  {t('reservation.step4.note')}
                </p>

                {status === 'error' && (
                  <p className="text-red-500 text-sm mt-4 text-center font-medium">
                    {t('reservation.step4.error')}
                  </p>
                )}

                <div className="pt-6 flex justify-between">
                  <button
                    onClick={prevStep}
                    disabled={status === 'loading'}
                    className="px-6 py-3 text-stone-600 font-medium hover:bg-stone-100 rounded-xl transition-colors flex items-center disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    {t('reservation.step4.prev')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={status === 'loading'}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center disabled:opacity-70"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t('reservation.step4.sending')}
                      </>
                    ) : (
                      t('reservation.step4.submit')
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Confirmation */}
            {step === 5 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-8"
                >
                  <CheckCircle className="w-12 h-12" />
                </motion.div>
                
                <h2 className="text-3xl font-bold text-stone-900 mb-4">
                  {t('reservation.step5.title')}
                </h2>
                
                <p className="text-lg text-stone-600 mb-10 max-w-md">
                  {t('reservation.step5.message')}
                </p>
                
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                >
                  {t('reservation.step5.home')}
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
