import { Sparkles, Gift } from 'lucide-react';
import { useChristmas } from '../../context/ChristmasContext';

export function ChristmasBanner() {
  const { config } = useChristmas();

  if (!config.isEnabled) return null;

  return (
    <div className="relative bg-gradient-to-r from-red-800 via-rose-800 to-amber-700 text-white text-xs sm:text-sm font-medium py-2 px-4 shadow-sm z-50 text-center">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
        <Gift className="w-4 h-4 text-amber-300 animate-bounce flex-shrink-0" />
        <span className="truncate">{config.bannerText}</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
      </div>
    </div>
  );
}
