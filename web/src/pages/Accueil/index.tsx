import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Palette, Gift, Sparkles, ClipboardList, Armchair, ArrowRight, TreePine } from 'lucide-react';
import TestimonialsSection from './TestimonialsSection';
import { SEO } from '../../components/SEO';
import { useChristmas } from '../../context/ChristmasContext';

export default function Accueil() {
  const { t } = useTranslation();
  const { config } = useChristmas();

  const services = [
    {
      id: 'deco',
      icon: <Palette className="w-8 h-8 text-primary" />,
    },
    {
      id: 'surprise',
      icon: <Gift className="w-8 h-8 text-primary" />,
    },
    {
      id: 'themes',
      icon: <Sparkles className="w-8 h-8 text-primary" />,
    },
    {
      id: 'coord',
      icon: <ClipboardList className="w-8 h-8 text-primary" />,
    },
    {
      id: 'rental',
      icon: <Armchair className="w-8 h-8 text-primary" />,
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="flex flex-col w-full">
      <SEO 
        title={t('nav.home')}
        description={t('description')}
        keywords="décoration événementielle, mariage Lomé, anniversaire Togo, KPL SERVICES, organisation événement"
        image="https://i.postimg.cc/JHX7sMJC/accueil.jpg"
        url="/"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "KPL SERVICES",
          "url": "https://kpl-services.com/"
        }}
      />
      {/* Hero Section */}
      <section 
        className="relative w-full h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://i.postimg.cc/JHX7sMJC/accueil.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 z-10 bg-black/55" />

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full border border-primary bg-primary/20 backdrop-blur-sm"
          >
            <span className="text-white text-sm font-medium tracking-wider uppercase">
              {t('hero.badge')}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight max-w-4xl"
          >
            {t('hero.title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-10 max-w-2xl"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/reservation"
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-md text-lg font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              {t('hero.cta_book')}
            </Link>
            {config.isEnabled && (
              <Link
                to="/noel"
                className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold rounded-md text-lg transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>🎄 Spécial Noël</span>
              </Link>
            )}
            <Link
              to="/realisations"
              className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white/10 text-white rounded-md text-lg font-medium transition-colors"
            >
              {t('hero.cta_work')}
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Christmas Special Callout */}
      {config.isEnabled && (
        <section className="bg-gradient-to-r from-red-900 via-rose-900 to-amber-900 text-white py-12 px-4 shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center flex-shrink-0 text-amber-300 shadow-md">
                <Gift className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <span className="inline-block text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                  Édition Fêtes & Réveillon 2026
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Préparez votre Surprise & Décoration de Noël
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm mt-0.5 max-w-xl">
                  Visite surprise du Père Noël avec fanfare, décorations de table féeriques et packs cadeaux sur-mesure.
                </p>
              </div>
            </div>

            <Link
              to="/noel"
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-xl flex items-center gap-2 flex-shrink-0 transform hover:-translate-y-0.5"
            >
              <span>Découvrir nos offres de Noël</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Services Preview Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-stone-900 mb-4"
            >
              {t('services_preview.title')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-stone-600"
            >
              {t('services_preview.subtitle')}
            </motion.p>
          </div>

          {/* Services Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service) => (
              <motion.div 
                key={service.id}
                variants={itemVariants}
                className="group bg-white p-8 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col h-full"
              >
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-bold text-stone-900 mb-3">
                  {t(`services_preview.items.${service.id}.title`)}
                </h3>
                
                <p className="text-stone-600 mb-8 flex-grow">
                  {t(`services_preview.items.${service.id}.desc`)}
                </p>
                
                <Link 
                  to="/services" 
                  className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors mt-auto"
                >
                  {t('services_preview.learn_more')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
          
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Final CTA Section */}
      <section 
        className="py-20 flex items-center justify-center text-center px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #C0392B 100%)' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            {t('cta_section.title')}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl"
          >
            {t('cta_section.subtitle')}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/reservation"
              className="px-8 py-4 bg-white text-[#E91E8C] hover:bg-gray-50 rounded-md text-lg font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              {t('cta_section.book')}
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-md text-lg font-medium transition-colors"
            >
              {t('cta_section.contact')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
