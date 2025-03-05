import React from 'react'

export const ParadiseLogo = ({ className }) => {
  return (
    <svg 
      className={className}
      width="140" 
      height="32" 
      viewBox="0 0 140 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient 
          id="paradiseGradient" 
          x1="0%" 
          y1="0%" 
          x2="100%" 
          y2="100%"
        >
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#008B9E" />
        </linearGradient>
      </defs>
      
      <path 
        d="M10 8h12c4.4183 0 8 3.5817 8 8s-3.5817 8-8 8H10V8z"
        fill="url(#paradiseGradient)"
        fillOpacity="0.1"
      />
      
      <text
        x="70"
        y="22"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="24"
        fontWeight="bold"
        fill="url(#paradiseGradient)"
      >
        Paradise
      </text>

      <path
        d="M120 12c0 1.1046-.8954 2-2 2s-2-.8954-2-2 .8954-2 2-2 2 .8954 2 2z"
        fill="#4CAF50"
      />
      
      <path 
        d="M126 16c-1.6569 0-3-1.3431-3-3s1.3431-3 3-3 3 1.3431 3 3-1.3431 3-3 3z"
        fill="url(#paradiseGradient)"
        fillOpacity="0.6"
      />
    </svg>
  )
} 