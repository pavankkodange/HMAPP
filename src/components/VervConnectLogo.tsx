import React from 'react';

interface VervConnectLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export function VervConnectLogo({ size = 'md', animated = true, className = '' }: VervConnectLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const sizeValues = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };

  const logoSize = sizeValues[size];

  return (
    <>
      {animated && (
        <style>{`
          @keyframes vervLogoFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-2px) rotate(1deg); }
          }
          
          @keyframes vervLogoPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.9; transform: scale(1.02); }
          }
          
          @keyframes vervLogoGlow {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(14, 165, 233, 0.3)); }
            25% { filter: drop-shadow(0 0 12px rgba(71, 85, 105, 0.4)); }
            50% { filter: drop-shadow(0 0 10px rgba(14, 165, 233, 0.3)); }
            75% { filter: drop-shadow(0 0 14px rgba(71, 85, 105, 0.4)); }
          }
          
          .verv-logo-container:hover svg {
            animation-duration: 1s;
          }
        `}</style>
      )}
      
      <div className={`verv-logo-container ${sizeClasses[size]} ${className} flex items-center justify-center`}>
        <svg
          width={logoSize}
          height={logoSize}
          viewBox="0 0 100 100"
          className={`${sizeClasses[size]} object-contain`}
          style={{ 
            animation: animated ? 'vervLogoFloat 3s ease-in-out infinite, vervLogoPulse 4s ease-in-out infinite, vervLogoGlow 5s ease-in-out infinite' : 'none'
          }}
        >
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="url(#vervGradient)"
            stroke="url(#vervBorder)"
            strokeWidth="2"
          />
          
          {/* Connection Nodes */}
          <circle cx="30" cy="30" r="8" fill="url(#nodeGradient1)" />
          <circle cx="70" cy="30" r="8" fill="url(#nodeGradient2)" />
          <circle cx="30" cy="70" r="8" fill="url(#nodeGradient3)" />
          <circle cx="70" cy="70" r="8" fill="url(#nodeGradient4)" />
          <circle cx="50" cy="50" r="10" fill="url(#centerGradient)" />
          
          {/* Connection Lines */}
          <line x1="30" y1="30" x2="50" y2="50" stroke="url(#lineGradient1)" strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="30" x2="50" y2="50" stroke="url(#lineGradient2)" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="70" x2="50" y2="50" stroke="url(#lineGradient3)" strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="70" x2="50" y2="50" stroke="url(#lineGradient4)" strokeWidth="3" strokeLinecap="round" />
          
          {/* Letter V in center */}
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fill="white"
            fontFamily="Arial, sans-serif"
          >
            V
          </text>
          
          {/* Gradients */}
          <defs>
            <linearGradient id="vervGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            
            <linearGradient id="vervBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            
            <radialGradient id="nodeGradient1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </radialGradient>
            
            <radialGradient id="nodeGradient2">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>
            
            <radialGradient id="nodeGradient3">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
            
            <radialGradient id="nodeGradient4">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </radialGradient>
            
            <radialGradient id="centerGradient">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
            
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            
            <linearGradient id="lineGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            
            <linearGradient id="lineGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
}