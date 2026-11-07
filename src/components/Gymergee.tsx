type Size = 'sm' | 'md' | 'lg' | 'hero'

const sizes: Record<Size, number> = {
  sm: 44,
  md: 64,
  lg: 120,
  hero: 220,
}

/**
 * Gymergee（俊美雞）— refined from user sketch:
 * one round body, headband, simple ellipse eyes, stacked triangle beak,
 * wing-hands (one holding a dumbbell), three-toed feet.
 */
export function Gymergee({
  size = 'md',
  className = '',
  bounce = false,
}: {
  size?: Size
  className?: string
  bounce?: boolean
}) {
  const px = sizes[size]
  return (
    <svg
      className={`gymergee ${bounce ? 'gymergee-bounce' : ''} ${className}`.trim()}
      width={px}
      height={px}
      viewBox="0 0 200 200"
      fill="none"
      role="img"
      aria-label="Gymergee, the BuddyShaper chick coach (俊美雞)"
    >
      <ellipse cx="100" cy="192" rx="42" ry="6" fill="#1B3A2F" opacity="0.12" />

      {/* —— left wing-arm bent, gripping dumbbell (from draft) —— */}
      <path
        d="M78 118
           C58 122 40 118 32 104
           C26 92 34 78 48 76
           C58 74 68 82 74 94
           C78 104 80 112 78 118Z"
        fill="#F0C03A"
        stroke="#1B2A22"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* wing-hand loop around dumbbell handle */}
      <ellipse
        cx="36"
        cy="88"
        rx="11"
        ry="9"
        fill="#FFD34D"
        stroke="#1B2A22"
        strokeWidth="4.5"
      />
      {/* cute dumbbell (sketch tool → gym) */}
      <g stroke="#1B2A22" strokeWidth="3.5" strokeLinejoin="round">
        <rect x="10" y="78" width="14" height="22" rx="4" fill="#4E5868" />
        <rect x="48" y="78" width="14" height="22" rx="4" fill="#4E5868" />
        <rect x="22" y="86" width="30" height="7" rx="3.5" fill="#3D4654" />
      </g>
      {/* wing tip feathers */}
      <path
        d="M48 78 C42 68 44 60 52 58 C58 62 58 72 54 78Z"
        fill="#FFD34D"
        stroke="#1B2A22"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M56 82 C54 70 60 62 68 64 C70 74 66 84 60 88Z"
        fill="#F0C03A"
        stroke="#1B2A22"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* —— right wing-hand raised cheer (draft X side redesigned) —— */}
      <path
        d="M122 116
           C140 112 158 100 162 82
           C164 68 152 58 138 62
           C128 66 122 78 120 92
           C118 104 118 112 122 116Z"
        fill="#F0C03A"
        stroke="#1B2A22"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* wing-hand fingers / feather tips */}
      <path
        d="M148 66 C152 56 160 52 166 56 C164 66 156 72 148 70Z"
        fill="#FFD34D"
        stroke="#1B2A22"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M140 62 C140 50 148 44 156 48 C154 58 146 64 140 62Z"
        fill="#FFD34D"
        stroke="#1B2A22"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M134 68 C130 58 134 50 142 48 C146 56 144 66 138 72Z"
        fill="#F0C03A"
        stroke="#1B2A22"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* —— single round body = head+torso (draft) —— */}
      <circle cx="100" cy="108" r="58" fill="#FFD34D" stroke="#1B2A22" strokeWidth="5.5" />
      {/* soft belly hint */}
      <ellipse cx="100" cy="132" rx="28" ry="22" fill="#FFE9A8" />

      {/* coral headband */}
      <path
        d="M48 92
           C58 70 142 70 152 92
           C142 104 122 110 100 110
           C78 110 58 104 48 92Z"
        fill="#FF5A5F"
        stroke="#1B2A22"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* headband knot / tails on the side */}
      <path
        d="M148 86 L164 68 L172 76 L156 94Z"
        fill="#FF5A5F"
        stroke="#1B2A22"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M152 92 L168 90 L170 100 L154 100Z"
        fill="#E23D45"
        stroke="#1B2A22"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* eyes — solid ellipses + one highlight each */}
      <ellipse cx="78" cy="112" rx="11" ry="16" fill="#1B2A22" />
      <ellipse cx="122" cy="112" rx="11" ry="16" fill="#1B2A22" />
      <circle cx="82" cy="105" r="3.2" fill="#FFFFFF" />
      <circle cx="126" cy="105" r="3.2" fill="#FFFFFF" />

      {/* beak — two rounded triangles stacked open */}
      <path
        d="M100 120
           Q92 128 88 134
           Q100 130 112 134
           Q108 128 100 120
           Z"
        fill="#FFB05A"
        stroke="#1B2A22"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M100 146
           Q92 138 88 134
           Q100 140 112 134
           Q108 138 100 146
           Z"
        fill="#FF9A3C"
        stroke="#1B2A22"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* blush */}
      <ellipse cx="56" cy="126" rx="10" ry="5.5" fill="#FF8A7A" opacity="0.45" />
      <ellipse cx="144" cy="126" rx="10" ry="5.5" fill="#FF8A7A" opacity="0.45" />

      {/* three-toed bird feet (draft) */}
      <g stroke="#1B2A22" strokeWidth="4" strokeLinejoin="round" fill="#FF9A3C">
        <path d="M82 164 L72 178 L82 174 L88 180 L90 174 L98 176 L90 166Z" />
        <path d="M118 164 L128 178 L118 174 L112 180 L110 174 L102 176 L110 166Z" />
      </g>
    </svg>
  )
}
