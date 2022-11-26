/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/pages/**/*.{tsx, ts}", "./src/components/**/*.{tsx, ts}"],
  theme: {
    extend: {
      colors: {
        'dark': '#050505',
        'bud': '#79b473',
        'light': '#FFE2D1',
        'cool-blue': '#6F9CEB'
      }
    },
  },
  plugins: [],
}
