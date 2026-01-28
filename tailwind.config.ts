import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        /* PDV brand tokens */
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          violet: "hsl(var(--brand-violet))",
        },

        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },

        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
        "pop": {
          "0%": { transform: "scale(0.98)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },

        blink: {
          "0%, 88%, 100%": { transform: "scaleY(1)" },
          "92%": { transform: "scaleY(0.08)" },
        },
        "slide-in-bottom": {
          "0%": {
            transform: "translateX(-50%) translateY(100%)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(-50%) translateY(0)",
            opacity: "1"
          },
        },
        "slide-in-bottom-scaled": {
          "0%": {
            transform: "translateX(-50%) translateY(100%) scale(0.86)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(-50%) translateY(0) scale(0.86)",
            opacity: "1"
          },
        },

        // Versão SEM translateX (para elementos já centralizados via flex/grid)
        "slide-in-bottom-scaled-centered": {
          "0%": {
            transform: "translateY(100%) scale(0.86)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0) scale(0.86)",
            opacity: "1",
          },
        },

        // Mascote bounce (não usa translateX para não conflitar com transforms do layout)
        "mascot-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "18%": { transform: "translateY(-14px)" },
          "40%": { transform: "translateY(0)" },
          "62%": { transform: "translateY(-8px)" },
          "78%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-y": "float-y 3.2s ease-in-out infinite",
        "wiggle": "wiggle 2.4s ease-in-out infinite",
        "pop": "pop 180ms ease-out",
        blink: "blink 900ms ease-in-out",
        "slide-in-bottom": "slide-in-bottom 600ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-bottom-scaled": "slide-in-bottom-scaled 600ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-bottom-scaled-centered":
          "slide-in-bottom-scaled-centered 600ms cubic-bezier(0.16, 1, 0.3, 1)",

        "mascot-bounce": "mascot-bounce 1.9s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
