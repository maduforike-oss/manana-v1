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
				
				/* Manana Brand Colors */
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					glow: 'hsl(var(--secondary-glow))',
					light: 'hsl(var(--secondary-light))',
					dark: 'hsl(var(--secondary-dark))'
				},
				
				/* Text Colors */
				text: {
					dark: 'hsl(var(--text-dark))',
					light: 'hsl(var(--text-light))',
					muted: 'hsl(var(--text-muted))',
					subtle: 'hsl(var(--text-subtle))'
				},
				
				/* Surface Colors */
				surface: {
					DEFAULT: 'hsl(var(--surface))',
					elevated: 'hsl(var(--surface-elevated))',
					subtle: 'hsl(var(--surface-subtle))',
					muted: 'hsl(var(--surface-muted))'
				},
				
				/* Glass Effects */
				glass: {
					light: 'hsl(var(--glass-light))',
					medium: 'hsl(var(--glass-medium))',
					strong: 'hsl(var(--glass-strong))',
					border: 'hsl(var(--glass-border))'
				},
				
				/* Legacy Support */
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
				
				/* Brand Legacy */
				brand: {
					pink: 'hsl(var(--primary))'
				}
			},
			borderRadius: {
				'sm': 'var(--radius-sm)',
				DEFAULT: 'var(--radius)',
				'md': 'var(--radius-md)',
				'lg': 'var(--radius-lg)',
				'xl': 'var(--radius-xl)',
				'full': 'var(--radius-full)'
			},
			spacing: {
				'xs': '0.25rem',
				'sm': '0.5rem',
				'md': '1rem',
				'lg': '1.5rem',
				'xl': '2rem',
				'2xl': '3rem',
				'3xl': '4rem',
				'4xl': '6rem',
				'5xl': '8rem'
			},
			backdropBlur: {
				'xs': '2px',
				'sm': '4px',
				DEFAULT: '8px',
				'md': '12px',
				'lg': '16px',
				'xl': '24px',
				'2xl': '40px',
				'3xl': '64px'
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
				'glass': 'var(--shadow-glass)',
				'brand': 'var(--shadow-brand)',
				'secondary': 'var(--shadow-secondary)',
				'subtle': 'var(--shadow-subtle)',
				'elevated': 'var(--shadow-elevated)',
				'studio': 'var(--shadow-studio)',
				'neon': 'var(--shadow-neon)',
				'panel': 'var(--shadow-panel)',
				'tool': 'var(--shadow-tool)'
			},
			transitionTimingFunction: {
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
