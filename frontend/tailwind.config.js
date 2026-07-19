/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#030712',
          900: '#060a17',
          800: '#0b132b',
          700: '#1c2541',
          600: '#3a506b',
        },
        hospital: {
          blue: '#1e3a8a',
          cyan: '#06b6d4',
          teal: '#14b8a6',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s infinite alternate',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'float-medium': 'float-medium 6s ease-in-out infinite',
        'float-fast': 'float-fast 4s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'waveform': 'waveform 1.2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'text-glow': 'text-glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { boxShadow: '0 0 8px rgba(6, 182, 212, 0.3)', borderColor: 'rgba(6, 182, 212, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.8)', borderColor: 'rgba(6, 182, 212, 0.8)' }
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' }
        },
        'float-medium': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(-2deg)' }
        },
        'float-fast': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' }
        },
        'heartbeat': {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1.05)' },
          '42%': { transform: 'scale(1.2)' },
          '70%': { transform: 'scale(1)' }
        },
        'waveform': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' }
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        'text-glow': {
          '0%': { textShadow: '0 0 10px rgba(6, 182, 212, 0.2)' },
          '100%': { textShadow: '0 0 25px rgba(6, 182, 212, 0.6), 0 0 40px rgba(30, 58, 138, 0.4)' }
        }
      }
    },
  },
  plugins: [],
}
