import { appTools, defineConfig } from '@modern-js/app-tools';
import { tailwindcssPlugin } from '@modern-js/plugin-tailwindcss';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },
  source: {
    mainEntryName: 'index',
  },
  output: {
    distPath: {
      html: '',
      root: '../../deploy/text-formatter',
    },
  },
  html: {
    disableHtmlFolder: true,
  },
  plugins: [appTools(), tailwindcssPlugin()],
});
