import { appTools, defineConfig } from '@modern-js/app-tools';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },
  output: {
    copy: [{ from: './node_modules/comlink/dist/umd/comlink.min.js', to: '' }],
  },
  plugins: [appTools()],
});
