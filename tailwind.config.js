const { pink, teal } = require('@mui/material/colors');

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: teal,
        secondary: pink,
      },
    },
  },
  plugins: [],
};
