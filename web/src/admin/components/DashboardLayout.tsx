import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Calendar, MessageSquare, Images, 
  Camera, Star, Settings, LogOut, Menu, Bell, Download 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { path: '/admin/reservations', icon: Calendar, label: 'Réservations' },
  { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { path: '/admin/realisations', icon: Images, label: 'Réalisations' },
  { path: '/admin/galerie', icon: Camera, label: 'Galerie' },
  { path: '/admin/temoignages', icon: Star, label: 'Témoignages' },
  { path: '/admin/parametres', icon: Settings, label: 'Paramètres' },
];

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    fetchPendingCount();
    
    // S'abonner aux changements pour mettre à jour le badge en temps réel
    const channel = supabase
      .channel('public:reservations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        fetchPendingCount();
      })
      .subscribe();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const { count } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'en_attente');
      setPendingCount(count || 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations en attente:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const currentRoute = navItems.find(item => item.path === location.pathname);
  const pageTitle = currentRoute ? currentRoute.label : 'Administration';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#E91E8C]">KPL SERVICES</h1>
        <p className="text-gray-400 text-sm mt-1">Administration</p>
      </div>
      <div className="h-px bg-white/10 mx-4 mb-6" />
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[#E91E8C]/20 text-[#E91E8C] border-l-4 border-[#E91E8C]' 
                  : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[260px] bg-[#1a1a1a] z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-[260px] bg-[#1a1a1a] z-40 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">{pageTitle}</h2>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-5">
            {isInstallable && !isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#E91E8C] bg-[#E91E8C]/10 hover:bg-[#E91E8C]/20 rounded-lg transition-colors border border-[#E91E8C]/20"
                title="Installer l'application"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Installer</span>
              </button>
            )}
            <Link to="/admin/reservations" className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
              <Bell className="w-6 h-6" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-[#E91E8C] text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white transform translate-x-1/4 -translate-y-1/4">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </Link>
            <div className="w-10 h-10 rounded-full bg-[#E91E8C]/10 flex items-center justify-center border border-[#E91E8C]/20">
              <span className="text-[#E91E8C] font-bold text-sm">KPL</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
