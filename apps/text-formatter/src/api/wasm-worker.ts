import { threads } from 'wasm-feature-detect';
import { expose, proxy } from 'comlink';

const loadModule = async () => {
  const isWasmThreadsSupported = await threads();
  let module;
  if (isWasmThreadsSupported) {
    module = await import(
      'text-formatter-rust/pkg-parallel/text_formatter_rust'
    );
    await module.default();
    await module.initThreadPool(navigator.hardwareConcurrency);
  } else {
    module = await import('text-formatter-rust/pkg/text_formatter_rust');
    await module.default();
  }
  return proxy(module);
};

expose({
  module: loadModule(),
});
