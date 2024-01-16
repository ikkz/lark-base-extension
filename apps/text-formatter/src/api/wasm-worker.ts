import { expose, proxy } from 'comlink';
import init, { test, fix } from 'text-formatter-rust/pkg/text_formatter_rust';

const loadModule = async () => {
  await init();
  return proxy({
    test,
    fix,
  });
};

expose({
  module: loadModule(),
});
