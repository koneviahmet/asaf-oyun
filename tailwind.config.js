/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        maze: {
          wall: '#3d2b4f',
          floor: '#1a1a2e',
          accent: '#e94560',
          gold: '#f5a623',
          green: '#4ecca3',
        },
      },
    },
  },
  plugins: [],
}
