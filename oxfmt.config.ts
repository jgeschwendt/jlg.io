import { defineConfig } from '@jlg/oxfmt';
import { existsSync } from 'node:fs';

// oxfmt silently skips tailwind class sorting when this path is wrong; fail instead
const stylesheet = './src/app/global.css';
if (!existsSync(new URL(stylesheet, import.meta.url))) {
  throw new Error(`oxfmt.config.ts: tailwind stylesheet ${stylesheet} not found`);
}

// ※ format-policy
export default defineConfig({
  ignorePatterns: ['.stele/**', 'public/background/**'],
  sortTailwindcss: {
    stylesheet,
  },
});
