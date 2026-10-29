import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Fallback to 'fr' if i18n is not fully initialized yet
  const currentLang = i18n.language || 'fr';

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/a-propos' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.pricing'), path: '/tarifs' },
    { name: t('nav.work'), path: '/realisations' },
    { name: t('nav.gallery'), path: '/galerie' },
    { name: t('nav.team'), path: '/equipe' },
    { name: t('nav.contact'), path: '/contact' },
    { name: t('nav.review'), path: '/avis' },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary" onClick={closeMenu}>
              <img
                src="https://i.postimg.cc/vZQQ6y8s/logo.png"
                alt="KPL SERVICES"
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-4 xl:px-8">
            <div className="flex space-x-3.5 xl:space-x-5 2xl:space-x-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                      isActive
                        ? 'text-primary border-b-2 border-primary pb-1'
                        : 'text-text-gray hover:text-primary pb-1 border-b-2 border-transparent'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Section (Lang + CTA) */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Lang Switcher */}
            <div className="flex rounded-md overflow-hidden border border-gray-200">
              <button
                onClick={() => changeLanguage('fr')}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  currentLang.startsWith('fr')
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-gray hover:bg-gray-50'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  currentLang.startsWith('en')
                    ? 'bg-gold text-white'
                    : 'bg-white text-text-gray hover:bg-gray-50'
                }`}
              >
                EN
              </button>
            </div>

            {/* CTA Button */}
            <Link
              to="/reservation"
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
            >
              {t('nav.book')}
            </Link>
          </div>

          {/* Mobile Right Section */}
          <div className="flex lg:hidden items-center space-x-4">
            {/* Lang Switcher Mobile */}
            <div className="flex rounded-md overflow-hidden border border-gray-200">
              <button
                onClick={() => changeLanguage('fr')}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  currentLang.startsWith('fr')
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-gray'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  currentLang.startsWith('en')
                    ? 'bg-gold text-white'
                    : 'bg-white text-text-gray'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text-gray hover:text-primary focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Full Screen Dropdown) */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full h-[calc(100vh-5rem)] bg-white border-t border-gray-100 overflow-y-auto">
          <div className="px-4 pt-4 pb-6 space-y-2 flex flex-col h-full">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={`block px-3 py-4 text-lg font-medium rounded-md ${
                    isActive
                      ? 'text-primary bg-primary/5 border-l-4 border-primary'
                      : 'text-text-gray hover:text-primary hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <div className="pt-6 mt-auto pb-8">
              <Link
                to="/reservation"
                onClick={closeMenu}
                className="block w-full text-center bg-primary hover:bg-primary/90 text-white px-5 py-4 rounded-md text-lg font-medium transition-colors"
              >
                {t('nav.book')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
