/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        femina: {
          50: '#FDF8F7',
          100: '#FAF0EE',
          200: '#F4DDD9',
          300: '#EABFB7',
          400: '#DD998E',
          500: '#C96859',
          600: '#B04E40',
          700: '#8C382D',
          800: '#5E241D',
          900: '#3D1510',
          950: '#230B08',
        },
        gold: {
          50: '#FCFBF4',
          100: '#F7F4E3',
          200: '#EEE6BF',
          300: '#E1D393',
          400: '#D4AF37', // Classic Rich Gold
          500: '#B89020',
          600: '#947016',
          700: '#735213',
          800: '#5A3E15',
          900: '#483115',
        },
        luxury: {
          dark: '#140D0C',
          card: '#1F1413',
          cream: '#FAF7F2',
          blush: '#FDF3F2',
          wine: '#4A0E17',
          emerald: '#0D382A',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Montserrat"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -5px rgba(74, 14, 23, 0.08), 0 4px 6px -2px rgba(74, 14, 23, 0.04)',
        'luxury-hover': '0 20px 40px -10px rgba(74, 14, 23, 0.15), 0 8px 10px -4px rgba(74, 14, 23, 0.08)',
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
