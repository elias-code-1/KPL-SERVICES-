import { Link } from 'react-router-dom';
import { Sparkles, Gift, ArrowRight } from 'lucide-react';
import { useChristmas } from '../../context/ChristmasContext';

export function ChristmasBanner() {
  const { config } = useChristmas();

  if (!config.isEnabled) return null;

  return (
    <div className="relative bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 text-white text-xs sm:text-sm font-medium py-2.5 px-4 shadow-md z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 flex-1 justify-center sm:justify-start">
          <Gift className="w-4 h-4 text-amber-300 animate-bounce flex-shrink-0" />
          <span className="truncate">{config.bannerText}</span>
          <span className="hidden md:inline-flex items-center text-amber-200">
            <Sparkles className="w-3.5 h-3.5 ml-1 inline text-amber-300" />
          </span>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-center">
          <Link
            to="/noel"
            className="inline-flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-900 px-3 py-1 rounded-full text-xs font-bold transition-all shadow hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span>Découvrir l'Espace Noël</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
