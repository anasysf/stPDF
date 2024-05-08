import type { Config } from 'tailwindcss';
import catppuccin from '@catppuccin/tailwindcss';

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
