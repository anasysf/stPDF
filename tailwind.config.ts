import catppuccin from '@catppuccin/tailwindcss';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    catppuccin({
      // prefix: 'ctp',
      defaultFlavour: 'frappe',
    }),
  ],
} satisfies Config;
