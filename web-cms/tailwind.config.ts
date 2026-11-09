import type { Config } from 'tailwindcss';
import baseConfig from '../frontend/tailwind.config';

const config: Config = {
  ...baseConfig,
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../frontend/src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

export default config;
