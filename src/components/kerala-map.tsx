// src/components/kerala-map.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const districtPaths: { [key: string]: string } = {
  Kasaragod: 'M118 2L124 10L130 18L130 25L135 30L135 41L124 41L118 35L111 25L111 10L118 2Z',
  Kannur: 'M111 25L118 35L124 41L135 41L130 55L124 65L118 70L105 68L100 55L105 40L111 25Z',
  Wayanad: 'M105 68L118 70L124 65L130 55L142 68L135 80L124 85L111 80L105 68Z',
  Kozhikode: 'M100 55L105 68L111 80L100 90L95 80L90 65L100 55Z',
  Malappuram: 'M100 90L111 80L124 85L135 80L142 95L130 110L118 115L105 105L100 90Z',
  Palakkad: 'M135 80L142 68L155 85L150 100L142 110L130 110L135 80Z',
  Thrissur: 'M105 105L118 115L130 110L142 110L135 125L124 135L111 130L105 120L105 105Z',
  Ernakulam: 'M105 120L111 130L124 135L135 125L130 145L124 155L111 150L100 140L105 120Z',
  Idukki: 'M130 145L135 125L142 110L150 120L155 135L150 150L142 160L130 145Z',
  Kottayam: 'M100 140L111 150L124 155L130 145L124 165L111 170L100 160L100 140Z',
  Alappuzha: 'M95 165L100 160L111 170L105 180L100 185L95 175L95 165Z',
  Pathanamthitta: 'M105 180L111 170L124 165L130 175L124 185L111 190L105 180Z',
  Kollam: 'M100 185L105 180L111 190L118 200L111 210L100 200L100 185Z',
  Thiruvananthapuram: 'M100 200L111 210L118 200L124 215L118 225L111 230L105 220L100 200Z',
};

interface KeralaMapProps {
  className?: string;
  highlightedDistrict?: string | null;
  onDistrictClick?: (district: string) => void;
}

export const KeralaMap: React.FC<KeralaMapProps> = ({
  className,
  highlightedDistrict = null,
  onDistrictClick,
}) => {
  return (
    <svg
      viewBox="90 0 80 235"
      className={cn('w-full h-auto', className)}
      aria-label="Map of Kerala with its 14 districts"
    >
      <g>
        {Object.entries(districtPaths).map(([name, d]) => {
          const isHighlighted = highlightedDistrict === name;
          return (
            <path
              key={name}
              d={d}
              className={cn(
                'stroke-primary/50 fill-secondary stroke-2 transition-all duration-300',
                onDistrictClick && 'cursor-pointer',
                isHighlighted
                  ? 'fill-accent/80 stroke-accent'
                  : 'hover:fill-primary/30'
              )}
              onClick={() => onDistrictClick?.(name)}
            >
              <title>{name}</title>
            </path>
          );
        })}
      </g>
    </svg>
  );
};
