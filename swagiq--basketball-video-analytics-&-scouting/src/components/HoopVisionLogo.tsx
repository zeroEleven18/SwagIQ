import React from 'react';

interface SwagIQLogoProps {
  className?: string;
  size?: number;
}

export const SwagIQLogo: React.FC<SwagIQLogoProps> = ({ 
  className = "w-10 h-10", 
  size = 40 
}) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
    >
      {/* Left Hemisphere - Basketball Curves (Orange #F97316) */}
      <path 
        d="M 50 12 A 38 38 0 0 0 50 88" 
        stroke="#F97316" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      <path 
        d="M 12 50 H 50" 
        stroke="#F97316" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />
      <path 
        d="M 23 26 C 36 26 48 38 50 50" 
        stroke="#F97316" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />
      <path 
        d="M 23 74 C 36 74 48 62 50 50" 
        stroke="#F97316" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />

      {/* Right Hemisphere - Digital Data Stream & Numbers */}
      <text x="56" y="24" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono, monospace">1</text>
      <text x="68" y="27" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono, monospace">0</text>
      <rect x="53" y="27" width="3" height="3" fill="#F97316" rx="0.5" />
      <rect x="61" y="31" width="3.5" height="3.5" fill="#F97316" rx="0.5" />
      <rect x="71" y="33" width="3.5" height="3.5" fill="#38BDF8" rx="0.5" />

      <text x="57" y="39" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono, monospace">2</text>
      <text x="73" y="42" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono, monospace">4</text>
      <rect x="53" y="38" width="3" height="3" fill="#F97316" rx="0.5" />
      <rect x="67" y="42" width="2.5" height="2.5" fill="#F97316" rx="0.5" />
      <rect x="54" y="43" width="3.5" height="3.5" fill="#38BDF8" rx="0.5" />

      <text x="63" y="49" fill="#F97316" fontSize="11" fontWeight="900" fontFamily="JetBrains Mono, monospace">5</text>
      <text x="79" y="50" fill="#F97316" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono, monospace">7</text>
      <rect x="58" y="47" width="3" height="3" fill="#F97316" rx="0.5" />
      <rect x="72" y="48" width="2.5" height="2.5" fill="#FFFFFF" rx="0.5" />
      <rect x="87" y="46" width="3" height="3" fill="#38BDF8" rx="0.5" />

      <text x="57" y="59" fill="#F97316" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono, monospace">9</text>
      <text x="52" y="69" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono, monospace">8</text>
      <text x="69" y="70" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono, monospace">3</text>
      <rect x="53" y="56" width="3.5" height="3.5" fill="#38BDF8" rx="0.5" />
      <rect x="69" y="55" width="3.5" height="3.5" fill="#38BDF8" rx="0.5" />
      <rect x="63" y="62" width="6" height="3" fill="#F97316" rx="0.5" />
      <rect x="62" y="70" width="3" height="3" fill="#38BDF8" rx="0.5" />

      <text x="57" y="79" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono, monospace">6</text>
      <rect x="53" y="75" width="3.5" height="3.5" fill="#F97316" rx="0.5" />
      <rect x="64" y="75" width="3.5" height="8" fill="#F97316" rx="1" />
      <rect x="69" y="77" width="3" height="3" fill="#38BDF8" rx="0.5" />
      <rect x="73" y="71" width="3.5" height="9" fill="#EA580C" rx="1" />
      <rect x="57" y="82" width="3.5" height="3.5" fill="#38BDF8" rx="0.5" />

      {/* Vertical Data Bars on Right Edge */}
      <rect x="77" y="51" width="3.5" height="15" fill="#F97316" rx="1.2" />
      <rect x="83" y="47" width="3.5" height="19" fill="#F97316" rx="1.2" />
      <rect x="88" y="54" width="3.5" height="18" fill="#64748B" rx="1.2" />
      <rect x="93" y="58" width="3" height="10" fill="#475569" rx="1" />
    </svg>
  );
};

export const HoopVisionLogo = SwagIQLogo;
