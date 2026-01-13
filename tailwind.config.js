/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium dark palette with blue undertones
        primary: {
          DEFAULT: '#0F0F14',
          50: '#1A1A22',
          100: '#16161D',
          200: '#12121A',
          300: '#0F0F14',
          400: '#0A0A0E',
          500: '#050507',
        },
        // Rich surface colors for cards and elevated content
        surface: {
          DEFAULT: '#1C1C26',
          elevated: '#252532',
          overlay: '#2D2D3D',
        },
        // Refined accent colors - sophisticated yet fun
        accent: {
          // Warm amber/gold - refined from harsh yellow
          amber: {
            DEFAULT: '#F59E0B',
            50: '#FEF3C7',
            100: '#FDE68A',
            200: '#FCD34D',
            300: '#FBBF24',
            400: '#F59E0B',
            500: '#D97706',
            600: '#B45309',
          },
          // Teal/Cyan - refined from harsh cyan
          teal: {
            DEFAULT: '#14B8A6',
            50: '#CCFBF1',
            100: '#99F6E4',
            200: '#5EEAD4',
            300: '#2DD4BF',
            400: '#14B8A6',
            500: '#0D9488',
            600: '#0F766E',
          },
          // Coral/Red - for alerts and emphasis
          coral: {
            DEFAULT: '#F43F5E',
            50: '#FFE4E6',
            100: '#FECDD3',
            200: '#FDA4AF',
            300: '#FB7185',
            400: '#F43F5E',
            500: '#E11D48',
            600: '#BE123C',
          },
          // Legacy support
          yellow: '#F59E0B',
          cyan: '#14B8A6',
          red: '#F43F5E',
        },
        // Neutral grays with slight warmth
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      // Premium box shadows with color tints
      boxShadow: {
        'glow-amber': '0 0 40px -10px rgba(245, 158, 11, 0.3)',
        'glow-teal': '0 0 40px -10px rgba(20, 184, 166, 0.3)',
        'glow-coral': '0 0 40px -10px rgba(244, 63, 94, 0.3)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'premium-sm': '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.4)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      // Smooth, professional animations
      animation: {
        'pulse-soft': 'pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        // Legacy support
        'pulse-boost': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-up 0.3s ease-out',
        'lift': 'lift 0.2s ease-out forwards',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 20px -5px rgba(245, 158, 11, 0.3)' },
          '100%': { boxShadow: '0 0 30px -5px rgba(245, 158, 11, 0.5)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'lift': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-2px)' },
        },
        // Legacy
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Premium backdrop blur values
      backdropBlur: {
        xs: '2px',
      },
      // Refined border radius
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      // Font family for premium typography
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}