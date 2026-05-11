export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#98e23f",
        "primary-hover": "#7bc230",
        secondary: "#093b40",
        azure: "#093b40",
        accent: "#3b82f6",
        "dark-gray": "#1a1a1a",
        "light-gray": "#f2f2f2",
        success: "#10b981",
        warning: "#facc15",
        error: "#f43f5e",
        text: {
          main: "#f8fafc",
          muted: "#94a3b8",
          dim: "#64748b",
        },
        surface: {
          DEFAULT: "#ffffff",
          light: "#f8fafc",
          secondary: "#f2f2f2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.25rem" }],
        sm: ["0.9375rem", { lineHeight: "1.5rem" }],
        base: ["1.0625rem", { lineHeight: "1.75rem" }],
        lg: ["1.1875rem", { lineHeight: "1.875rem" }],
        xl: ["1.375rem", { lineHeight: "2rem" }],
        "2xl": ["1.625rem", { lineHeight: "2.25rem" }],
      },
      borderRadius: {
        card: "16px",
        "card-lg": "24px",
      },
    },
  },
  plugins: [],
};
