/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Airbnb-inspired color palette
        primary: {
          50: '#FFF1F0',
          100: '#FFE4E1',
          200: '#FFC9C2',
          300: '#FF9A8C',
          400: '#FF6B56',
          500: '#FF385C',  // Airbnb signature coral
          600: '#E31C5F',
          700: '#C91C54',
          800: '#A11A46',
          900: '#7A1533',
        },
        // Warmer neutrals like Airbnb
        background: {
          0: '#FFFFFF',
          50: '#F7F7F7',
          100: '#EBEBEB',
          200: '#DDDDDD',
          300: '#B0B0B0',
          900: '#222222',
        },
        typography: {
          0: '#FFFFFF',
          100: '#F7F7F7',
          400: '#717171',  // Airbnb secondary text
          500: '#6A6A6A',
          700: '#484848',  // Airbnb body text
          900: '#222222',  // Airbnb heading text
        },
        success: {
          50: '#E8F7EE',
          500: '#008A05',
          600: '#007504',
        },
        error: {
          50: '#FFF1F0',
          500: '#C13515',
          600: '#B02E0C',
        },
        warning: {
          50: '#FFF8E6',
          500: '#E07912',
          600: '#C96B0C',
        },
      },
      fontFamily: {
        heading: ['Inter-Bold', 'sans-serif'],
        body: ['Inter-Regular', 'sans-serif'],
      },
      // Airbnb-style border radius
      borderRadius: {
        'card': '16px',
        'image': '12px',
        'button': '8px',
        'pill': '9999px',
        'modal': '24px',
      },
      // Enhanced spacing for generous whitespace
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      // Airbnb-style shadows
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'modal': '0 8px 28px rgba(0, 0, 0, 0.28)',
        'tab': '0 -1px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
