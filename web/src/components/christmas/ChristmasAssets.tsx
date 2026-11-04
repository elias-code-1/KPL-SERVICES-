import React from 'react';

// 1. SAPIN DE NOËL ILLUMINÉ DÉTAILLÉ
export function ChristmasTreeSVG({ className = "w-48 h-64", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 200 260" className={`${className} filter drop-shadow-lg`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="treeGreen1" x1="100" y1="20" x2="100" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E4620" />
          <stop offset="0.5" stopColor="#14532D" />
          <stop offset="1" stopColor="#0B3016" />
        </linearGradient>
        <linearGradient id="treeGreen2" x1="100" y1="20" x2="100" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22C55E" />
          <stop offset="1" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="trunkGrad" x1="100" y1="210" x2="100" y2="250" gradientUnits="userSpaceOnUse">
          <stop stopColor="#78350F" />
          <stop offset="1" stopColor="#451A03" />
        </linearGradient>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
          <stop offset="60%" stopColor="#EAB308" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#CA8A04" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Tronc */}
      <rect x="86" y="215" width="28" height="38" rx="4" fill="url(#trunkGrad)" />
      <path d="M86 230 C95 235, 105 235, 114 230" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />

      {/* Ombre au sol */}
      <ellipse cx="100" cy="250" rx="60" ry="10" fill="#000000" fillOpacity="0.3" />

      {/* Étage 4 (Bas) */}
      <path d="M100 135 L165 215 C145 220, 125 210, 100 216 C75 210, 55 220, 35 215 Z" fill="url(#treeGreen1)" />
      <path d="M100 138 L160 212 C145 216, 125 208, 100 213 C75 208, 55 216, 40 212 Z" fill="url(#treeGreen2)" fillOpacity="0.35" />
      {/* Neige sur branches */}
      <path d="M38 214 Q55 208 72 214 Q100 206 128 214 Q148 208 162 214 C150 210, 130 205, 100 208 C70 205, 50 210, 38 214 Z" fill="#F8FAFC" />

      {/* Étage 3 (Milieu bas) */}
      <path d="M100 95 L152 165 C135 170, 118 162, 100 166 C82 162, 65 170, 48 165 Z" fill="url(#treeGreen1)" />
      <path d="M100 98 L147 162 C135 166, 118 160, 100 164 C82 160, 65 166, 53 162 Z" fill="url(#treeGreen2)" fillOpacity="0.4" />
      <path d="M50 164 Q70 158 100 160 Q130 158 150 164 C138 160, 120 155, 100 157 C80 155, 62 160, 50 164 Z" fill="#F8FAFC" />

      {/* Étage 2 (Milieu haut) */}
      <path d="M100 55 L138 120 C125 125, 112 118, 100 122 C88 118, 75 125, 62 120 Z" fill="url(#treeGreen1)" />
      <path d="M100 58 L134 117 C125 121, 112 116, 100 120 C88 116, 75 121, 66 117 Z" fill="url(#treeGreen2)" fillOpacity="0.45" />
      <path d="M64 119 Q80 114 100 116 Q120 114 136 119 C126 116, 112 112, 100 114 C88 112, 74 116, 64 119 Z" fill="#F8FAFC" />

      {/* Étage 1 (Sommet) */}
      <path d="M100 20 L124 75 C114 78, 107 74, 100 77 C93 74, 86 78, 76 75 Z" fill="url(#treeGreen1)" />
      <path d="M100 24 L120 72 C114 75, 107 72, 100 75 C93 72, 86 75, 80 72 Z" fill="url(#treeGreen2)" fillOpacity="0.5" />
      <path d="M78 74 Q90 71 100 72 Q110 71 122 74 C114 72, 106 70, 100 71 C94 70, 86 72, 78 74 Z" fill="#F8FAFC" />

      {/* Guirlande dorée en spirale */}
      <path d="M90 40 Q110 50 118 70 Q90 85 75 105 Q125 125 135 150 Q80 170 60 195 Q140 210 150 215" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 4" className={animated ? "animate-pulse" : ""} />

      {/* Boules de Noël brillantes */}
      <circle cx="85" cy="85" r="5" fill="#EF4444" className={animated ? "animate-bounce" : ""} />
      <circle cx="84" cy="84" r="1.5" fill="#FFFFFF" />
      
      <circle cx="118" cy="100" r="5.5" fill="#EAB308" />
      <circle cx="116" cy="98" r="1.5" fill="#FFFFFF" />

      <circle cx="70" cy="140" r="6" fill="#3B82F6" />
      <circle cx="68" cy="138" r="1.8" fill="#FFFFFF" />

      <circle cx="105" cy="135" r="5" fill="#EC4899" />
      <circle cx="103" cy="133" r="1.5" fill="#FFFFFF" />

      <circle cx="135" cy="155" r="6" fill="#EAB308" />
      <circle cx="133" cy="153" r="1.8" fill="#FFFFFF" />

      <circle cx="80" cy="180" r="6.5" fill="#EF4444" />
      <circle cx="78" cy="178" r="2" fill="#FFFFFF" />

      <circle cx="115" cy="185" r="5.5" fill="#10B981" />
      <circle cx="113" cy="183" r="1.6" fill="#FFFFFF" />

      <circle cx="145" cy="195" r="6" fill="#8B5CF6" />
      <circle cx="143" cy="193" r="1.8" fill="#FFFFFF" />

      <circle cx="55" cy="195" r="6" fill="#F59E0B" />
      <circle cx="53" cy="193" r="1.8" fill="#FFFFFF" />

      {/* Étoile sommitale dorée scintillante */}
      <g className={animated ? "animate-pulse" : ""}>
        <circle cx="100" cy="20" r="14" fill="url(#starGlow)" />
        <polygon points="100,6 104,16 115,16 106,23 109,33 100,27 91,33 94,23 85,16 96,16" fill="#FACC15" stroke="#EAB308" strokeWidth="1" />
        <circle cx="100" cy="20" r="3" fill="#FFFBEB" />
      </g>
    </svg>
  );
}

// 2. PÈRE NOËL CHALEUREUX ET SOURIANT
export function SantaClausSVG({ className = "w-44 h-56", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 200 240" className={`${className} filter drop-shadow-xl`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="santaRed" x1="100" y1="20" x2="100" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DC2626" />
          <stop offset="1" stopColor="#991B1B" />
        </linearGradient>
        <radialGradient id="faceSkin" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </radialGradient>
      </defs>

      {/* Corps & Manteau */}
      <path d="M45 150 C45 130, 70 125, 100 125 C130 125, 155 130, 155 150 L165 225 C165 235, 35 235, 35 225 Z" fill="url(#santaRed)" />

      {/* Ceinture noire & boucle dorée */}
      <rect x="42" y="180" width="116" height="20" rx="3" fill="#18181B" />
      <rect x="85" y="175" width="30" height="30" rx="5" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
      <rect x="92" y="182" width="16" height="16" rx="2" fill="#18181B" />

      {/* Col en fourrure blanche */}
      <ellipse cx="100" cy="130" rx="45" ry="14" fill="#F8FAFC" />

      {/* Bras & Mitaines */}
      {/* Bras gauche qui salue */}
      <g className={animated ? "animate-bounce" : ""}>
        <path d="M45 140 C30 135, 20 115, 25 100 C30 85, 45 95, 52 115 Z" fill="url(#santaRed)" />
        <ellipse cx="26" cy="98" rx="8" ry="6" fill="#F8FAFC" />
        <ellipse cx="24" cy="90" rx="9" ry="11" fill="#DC2626" />
        <ellipse cx="29" cy="93" rx="4" ry="5" fill="#DC2626" />
      </g>

      {/* Bras droit */}
      <path d="M155 140 C170 145, 180 160, 175 180 C168 185, 160 170, 155 160 Z" fill="url(#santaRed)" />
      <ellipse cx="173" cy="180" rx="8" ry="6" fill="#F8FAFC" />
      <circle cx="176" cy="188" r="9" fill="#DC2626" />

      {/* Tête */}
      <ellipse cx="100" cy="90" rx="32" ry="30" fill="url(#faceSkin)" />

      {/* Yeux malicieux & lunettes dorées */}
      <ellipse cx="88" cy="85" rx="3" ry="4" fill="#18181B" />
      <ellipse cx="112" cy="85" rx="3" ry="4" fill="#18181B" />
      <circle cx="89" cy="83" r="1.2" fill="#FFFFFF" />
      <circle cx="113" cy="83" r="1.2" fill="#FFFFFF" />

      {/* Lunettes */}
      <circle cx="88" cy="85" r="8" stroke="#F59E0B" strokeWidth="1.8" fill="none" />
      <circle cx="112" cy="85" r="8" stroke="#F59E0B" strokeWidth="1.8" fill="none" />
      <path d="M96 85 L104 85" stroke="#F59E0B" strokeWidth="1.8" />

      {/* Joues roses */}
      <circle cx="80" cy="93" r="6" fill="#F43F5E" fillOpacity="0.4" />
      <circle cx="120" cy="93" r="6" fill="#F43F5E" fillOpacity="0.4" />

      {/* Gros nez rond rouge chaleureux */}
      <ellipse cx="100" cy="92" rx="7" ry="5" fill="#EF4444" />
      <ellipse cx="98" cy="90" rx="2" ry="1.5" fill="#FFFFFF" fillOpacity="0.6" />

      {/* Sourcils blancs */}
      <path d="M80 76 Q88 72 96 76" stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M104 76 Q112 72 120 76" stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" />

      {/* Barbe somptueuse & Moustache */}
      <path d="M68 95 C60 120, 70 165, 100 165 C130 165, 140 120, 132 95 C125 105, 115 110, 100 110 C85 110, 75 105, 68 95 Z" fill="#F8FAFC" />
      {/* Moustache */}
      <path d="M100 97 C90 92, 75 98, 72 108 C85 108, 95 103, 100 99 Z" fill="#FFFFFF" />
      <path d="M100 97 C110 92, 125 98, 128 108 C115 108, 105 103, 100 99 Z" fill="#FFFFFF" />

      {/* Bonnet de Noël avec pompon */}
      <path d="M68 70 C72 40, 120 20, 145 40 C155 48, 160 65, 155 80 L145 78 C140 45, 105 45, 78 68 Z" fill="url(#santaRed)" />
      {/* Bande de fourrure du bonnet */}
      <rect x="66" y="60" width="68" height="15" rx="7.5" fill="#F8FAFC" />
      {/* Pompon blanc */}
      <circle cx="158" cy="85" r="12" fill="#F8FAFC" className={animated ? "animate-pulse" : ""} />
      
      {/* Ourlet bas du manteau */}
      <rect x="30" y="220" width="140" height="16" rx="8" fill="#F8FAFC" />
    </svg>
  );
}

// 3. TRAÎNEAU MAGIQUE DE NOËL
export function SantaSleighSVG({ className = "w-44 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 140" className={`${className} filter drop-shadow-lg`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sleighRed" x1="50" y1="30" x2="180" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DC2626" />
          <stop offset="1" stopColor="#7F1D1D" />
        </linearGradient>
      </defs>
      {/* Sac de cadeaux débordant */}
      <ellipse cx="75" cy="50" rx="35" ry="30" fill="#92400E" />
      <rect x="95" y="30" width="30" height="30" rx="4" fill="#3B82F6" />
      <rect x="108" y="30" width="4" height="30" fill="#FBBF24" />
      <rect x="80" y="22" width="26" height="26" rx="3" fill="#10B981" />
      <rect x="91" y="22" width="4" height="26" fill="#F43F5E" />
      <circle cx="115" cy="20" r="10" fill="#F59E0B" />

      {/* Corps du Traîneau en velours rouge */}
      <path d="M35 55 C25 80, 50 105, 100 105 L175 105 C195 105, 205 90, 195 70 C190 60, 175 60, 165 72 L145 72 C145 60, 120 55, 95 62 L45 50 C38 48, 36 50, 35 55 Z" fill="url(#sleighRed)" stroke="#FBBF24" strokeWidth="3" />
      
      {/* Volutes dorées sur le traîneau */}
      <path d="M60 85 Q90 95 130 85" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="95" cy="86" r="3" fill="#FDE047" />

      {/* Patins métalliques dorés */}
      <path d="M15 125 L185 125 C205 125, 215 110, 210 95 C208 90, 202 92, 204 98 C206 105, 198 116, 180 116 L35 116 C25 116, 18 108, 20 98" stroke="#D97706" strokeWidth="4.5" strokeLinecap="round" />
      {/* Montants des patins */}
      <line x1="65" y1="105" x2="55" y2="120" stroke="#B45309" strokeWidth="4" />
      <line x1="145" y1="105" x2="135" y2="120" stroke="#B45309" strokeWidth="4" />
    </svg>
  );
}

// 4. RENNE DE NOËL RUDOLPH
export function RudolphReindeerSVG({ className = "w-36 h-48", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 160 200" className={`${className} filter drop-shadow-md`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rudolphNose" cx="40%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="60%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </radialGradient>
      </defs>

      {/* Bois majestueux de renne */}
      <path d="M55 50 C45 35, 30 30, 20 35 M32 34 C30 20, 40 10, 50 15 M36 24 C45 22, 52 28, 55 35" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M105 50 C115 35, 130 30, 140 35 M128 34 C130 20, 120 10, 110 15 M124 24 C115 22, 108 28, 105 35" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />

      {/* Oreilles */}
      <ellipse cx="45" cy="65" rx="14" ry="7" transform="rotate(-25 45 65)" fill="#92400E" />
      <ellipse cx="45" cy="65" rx="8" ry="4" transform="rotate(-25 45 65)" fill="#FBBF24" fillOpacity="0.4" />
      
      <ellipse cx="115" cy="65" rx="14" ry="7" transform="rotate(25 115 65)" fill="#92400E" />
      <ellipse cx="115" cy="65" rx="8" ry="4" transform="rotate(25 115 65)" fill="#FBBF24" fillOpacity="0.4" />

      {/* Tête */}
      <ellipse cx="80" cy="85" rx="35" ry="40" fill="#B45309" />
      <ellipse cx="80" cy="105" rx="26" ry="22" fill="#D97706" />

      {/* Yeux doux */}
      <ellipse cx="65" cy="80" rx="5" ry="6" fill="#1C1917" />
      <circle cx="67" cy="78" r="2" fill="#FFFFFF" />
      
      <ellipse cx="95" cy="80" rx="5" ry="6" fill="#1C1917" />
      <circle cx="97" cy="78" r="2" fill="#FFFFFF" />

      {/* Nez rouge lumineux de Rudolph */}
      <g className={animated ? "animate-pulse" : ""}>
        <circle cx="80" cy="105" r="15" fill="#EF4444" fillOpacity="0.25" />
        <circle cx="80" cy="105" r="10" fill="url(#rudolphNose)" />
        <ellipse cx="77" cy="102" rx="3" ry="2" fill="#FFFFFF" fillOpacity="0.8" />
      </g>

      {/* Collier rouge à clochettes dorées */}
      <path d="M50 145 Q80 160 110 145" stroke="#DC2626" strokeWidth="10" strokeLinecap="round" />
      <circle cx="80" cy="155" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="62" cy="150" r="5" fill="#FBBF24" />
      <circle cx="98" cy="150" r="5" fill="#FBBF24" />

      {/* Corps */}
      <path d="M55 152 C45 170, 50 200, 50 200 L110 200 C110 200, 115 170, 105 152 Z" fill="#92400E" />
      <ellipse cx="80" cy="180" rx="16" ry="18" fill="#FDE68A" fillOpacity="0.6" />
    </svg>
  );
}

// 5. BONHOMME DE NEIGE STYLÉ
export function SnowmanSVG({ className = "w-36 h-48", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 160 210" className={`${className} filter drop-shadow-md`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ombre */}
      <ellipse cx="80" cy="198" rx="45" ry="8" fill="#000000" fillOpacity="0.2" />

      {/* Boule inférieure */}
      <circle cx="80" cy="155" r="42" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
      {/* Boutons de charbon */}
      <circle cx="80" cy="140" r="3.5" fill="#1E293B" />
      <circle cx="80" cy="155" r="3.5" fill="#1E293B" />
      <circle cx="80" cy="170" r="3.5" fill="#1E293B" />

      {/* Bras en branches de bois */}
      <path d="M40 120 L15 105 M25 110 L20 100" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
      <path d="M120 120 L145 100 M135 108 L145 115" stroke="#78350F" strokeWidth="3" strokeLinecap="round" className={animated ? "animate-bounce" : ""} />

      {/* Boule supérieure (Tête) */}
      <circle cx="80" cy="85" r="28" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />

      {/* Écharpe rouge et verte */}
      <path d="M60 106 C70 114, 90 114, 100 106 L104 114 C92 122, 68 122, 56 114 Z" fill="#DC2626" />
      <rect x="88" y="112" width="12" height="30" rx="3" fill="#DC2626" transform="rotate(10 88 112)" />
      <rect x="89" y="125" width="12" height="6" fill="#16A34A" transform="rotate(10 89 125)" />

      {/* Yeux en charbon */}
      <circle cx="72" cy="80" r="2.8" fill="#1E293B" />
      <circle cx="88" cy="80" r="2.8" fill="#1E293B" />

      {/* Nez en carotte */}
      <polygon points="78,86 102,89 78,92" fill="#EA580C" />

      {/* Sourire en points de charbon */}
      <circle cx="68" cy="94" r="1.5" fill="#1E293B" />
      <circle cx="73" cy="98" r="1.5" fill="#1E293B" />
      <circle cx="80" cy="100" r="1.5" fill="#1E293B" />
      <circle cx="87" cy="98" r="1.5" fill="#1E293B" />
      <circle cx="92" cy="94" r="1.5" fill="#1E293B" />

      {/* Chapeau haut-de-forme noir avec ruban rouge */}
      <ellipse cx="80" cy="62" rx="28" ry="6" fill="#0F172A" />
      <rect x="64" y="28" width="32" height="32" rx="3" fill="#1E293B" />
      <rect x="64" y="52" width="32" height="6" fill="#DC2626" />
      <circle cx="72" cy="48" r="3" fill="#16A34A" />
      <circle cx="75" cy="47" r="1.5" fill="#DC2626" />
    </svg>
  );
}

// 6. CLOCHES DE NOËL DORÉES
export function GoldenBellsSVG({ className = "w-28 h-28", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className={`${className} filter drop-shadow-md`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bellGold" x1="30" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="0.5" stopColor="#EAB308" />
          <stop offset="1" stopColor="#A16207" />
        </linearGradient>
      </defs>

      {/* Cloche de gauche */}
      <g transform="rotate(-15 45 60)" className={animated ? "animate-pulse" : ""}>
        <path d="M35 35 C35 25, 55 25, 55 35 L62 70 C65 78, 25 78, 28 70 Z" fill="url(#bellGold)" stroke="#CA8A04" strokeWidth="1.5" />
        <ellipse cx="45" cy="74" rx="18" ry="5" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.5" />
        <circle cx="45" cy="80" r="4.5" fill="#713F12" />
      </g>

      {/* Cloche de droite */}
      <g transform="rotate(15 75 60)">
        <path d="M65 35 C65 25, 85 25, 85 35 L92 70 C95 78, 55 78, 58 70 Z" fill="url(#bellGold)" stroke="#CA8A04" strokeWidth="1.5" />
        <ellipse cx="75" cy="74" rx="18" ry="5" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.5" />
        <circle cx="75" cy="80" r="4.5" fill="#713F12" />
      </g>

      {/* Nœud en ruban rouge velours */}
      <ellipse cx="60" cy="28" rx="8" ry="8" fill="#DC2626" />
      <path d="M60 28 C45 10, 30 25, 55 32 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
      <path d="M60 28 C75 10, 90 25, 65 32 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
      {/* Rubans pendants */}
      <path d="M56 32 C50 48, 40 55, 35 60 L42 62 C46 55, 54 48, 58 35 Z" fill="#DC2626" />
      <path d="M64 32 C70 48, 80 55, 85 60 L78 62 C74 55, 66 48, 62 35 Z" fill="#DC2626" />

      {/* Feuilles de houx */}
      <circle cx="60" cy="24" r="3" fill="#15803D" />
      <circle cx="56" cy="22" r="3" fill="#15803D" />
      <circle cx="64" cy="22" r="3" fill="#15803D" />
    </svg>
  );
}

// 7. BOÎTE CADEAU MAGIQUE
export function GiftBoxSVG({ className = "w-28 h-28", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className={`${className} filter drop-shadow-lg`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boxRed" x1="20" y1="40" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#991B1B" />
        </linearGradient>
      </defs>

      {/* Étoiles étincelles magiques au-dessus du cadeau */}
      {animated && (
        <g className="animate-pulse">
          <polygon points="60,6 62,12 68,12 63,16 65,22 60,18 55,22 57,16 52,12 58,12" fill="#FBBF24" />
          <polygon points="35,18 36,22 40,22 37,25 38,29 35,26 32,29 33,25 30,22 34,22" fill="#FDE047" />
          <polygon points="85,18 86,22 90,22 87,25 88,29 85,26 82,29 83,25 80,22 84,22" fill="#FDE047" />
        </g>
      )}

      {/* Boîte principale */}
      <rect x="25" y="52" width="70" height="52" rx="4" fill="url(#boxRed)" stroke="#7F1D1D" strokeWidth="1.5" />
      
      {/* Ruban or vertical */}
      <rect x="54" y="52" width="12" height="52" fill="#FBBF24" />
      
      {/* Ruban or horizontal */}
      <rect x="25" y="72" width="70" height="12" fill="#FBBF24" />

      {/* Couvercle */}
      <rect x="20" y="42" width="80" height="15" rx="3" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
      <rect x="54" y="42" width="12" height="15" fill="#F59E0B" />

      {/* Gros ruban or noué sur le dessus */}
      <path d="M60 42 C45 28, 35 38, 55 42 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <path d="M60 42 C75 28, 85 38, 65 42 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="60" cy="42" r="5" fill="#F59E0B" />
    </svg>
  );
}

// 8. COURONNE DE NOËL
export function ChristmasWreathSVG({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" className={`${className} filter drop-shadow-md`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cercle de sapin */}
      <circle cx="70" cy="70" r="46" stroke="#14532D" strokeWidth="24" strokeDasharray="6 4" />
      <circle cx="70" cy="70" r="46" stroke="#16A34A" strokeWidth="16" strokeDasharray="4 6" />

      {/* Petites baies rouges */}
      <circle cx="45" cy="45" r="4" fill="#DC2626" />
      <circle cx="50" cy="42" r="3.5" fill="#EF4444" />
      <circle cx="95" cy="45" r="4" fill="#DC2626" />
      <circle cx="100" cy="50" r="3.5" fill="#EF4444" />
      <circle cx="35" cy="85" r="4" fill="#DC2626" />
      <circle cx="105" cy="85" r="4" fill="#DC2626" />
      <circle cx="70" cy="112" r="4" fill="#DC2626" />

      {/* Nœud majestueux rouge et or */}
      <ellipse cx="70" cy="30" rx="9" ry="8" fill="#DC2626" />
      <path d="M70 30 C50 15, 38 28, 64 34 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
      <path d="M70 30 C90 15, 102 28, 76 34 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
      {/* Rubans pendants */}
      <path d="M66 34 L52 65 L60 62 L67 36 Z" fill="#DC2626" />
      <path d="M74 34 L88 65 L80 62 L73 36 Z" fill="#DC2626" />
    </svg>
  );
}

// 9. SUCRES D'ORGE CROISÉS
export function CandyCanesSVG({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-sm`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Canne 1 */}
      <g transform="rotate(-25 50 50)">
        <path d="M45 85 L45 35 C45 20, 65 20, 65 35" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
        <path d="M45 85 L45 35 C45 20, 65 20, 65 35" stroke="#DC2626" strokeWidth="10" strokeLinecap="round" strokeDasharray="6 8" />
      </g>
      {/* Canne 2 */}
      <g transform="rotate(25 50 50)">
        <path d="M55 85 L55 35 C55 20, 35 20, 35 35" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
        <path d="M55 85 L55 35 C55 20, 35 20, 35 35" stroke="#16A34A" strokeWidth="10" strokeLinecap="round" strokeDasharray="6 8" />
      </g>
      {/* Nœud central doré */}
      <circle cx="50" cy="55" r="6" fill="#FBBF24" />
    </svg>
  );
}

// 10. BOTTE / CHAUSSETTE DE NOËL
export function ChristmasStockingSVG({ className = "w-24 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 130" className={`${className} filter drop-shadow-md`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Botte en feutrine rouge */}
      <path d="M35 30 L35 85 C35 95, 20 105, 30 115 C40 125, 75 125, 75 110 C75 95, 65 85, 65 30 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
      
      {/* Talon et orteils en vert */}
      <ellipse cx="34" cy="98" rx="8" ry="10" fill="#15803D" />
      <ellipse cx="38" cy="116" rx="10" ry="7" fill="#15803D" />

      {/* Revers en fausse fourrure blanche */}
      <rect x="28" y="18" width="44" height="18" rx="6" fill="#F8FAFC" />
      <circle cx="48" cy="18" r="4" fill="#F8FAFC" />

      {/* Flocon décoratif sur la chaussette */}
      <g transform="translate(48, 60)">
        <line x1="-8" y1="0" x2="8" y2="0" stroke="#FDE047" strokeWidth="1.5" />
        <line x1="0" y1="-8" x2="0" y2="8" stroke="#FDE047" strokeWidth="1.5" />
        <line x1="-6" y1="-6" x2="6" y2="6" stroke="#FDE047" strokeWidth="1.5" />
        <line x1="-6" y1="6" x2="6" y2="-6" stroke="#FDE047" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// 11. BOUGIE DE FÊTE SCINTILLANTE
export function HolidayCandleSVG({ className = "w-24 h-32", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 100 120" className={`${className} filter drop-shadow-md`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Assiette / Soucoupe dorée */}
      <ellipse cx="50" cy="105" rx="35" ry="8" fill="#EAB308" stroke="#A16207" strokeWidth="1.5" />
      {/* Brindilles de sapin */}
      <path d="M20 102 C30 96, 40 102, 50 100" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 100 C60 96, 75 102, 85 100" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />

      {/* Bougie rouge */}
      <rect x="38" y="45" width="24" height="60" rx="3" fill="#DC2626" />
      <rect x="38" y="45" width="5" height="60" fill="#EF4444" />
      
      {/* Cire fondue */}
      <path d="M38 48 C42 55, 46 45, 50 50 C54 46, 58 54, 62 48" fill="#DC2626" />
      
      {/* Mèche */}
      <line x1="50" y1="45" x2="50" y2="35" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

      {/* Flamme animée */}
      <g className={animated ? "animate-pulse" : ""}>
        <path d="M50 12 C42 24, 45 35, 50 35 C55 35, 58 24, 50 12 Z" fill="#F59E0B" />
        <path d="M50 18 C46 26, 48 33, 50 33 C52 33, 54 26, 50 18 Z" fill="#FEF08A" />
      </g>
    </svg>
  );
}

// 12. BONHOMME EN PAIN D'ÉPICES
export function GingerbreadManSVG({ className = "w-24 h-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 110" className={`${className} filter drop-shadow-sm`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Corps */}
      <path d="M50 25 C60 25, 68 18, 68 12 C68 6, 60 0, 50 0 C40 0, 32 6, 32 12 C32 18, 40 25, 50 25 Z" fill="#B45309" transform="translate(0, 10)" />
      <path d="M42 35 L20 52 C16 55, 20 62, 26 58 L38 48 L38 75 L25 100 C21 106, 28 110, 34 105 L48 85 L52 85 L66 105 C72 110, 79 106, 75 100 L62 75 L62 48 L74 58 C80 62, 84 55, 80 52 L58 35 Z" fill="#B45309" />

      {/* Glaçage blanc sur bras et jambes */}
      <path d="M22 54 Q25 51 28 56" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M72 56 Q75 51 78 54" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 98 Q32 94 36 98" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M64 98 Q68 94 72 98" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

      {/* Visage */}
      <circle cx="45" cy="20" r="2" fill="#1C1917" />
      <circle cx="55" cy="20" r="2" fill="#1C1917" />
      <path d="M46 26 Q50 29 54 26" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

      {/* Nœud papillon rouge et boutons */}
      <polygon points="46,36 54,40 46,44" fill="#DC2626" />
      <polygon points="54,36 46,40 54,44" fill="#DC2626" />
      <circle cx="50" cy="52" r="3" fill="#16A34A" />
      <circle cx="50" cy="62" r="3" fill="#DC2626" />
    </svg>
  );
}

// 13. FLOCON DE NEIGE GÉOMÉTRIQUE CRISTAL
export function CrystalSnowflakeSVG({ className = "w-16 h-16", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-sm ${animated ? "animate-spin" : ""}`} style={{ animationDuration: '24s' }} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="snowGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E0F2FE" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <g key={i} transform={`rotate(${angle} 50 50)`}>
          <line x1="50" y1="50" x2="50" y2="10" stroke="url(#snowGrad)" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="50" y1="30" x2="40" y2="20" stroke="url(#snowGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="30" x2="60" y2="20" stroke="url(#snowGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="20" x2="43" y2="13" stroke="url(#snowGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="20" x2="57" y2="13" stroke="url(#snowGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="10" r="2.5" fill="#BAE6FD" />
        </g>
      ))}
      <circle cx="50" cy="50" r="7" fill="#F0F9FF" stroke="#38BDF8" strokeWidth="2" />
    </svg>
  );
}

// 14. GUIRLANDE LUMINEUSE ANIMÉE
export function FairyLightsGarlandSVG({ className = "w-full h-12" }: { className?: string }) {
  const bulbs = [
    { x: 40, y: 22, color: "#EF4444" },
    { x: 90, y: 30, color: "#EAB308" },
    { x: 140, y: 24, color: "#22C55E" },
    { x: 190, y: 32, color: "#3B82F6" },
    { x: 240, y: 26, color: "#EC4899" },
    { x: 290, y: 32, color: "#F59E0B" },
    { x: 340, y: 24, color: "#10B981" },
    { x: 390, y: 30, color: "#EF4444" },
  ];

  return (
    <svg viewBox="0 0 420 50" preserveAspectRatio="none" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fil de la guirlande */}
      <path d="M0 10 Q60 38 120 18 Q180 40 240 18 Q300 40 360 18 Q390 30 420 10" stroke="#1E293B" strokeWidth="2" fill="none" />
      
      {/* Ampoules */}
      {bulbs.map((b, idx) => (
        <g key={idx} className="animate-pulse" style={{ animationDelay: `${(idx % 4) * 0.4}s` }}>
          <rect x={b.x - 2} y={b.y - 6} width="4" height="6" fill="#475569" />
          <ellipse cx={b.x} cy={b.y + 4} rx="5" ry="8" fill={b.color} />
          <circle cx={b.x - 1.5} cy={b.y + 2} r="1.5" fill="#FFFFFF" fillOpacity="0.7" />
        </g>
      ))}
    </svg>
  );
}

// 15. ÉTOILE MAGIQUE DE BETHLEEM / NOËL
export function MagicBethlehemStarSVG({ className = "w-20 h-20", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} ${animated ? "animate-pulse" : ""}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="starRadial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#starRadial)" opacity="0.6" />
      {/* Rayon vertical */}
      <polygon points="50,5 54,42 50,50 46,42" fill="#FDE047" />
      <polygon points="50,95 54,58 50,50 46,58" fill="#FDE047" />
      {/* Rayon horizontal */}
      <polygon points="5,50 42,46 50,50 42,54" fill="#FDE047" />
      <polygon points="95,50 58,46 50,50 58,54" fill="#FDE047" />
      {/* Diagonales */}
      <polygon points="20,20 44,44 50,50 44,44" fill="#FEF08A" />
      <polygon points="80,20 56,44 50,50 56,44" fill="#FEF08A" />
      <polygon points="20,80 44,56 50,50 44,56" fill="#FEF08A" />
      <polygon points="80,80 56,56 50,50 56,56" fill="#FEF08A" />
      <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
    </svg>
  );
}

// 16. FANFARE / TROMPETTE DE NOËL (Signature des livraisons surprises KPL)
export function FanfareTrumpetSVG({ className = "w-28 h-28", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className={`${className} filter drop-shadow-md`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="trumpetGold" x1="10" y1="30" x2="110" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="0.6" stopColor="#EAB308" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Pavillon de trompette */}
      <path d="M75 40 Q100 25 110 20 L110 75 Q100 70 75 55 Z" fill="url(#trumpetGold)" stroke="#A16207" strokeWidth="1.5" />
      <ellipse cx="110" cy="47" rx="5" ry="28" fill="#F59E0B" stroke="#92400E" strokeWidth="1.5" />

      {/* Tube & Pistons */}
      <path d="M15 50 L75 50" stroke="url(#trumpetGold)" strokeWidth="6" strokeLinecap="round" />
      <rect x="42" y="38" width="6" height="24" rx="2" fill="#EAB308" stroke="#A16207" strokeWidth="1" />
      <rect x="52" y="38" width="6" height="24" rx="2" fill="#EAB308" stroke="#A16207" strokeWidth="1" />
      <rect x="62" y="38" width="6" height="24" rx="2" fill="#EAB308" stroke="#A16207" strokeWidth="1" />

      {/* Embouchure */}
      <polygon points="12,46 18,48 18,52 12,54" fill="#713F12" />

      {/* Fanion de fête suspendu */}
      <polygon points="35,52 65,52 60,82 50,75 40,82" fill="#DC2626" stroke="#FBBF24" strokeWidth="1.5" />
      <text x="50" y="68" fill="#FDE047" fontSize="9" fontWeight="bold" textAnchor="middle">KPL</text>

      {/* Notes de musique animées */}
      {animated && (
        <g className="animate-bounce">
          <text x="95" y="20" fill="#FBBF24" fontSize="16" fontWeight="bold">♪</text>
          <text x="108" y="15" fill="#EF4444" fontSize="14" fontWeight="bold">♫</text>
        </g>
      )}
    </svg>
  );
}
