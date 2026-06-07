/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        // Warm neutral "oat / paper" scale, replacing the cold default gray.
        gray: {
          50: '#FBF7F1',
          100: '#F3ECE1',
          200: '#E8DECF',
          300: '#D8CBB6',
          400: '#A99B85',
          500: '#897B66',
          600: '#6C5F4E',
          700: '#544A3C',
          800: '#3D352A',
          900: '#2B251D',
        },
        // Clay-rose accent (dyed-wool warmth), replacing the default rose.
        rose: {
          50: '#FBF0EC',
          100: '#F6DED4',
          200: '#ECC3B3',
          300: '#E0A28B',
          400: '#D08368',
          500: '#C16E5A',
          600: '#AE5A47',
          700: '#8F4838',
          800: '#74392E',
          900: '#5E3025',
        },
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(61, 53, 42, 0.06)',
        DEFAULT: '0 1px 3px 0 rgba(61, 53, 42, 0.08), 0 1px 2px -1px rgba(61, 53, 42, 0.06)',
        md: '0 6px 16px -6px rgba(61, 53, 42, 0.16)',
      },
    },
  },
  plugins: [],
}
