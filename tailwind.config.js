/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
      colors: {
        primary: "#6F0B14",
        textAndTab: "#6F0B14",
        hintText: "#A29EB6",
        button: "#6F0B14",
        checkbox: "#6F0B14",
        lightBackground: "rgba(111, 11, 20, 0.09)",
        trackSelect: "rgba(111, 11, 20, 0.44)",
        darkTrackSelect: "rgba(111, 11, 20, 0.61)",
        success: "#008000",
        pending: "#DBA400",
        reschedule: "#E86100",
        reject: "#B31B1B",
        black: "#000000",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
