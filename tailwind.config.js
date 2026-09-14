/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-subtle': '#F1F5F9',
        'surface-card': '#FFFFFF',
        'surface-border': '#E2E8F0',
        charcoal: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        hazard: {
          critical: '#DC2626',      // Red-600
          'critical-bg': '#FEF2F2',
          'critical-border': '#FECACA',
          warning: '#D97706',       // Amber-600
          'warning-bg': '#FFFBEB',
          'warning-border': '#FDE68A',
          moderate: '#F59E0B',      // Amber-500
          'moderate-bg': '#FFFDF5',
          'moderate-border': '#FEF08A',
          safe: '#10B981',          // Emerald-500
          'safe-bg': '#ECFDF5',
          'safe-border': '#A7F3D0',
          info: '#0284C7',          // Sky-600
          'info-bg': '#F0F9FF',
          'info-border': '#BAE6FD',
        },
        aegis: {
          navy: '#0B1528',
          blue: '#0284C7',
          dark: '#030712',
          card: '#0F172A',
          accent: '#38BDF8',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'glow-red': '0 0 15px rgba(220, 38, 38, 0.35)',
        'glow-blue': '0 0 15px rgba(2, 132, 199, 0.35)',
      },
      keyframes: {
        'pulse-radar': {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '50%': { transform: 'scale(1.8)', opacity: '0.4' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        'beacon-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        'pulse-radar': 'pulse-radar 2.5s cubic-bezier(0.24, 0, 0.38, 1) infinite',
        'beacon-glow': 'beacon-glow 1.5s ease-in-out infinite',
        'marquee': 'marquee 35s linear infinite',
      }
    },
  },
  plugins: [],
}
