import { expose, proxy } from 'comlink';

const loadModule = async () => {
  const module = await import('text-formatter-rust/pkg/text_formatter_rust');
  await module.default();
  return proxy(module);
};

expose({
  module: loadModule(),
});
