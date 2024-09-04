import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: {
          800: "#1f1f2b",
          950: "#181821",
        },
        secondary: {400: "#9a9cab", 800: '#2c3e50'},
        accent: "#20c997",
        checkout: {
          100: "#fef6f6",
          200: "rgb(227, 192, 183)",
          300: "rgb(216, 159, 142)",
        },
        action: "#0dcaf0",
      },
    },
  },
  plugins: [],
};
export default config;
