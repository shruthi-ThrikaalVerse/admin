module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    './pages/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'zoom-in': {
          '0%': { transform: 'scale(.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out both',
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(.16,.84,.44,1) both',
        'zoom-in': 'zoom-in 200ms ease-out both',
        'shake': 'shake 600ms ease-in-out both'
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.custom-scrollbar': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgba(15, 23, 42, 0.06) transparent'
        },
        '.custom-scrollbar::-webkit-scrollbar': { width: '10px', height: '10px' },
        '.custom-scrollbar::-webkit-scrollbar-thumb': { background: 'rgba(15, 23, 42, 0.06)', 'border-radius': '9999px' }
      })
    }
  ],
};
