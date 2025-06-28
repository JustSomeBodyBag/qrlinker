/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Тёмная тема по классу 'dark'
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',   // Синий (для кнопок, ссылок)
        secondary: '#64748B', // Слэйт (вторичный текст)
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Поддержка тёмной темы в input, select, textarea
  ],
};
