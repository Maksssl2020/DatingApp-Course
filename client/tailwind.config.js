/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "custom-black-100": "#1a1c22",
        "custom-gray-100": "#2E3239",
        "custom-gray-200": "#26292B",
        "custom-blue-100": "#A2B2EE",
        "custom-blue-200": "#5F7ADB",
        "custom-white-100": "#f7f7f7",
      },
    },
  },
  plugins: [],
};
