import type { Config } from "tailwindcss";


const config: Config = {
    darkMode: ["class"],
		content: [
			"./src/pages/**/*.{js,ts,jsx,tsx,mdx,css}",
			"./src/components/**/*.{js,ts,jsx,tsx,mdx,css}",
			"./src/app/**/*.{js,ts,jsx,tsx,mdx,css}",
			"./components/**/*.{js,ts,jsx,tsx,css}"  // 최상위 경로에 있는 components/ui 포함
		],
		theme: {
        	extend: {
        		colors: {
        			primary: {
        				DEFAULT: 'hsl(var(--primary))',
        				foreground: 'hsl(var(--primary-foreground))'
        			},
        			secondary: {
        				DEFAULT: 'hsl(var(--secondary))',
        				foreground: 'hsl(var(--secondary-foreground))'
        			},
        			accent: {
        				DEFAULT: 'hsl(var(--accent))',
        				foreground: 'hsl(var(--accent-foreground))'
        			},
        			background: 'hsl(var(--background))',
        			text: 'var(--text-color)',
        			'text-light': 'var(--text-light-color)',
        			border: 'hsl(var(--border))',
        			foreground: 'hsl(var(--foreground))',
        			card: {
        				DEFAULT: 'hsl(var(--card))',
        				foreground: 'hsl(var(--card-foreground))'
        			},
        			popover: {
        				DEFAULT: 'hsl(var(--popover))',
        				foreground: 'hsl(var(--popover-foreground))'
        			},
        			muted: {
        				DEFAULT: 'hsl(var(--muted))',
        				foreground: 'hsl(var(--muted-foreground))'
        			},
        			destructive: {
        				DEFAULT: 'hsl(var(--destructive))',
        				foreground: 'hsl(var(--destructive-foreground))'
        			},
        			warning: {
        				DEFAULT: 'hsl(var(--warning))',
        				foreground: 'hsl(var(--warning-foreground))'
        			},
							success: {
								DEFAULT: 'hsl(var(--success))',
								foreground: 'hsl(var(--success-foreground))'
							},
        			input: 'hsl(var(--input))',
        			ring: 'hsl(var(--ring))',
        			chart: {
        				'1': 'hsl(var(--chart-1))',
        				'2': 'hsl(var(--chart-2))',
        				'3': 'hsl(var(--chart-3))',
        				'4': 'hsl(var(--chart-4))',
        				'5': 'hsl(var(--chart-5))'
        			}
        		},
        		borderRadius: {
        			lg: 'var(--radius)',
        			md: 'calc(var(--radius) - 2px)',
        			sm: 'calc(var(--radius) - 4px)'
        		},
        		lineHeight: {
        			'10': 'var(--leading-10)'
        		}
        	}
        },
		mode: 'jit',
		module: {
			rules: [
				{
					test: /\.css$/,
					use: [
						'style-loader',
						'css-loader',
					],
				},
			],
		},
  plugins: [require("tailwindcss-animate")],
};
export default config;
