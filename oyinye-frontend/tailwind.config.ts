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
          500: '#28283d',
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
        detail: {
          100: 'rgba(20, 57, 151, 0.05)',
          500: '#143997'
        },
        action: "#0dcaf0",
      },
      keyframes: {
        forward: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        backward: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'slide-up': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(-5rem)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'angle-down-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(180deg)' },
        },
        'angle-down-rotate-anticlock': {
          '0%': { transform: 'rotate(180deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'angle-left-rotate': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-180deg)' },
        },
        'angle-left-rotate-clock': {
          from: { transform: 'rotate(-180deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'angle-up-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-180deg)' },
        },
        'angle-up-rotate-clock': {
          '0%': { transform: 'rotate(-180deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        forward: 'forward 0.3s linear forwards',
        backward: 'backward 0.3s linear forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'slide-down': 'slide-down 0.3s ease-out forwards',
        'rotate-down': 'angle-down-rotate 0.3s ease-in-out forwards',
        'rotate-up': 'angle-down-rotate-anticlock 0.3s ease-in-out forwards',
        'rotate-left-up': 'angle-left-rotate 0.3s ease-in-out forwards',
        'rotate-left-down': 'angle-left-rotate-clock 0.3s ease-in-out forwards',
        'rotate-up-up': 'angle-up-rotate 0.3s ease-in-out forwards',
        'rotate-up-down': 'angle-up-rotate-clock 0.3s ease-in-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
