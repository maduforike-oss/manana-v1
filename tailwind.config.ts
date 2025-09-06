import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					glow: 'hsl(var(--secondary-glow))'
				},
				workspace: {
					DEFAULT: 'hsl(var(--workspace))',
					foreground: 'hsl(var(--workspace-foreground))',
					border: 'hsl(var(--workspace-border))'
				},
				studio: {
					bg: 'hsl(var(--studio-bg))',
					surface: 'hsl(var(--studio-surface))',
					'surface-elevated': 'hsl(var(--studio-surface-elevated))',
					border: 'hsl(var(--studio-border))',
					glow: 'hsl(var(--studio-glow))',
					'accent-cyan': 'hsl(var(--studio-accent-cyan))',
					'accent-purple': 'hsl(var(--studio-accent-purple))',
					'accent-orange': 'hsl(var(--studio-accent-orange))'
				},
				manana: {
					sage: 'hsl(var(--manana-sage))',
					'sage-light': 'hsl(var(--manana-sage-light))',
					'sage-dark': 'hsl(var(--manana-sage-dark))',
					cream: 'hsl(var(--manana-cream))',
					charcoal: 'hsl(var(--manana-charcoal))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				brand: {
					pink: "#FF2D75"
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-from-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-in-from-left': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-4px)' }
				},
				'pulse-neon': {
					'0%, 100%': { boxShadow: '0 0 5px hsl(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.6), 0 0 40px hsl(var(--primary) / 0.3)' }
				},
				'rotate-gradient': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in-from-right-4': 'slide-in-from-right 0.3s ease-out',
				'slide-in-from-left-2': 'slide-in-from-left 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
				'rotate-gradient': 'rotate-gradient 8s ease-in-out infinite'
			},
			boxShadow: {
				'studio': 'var(--shadow-studio)',
				'neon': 'var(--shadow-neon)',
				'panel': 'var(--shadow-panel)',
				'tool': 'var(--shadow-tool)',
				'fashion': 'var(--shadow-fashion)',
				'editorial': 'var(--shadow-editorial)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
