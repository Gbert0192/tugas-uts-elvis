/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{html,js,jsx,ts,tsx,ejs}",
    "node_modules/preline/dist/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("preline/plugin")],
};
//KALAU MAU UBAH TANYA W DLU (~GBERT), JANGAN ASAL, KUTABOK NTAR
