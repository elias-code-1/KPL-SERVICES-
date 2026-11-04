import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  targetDate: string | null;
  variant?: 'large' | 'compact';
  label?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeRemaining(targetIso: string | null): TimeRemaining | null {
  if (!targetIso) return null;
  const target = new Date(targetIso).getTime();
  if (isNaN(target)) return null;

  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, isPast: false };
}

export function Countdown({
  targetDate,
  variant = 'compact',
  label = 'Clôture des commandes de Noël dans :'
}: CountdownProps) {
  const [time, setTime] = useState<TimeRemaining | null>(() => calculateTimeRemaining(targetDate));

  useEffect(() => {
    setTime(calculateTimeRemaining(targetDate));

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(targetDate);
      setTime(remaining);
      if (remaining?.isPast) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!time || time.isPast) return null;

  if (variant === 'large') {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-[#D4AF37]/30 max-w-xl mx-auto my-6 text-center">
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold tracking-wider text-[#9B1B30] uppercase mb-4">
          <Clock className="w-4 h-4 text-[#E91E8C] animate-pulse" />
          <span>{label}</span>
        </div>

        <div className="grid grid-cols-4 gap-2 md:gap-4">
          <div className="flex flex-col items-center bg-[#FFF8F0] p-3 rounded-xl border border-[#F4E3A1]/40">
            <span className="text-2xl md:text-4xl font-extrabold text-[#9B1B30] tabular-nums font-mono">
              {String(time.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs font-medium text-stone-500 uppercase mt-1">Jours</span>
          </div>

          <div className="flex flex-col items-center bg-[#FFF8F0] p-3 rounded-xl border border-[#F4E3A1]/40">
            <span className="text-2xl md:text-4xl font-extrabold text-[#9B1B30] tabular-nums font-mono">
              {String(time.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs font-medium text-stone-500 uppercase mt-1">Heures</span>
          </div>

          <div className="flex flex-col items-center bg-[#FFF8F0] p-3 rounded-xl border border-[#F4E3A1]/40">
            <span className="text-2xl md:text-4xl font-extrabold text-[#9B1B30] tabular-nums font-mono">
              {String(time.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs font-medium text-stone-500 uppercase mt-1">Min</span>
          </div>

          <div className="flex flex-col items-center bg-[#FFF8F0] p-3 rounded-xl border border-[#F4E3A1]/40">
            <span className="text-2xl md:text-4xl font-extrabold text-[#E91E8C] tabular-nums font-mono">
              {String(time.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs font-medium text-stone-500 uppercase mt-1">Sec</span>
          </div>
        </div>

        <p className="text-xs text-stone-500 mt-4 italic">
          Anticipez votre réservation pour garantir la disponibilité de nos équipes.
        </p>
      </div>
    );
  }

  // Compact variant
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFF8F0] border border-[#D4AF37]/40 rounded-full text-xs font-medium text-[#9B1B30] shadow-sm">
      <Clock className="w-3.5 h-3.5 text-[#E91E8C]" />
      <span className="font-semibold tabular-nums font-mono">
        {time.days}j {String(time.hours).padStart(2, '0')}h {String(time.minutes).padStart(2, '0')}m {String(time.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
}
