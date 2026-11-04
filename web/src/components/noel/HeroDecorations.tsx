import React from 'react';
import { 
  SapinDecore, 
  Etoile, 
  CadeauDore, 
  Houx, 
  Flocon1, 
  Flocon2, 
  Flocon3 
} from './assets';

export default function HeroDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Étoiles dorées haut gauche / haut droite */}
      <div className="absolute top-6 left-6 md:left-16 opacity-75 animate-pulse">
        <Etoile size={28} />
      </div>
      <div className="absolute top-10 right-8 md:right-24 opacity-80">
        <Etoile size={36} />
      </div>

      {/* Flocons délicats */}
      <div className="absolute top-24 left-1/4 opacity-40 hidden sm:block">
        <Flocon1 size={24} />
      </div>
      <div className="absolute top-36 right-1/4 opacity-50 hidden sm:block">
        <Flocon2 size={26} />
      </div>
      <div className="absolute bottom-16 left-12 opacity-40">
        <Flocon3 size={20} />
      </div>

      {/* Sapin décoré discret en coin bas droit (visible sur tablette & desktop) */}
      <div className="absolute -bottom-4 right-4 md:right-12 opacity-85 hidden md:block">
        <SapinDecore size={80} />
      </div>

      {/* Cadeau doré en coin bas gauche */}
      <div className="absolute bottom-3 left-4 md:left-14 opacity-75 hidden md:block">
        <CadeauDore size={52} />
      </div>

      {/* Branche de houx haut centre */}
      <div className="absolute top-2 right-1/3 opacity-60 hidden lg:block">
        <Houx size={32} />
      </div>
    </div>
  );
}
