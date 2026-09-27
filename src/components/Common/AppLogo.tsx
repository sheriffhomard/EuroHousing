/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-sm', badge: 'text-xs' },
    md: { icon: 'w-8 h-8', text: 'text-base', badge: 'text-xs' },
    lg: { icon: 'w-10 h-10', text: 'text-lg', badge: 'text-xs' },
    xl: { icon: 'w-14 h-14', text: 'text-xl', badge: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Visual Emblem SVG */}
      <div className={`relative ${currentSize.icon} shrink-0`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Base rounded square with European royal blue gradient */}
          <rect
            width="48"
            height="48"
            rx="11"
            className="fill-blue-600 dark:fill-blue-500"
          />
          {/* Stylized Architectural House Gable & Ascending Trendline */}
          <path
            d="M12 28L24 16L36 28"
            stroke="#fbbf24"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Modern Euro symbol overlay */}
          <path
            d="M27 21C26.2 20.3 25.1 19.9 23.9 19.9C21.4 19.9 19.4 21.8 19.1 24.3M17 23.5H26M17 26.5H25M19.1 25.7C19.4 28.2 21.4 30.1 23.9 30.1C25.1 30.1 26.2 29.7 27 29"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Sparkle of European star */}
          <circle cx="34" cy="14" r="2" fill="#fbbf24" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold tracking-tight text-slate-900 dark:text-white ${currentSize.text}`}
            >
              Euro Housing Data
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">
            Observatoire Immobilier & Inflation · UE
          </span>
        </div>
      )}
    </div>
  );
};
