import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Custom TikTok Icon since it's not in lucide-react by default
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/a-propos' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.pricing'), path: '/tarifs' },
    { name: t('nav.work'), path: '/realisations' },
    { name: t('nav.gallery'), path: '/galerie' },
    { name: t('nav.team'), path: '/equipe' },
    { name: t('nav.contact'), path: '/contact' },
    { name: t('nav.review'), path: '/avis' },
    { name: t('nav.book'), path: '/reservation' },
  ];

  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Colonne 1 — Identité */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="https://i.postimg.cc/vZQQ6y8s/logo.png"
                alt="KPL SERVICES"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-lg font-medium text-gray-300">
              KPL Events & Surprise
            </p>
            <p className="text-sm text-gray-400 italic border-l-2 border-primary pl-3 mt-4">
              "KPL SERVICES, TOUJOURS À VOTRE SERVICE"
            </p>
          </div>

          {/* Colonne 2 — Navigation rapide */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
              <span className="w-8 h-1 bg-primary mr-3 rounded-full"></span>
              {t('footer.quick_links')}
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center"
                  >
                    <span className="mr-2 text-primary opacity-0 -ml-4 transition-all group-hover:opacity-100 group-hover:ml-0">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Contact & Réseaux */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
              <span className="w-8 h-1 bg-primary mr-3 rounded-full"></span>
              {t('footer.contact_social')}
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start">
                <Phone className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:+22891333468" className="hover:text-primary transition-colors block">+228 91 33 34 68</a>
                  <a href="tel:+22890438798" className="hover:text-primary transition-colors block mt-1">+228 90 43 87 98</a>
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                <a href="mailto:kpllyly@gmail.com" className="hover:text-primary transition-colors">
                  kpllyly@gmail.com
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>
                  Adidogomé Franciscain, face Station MRS<br />
                  Ségbé Douane, à 200m église Catholique, Lomé
                </span>
              </li>
            </ul>

            {/* Réseaux Sociaux */}
            <div className="mt-8 flex space-x-4">
              <a 
                href="https://www.tiktok.com/@kpl.services" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/kpl.services" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/share/1AWgHarLPa/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Séparateur et Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-500">
          <p>© 2025 KPL SERVICES — {t('footer.rights')}</p>
          <p>
            {t('footer.developed_by')} <a href="https://logonova.site" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white transition-colors">Logonova Agency</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
