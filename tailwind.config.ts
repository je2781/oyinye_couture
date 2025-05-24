import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./packages/ui/src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/admin/src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
          500: "#28283d",
          800: "#1f1f2b",
          950: "#181821",
        },
        secondary: { 400: "#9a9cab", 800: "#2c3e50" },
        accent: "#20c997",
        checkout: {
          100: "#fef6f6",
          200: "rgb(227, 192, 183)",
          300: "rgb(216, 159, 142)",
        },
        detail: {
          100: "rgba(20, 57, 151, 0.05)",
          500: "#143997",
        },
        action: "#0dcaf0",
      },
      keyframes: {
        angleLeftRotate: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(-180deg)" },
        },
        angleLeftRotateClock: {
          from: { transform: "rotate(-180deg)" },
          to: { transform: "rotate(0deg)" },
        },
        slideLeft: {
          "0%": { right: "28.5%" },
          "100%": { right: "53%" },
        },
        reverseSlideLeft: {
          "0%": { right: "53%" },
          "100%": { right: "28.5%" },
        },
        angleUpRotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-180deg)" },
        },
        angleUpRotateClock: {
          "0%": { transform: "rotate(-180deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        loading: {
          "0%": { width: "0", left: "0" },
          "50%": { width: "100%", left: "0" },
          "100%": { width: "0", left: "100%" },
        },
        forward: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        backward: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        iconExpand: {
          from: { opacity: "0", transform: "scale(0)" },
          to: { opacity: "1", transform: "scale(1)", backgroundColor: "#000" },
        },
        iconCollapse: {
          from: {
            opacity: "1",
            transform: "scale(1)",
            backgroundColor: "#000",
          },
          to: { opacity: "0", transform: "scale(0)" },
        },
        changeColor: {
          from: { color: "rgb(75, 85, 99)" },
          to: { color: "rgb(194, 194, 194)", fontWeight: "800" },
        },
        changeColorReverse: {
          from: { color: "rgb(194, 194, 194)", fontWeight: "800" },
          to: { color: "rgb(75, 85, 99)" },
        },
        hintExpand: {
          from: { opacity: "0", transform: "scale(0)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        slideTextUp: {
          "0%": { opacity: "0", transform: "translateY(5rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        angleDownRotateAnti: {
          "0%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        angleDownRotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(180deg)" },
        },
        showLabel: {
          "0%": {
            maxHeight: "0",
            opacity: "0",
            transform: "translateY(2px)",
            display: "none",
          },
          "100%": {
            maxHeight: "10px",
            opacity: "1",
            transform: "translateY(0)",
            display: "inline-block",
          },
        },
        hideLabel: {
          "0%": {
            maxHeight: "10px",
            opacity: "1",
            transform: "translateY(0)",
            display: "inline-block",
          },
          "100%": {
            maxHeight: "0",
            opacity: "0",
            transform: "translateY(2px)",
            display: "none",
          },
        },
        showContent: {
          "0%": {
            maxHeight: "0",
            opacity: "0",
            transform: "translateY(-25px)",
            display: "none",
          },
          "100%": {
            maxHeight: "1050px",
            opacity: "1",
            transform: "translateY(0)",
            display: "flex",
          },
        },
        hideContent: {
          "0%": {
            maxHeight: "1050px",
            opacity: "1",
            transform: "translateY(0)",
            display: "flex",
          },
          "100%": {
            maxHeight: "0",
            opacity: "0",
            transform: "translateY(-25px)",
            display: "none",
          },
        },
        slideUp: {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(-5rem)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-5rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        hintExpand: "hintExpand 0.4s ease-out forwards",
        angleLeftRotate: "angleLeftRotate 0.3s ease-out forwards",
        angleLeftRotateClock: "angleLeftRotateClock 0.3s ease-out forwards",
        slideLeft: "slideLeft 0.3s ease-out forwards",
        reverseSlideLeft: "reverseSlideLeft 0.3s ease-out forwards",
        angleUpRotate: "angleUpRotate 0.3s ease-out forwards",
        angleUpRotateClock: "angleUpRotateClock 0.3s ease-out forwards",
        loading: "loading 1.2s ease-in-out infinite",
        forward: "forward 0.3s ease-out forwards",
        backward: "backward 0.3s ease-out forwards",
        iconExpand: "iconExpand 0.3s ease-out forwards",
        iconCollapse: "iconCollapse 0.3s ease-out forwards",
        changeColor: "changeColor 0.3s ease-out forwards",
        slideUp: "slideUp 0.3s ease-out forwards",
        slideDown: "slideDown 0.3s ease-out forwards",
        slideTextUp: "slideTextUp 0.4s ease-in-out forwards",
        angleDownRotateAnti: "angleDownRotateAnti 0.3s ease-out forwards",
        angleDownRotate: "angleDownRotate 0.3s ease-out forwards",
        showLabel: "showLabel 0.4s ease forwards",
        hideLabel: "hideLabel 0.4s ease forwards",
        showContent: "showContent 0.4s ease forwards",
        hideContent: "hideContent 0.4s ease forwards",
        spin: "spin 0.5s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
