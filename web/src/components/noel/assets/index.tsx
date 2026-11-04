import React from 'react';

interface AssetProps {
  className?: string;
  size?: number;
}

export function MiniSapin({ className = '', size = 20 }: AssetProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2L6 9H9L5 15H9L7 19H17L15 15H19L15 9H18L12 2Z"
        fill="#1F5F46"
      />
      <rect x="10.5" y="19" width="3" height="3" rx="0.5" fill="#9B1B30" />
      <circle cx="12" cy="2" r="1.5" fill="#D4AF37" />
    </svg>
  );
}

export function SapinDecore({ className = '', size = 64 }: AssetProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sapinGrad" x1="32" y1="8" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2F8A63" />
          <stop offset="1" stopColor="#1F5F46" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F4E3A1" />
          <stop offset="1" stopColor="#D4AF37" />
        </linearGradient>
      </defs>
      {/* Tronc */}
      <rect x="28" y="52" width="8" height="9" rx="1.5" fill="#1A1A1A" opacity="0.8" />
      {/* Niveaux de sapin */}
      <path d="M32 8L44 24H37L48 38H40L52 52H12L24 38H16L27 24H20L32 8Z" fill="url(#sapinGrad)" />
      {/* Guirlande chic */}
      <path d="M26 24Q32 29 38 24" stroke="url(#goldGrad)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 38Q32 45 42 38" stroke="url(#goldGrad)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 51Q32 58 46 51" stroke="url(#goldGrad)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Boules rose et or */}
      <circle cx="32" cy="18" r="2" fill="#E91E8C" />
      <circle cx="28" cy="32" r="2.2" fill="#D4AF37" />
      <circle cx="36" cy="34" r="2.2" fill="#E91E8C" />
      <circle cx="24" cy="46" r="2.5" fill="#E91E8C" />
      <circle cx="34" cy="48" r="2.5" fill="#D4AF37" />
      <circle cx="43" cy="46" r="2.3" fill="#FFF8F0" />
      {/* Étoile sommmitale */}
      <polygon points="32,2 34,7 39,7 35,10 37,15 32,12 27,15 29,10 25,7 30,7" fill="url(#goldGrad)" />
    </svg>
  );
}

export function Etoile({ className = '', size = 32 }: AssetProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="starGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF8F0" />
          <stop offset="45%" stopColor="#F4E3A1" />
          <stop offset="100%" stopColor="#D4AF37" />
        </radialGradient>
      </defs>
      <path
        d="M16 2L18.5 12L28.5 14.5L20 18.5L22.5 28.5L16 22L9.5 28.5L12 18.5L3.5 14.5L13.5 12L16 2Z"
        fill="url(#starGold)"
      />
      <circle cx="16" cy="16" r="2" fill="#FFF8F0" />
    </svg>
  );
}

export function CadeauDore({ className = '', size = 48 }: AssetProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="boxGold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F4E3A1" />
          <stop offset="1" stopColor="#D4AF37" />
        </linearGradient>
      </defs>
      {/* Boîte principale */}
      <rect x="8" y="18" width="32" height="24" rx="3" fill="url(#boxGold)" />
      {/* Couvercle */}
      <rect x="6" y="14" width="36" height="7" rx="2" fill="#D4AF37" />
      {/* Ruban rose central */}
      <rect x="21" y="14" width="6" height="28" fill="#E91E8C" />
      {/* Nœud rose */}
      <path
        d="M17 10C17 7 21 6 23 10C23 13 18 14 17 10Z"
        fill="#E91E8C"
      />
      <path
        d="M31 10C31 7 27 6 25 10C25 13 30 14 31 10Z"
        fill="#E91E8C"
      />
      <circle cx="24" cy="12" r="2.5" fill="#9B1B30" />
    </svg>
  );
}

export function Houx({ className = '', size = 36 }: AssetProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Feuilles de houx */}
      <path
        d="M10 22C6 20 6 12 12 10C16 12 20 8 22 12C20 16 24 20 20 22C16 20 12 24 10 22Z"
        fill="#1F5F46"
      />
      <path
        d="M26 22C30 20 30 12 24 10C20 12 16 8 14 12C16 16 12 20 16 22C20 20 24 24 26 22Z"
        fill="#2F8A63"
      />
      {/* Baies rouges */}
      <circle cx="15" cy="20" r="3.2" fill="#9B1B30" />
      <circle cx="21" cy="20" r="3.2" fill="#E91E8C" />
      <circle cx="18" cy="25" r="3" fill="#9B1B30" />
      {/* Reflets brillants */}
      <circle cx="14" cy="19" r="1" fill="#FFF8F0" />
      <circle cx="20" cy="19" r="1" fill="#FFF8F0" />
    </svg>
  );
}

export function Flocon1({ className = '', size = 28 }: AssetProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14 2V26M2 14H26M5.5 5.5L22.5 22.5M5.5 22.5L22.5 5.5"
        stroke="#C9CED6"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="1.8" fill="#F4E3A1" />
    </svg>
  );
}

export function Flocon2({ className = '', size = 24 }: AssetProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2V22M2 12H22M6 6L18 18M6 18L18 6M9 4L12 7L15 4M9 20L12 17L15 20M4 9L7 12L4 15M20 9L17 12L20 15"
        stroke="#FFF8F0"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Flocon3({ className = '', size = 20 }: AssetProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 1V19M1 10H19M4 4L16 16M4 16L16 4"
        stroke="#F4E3A1"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="1.5" fill="#D4AF37" />
    </svg>
  );
}

export function PereNoel({ className = '', size = 64 }: AssetProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Sac de cadeaux sur le dos */}
      <ellipse cx="44" cy="38" rx="12" ry="14" fill="#D4AF37" />
      <path d="M40 25Q44 23 48 25" stroke="#9B1B30" strokeWidth="2" />

      {/* Corps & Manteau rouge profond */}
      <path d="M22 34C18 42 16 54 16 56H42C42 54 40 42 36 34Z" fill="#9B1B30" />
      {/* Bordure blanche manteau bas */}
      <rect x="15" y="54" width="28" height="4" rx="2" fill="#FFF8F0" />

      {/* Ceinture noire avec boucle dorée */}
      <rect x="18" y="44" width="22" height="4" fill="#1A1A1A" />
      <rect x="26" y="42" width="6" height="8" rx="1" fill="none" stroke="#D4AF37" strokeWidth="2" />

      {/* Tête & Visage */}
      <circle cx="29" cy="22" r="9" fill="#FFF8F0" />
      <ellipse cx="29" cy="22" rx="7" ry="6" fill="#FFE0BD" />
      {/* Yeux souriants */}
      <path d="M26 21Q27 19 28 21" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M30 21Q31 19 32 21" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round" />
      {/* Nez rond */}
      <circle cx="29" cy="23" r="1.5" fill="#E91E8C" />
      {/* Barbe blanche généreuse */}
      <path
        d="M21 24C21 34 37 34 37 24C37 22 21 22 21 24Z"
        fill="#FFFFFF"
      />
      {/* Moustache */}
      <path
        d="M24 25Q29 28 34 25Q29 24 24 25Z"
        fill="#FFF8F0"
      />

      {/* Bonnet rouge avec pompon */}
      <path d="M20 18Q29 6 38 18Z" fill="#9B1B30" />
      <rect x="19" y="16" width="20" height="3.5" rx="1.5" fill="#FFF8F0" />
      <circle cx="37" cy="8" r="2.5" fill="#FFF8F0" />
    </svg>
  );
}
