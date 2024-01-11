import { wrap } from 'comlink';

const worker = new Worker(new URL('./wasm-worker.ts', import.meta.url));

const RUST_API = wrap<{
  module: Promise<Record<'fix' | 'test', (param: string) => Promise<string>>>;
}>(worker).module;

export interface Config {
  no_space_around_full_width_punctuation: boolean;
  no_space_between_num_dp: boolean;
  space_between_ch_en: boolean;
  uniform_punctuation: boolean;
}

export interface Param {
  config: Config;
  texts: string[];
}

export interface FixResult {
  config: (keyof Config)[];
  result: string[];
}

export interface TestResult {
  config: (keyof Config)[];
  result: Array<Array<[number, number]> | null>[];
}

export const fix = async (param: Param) =>
  JSON.parse(await (await RUST_API).fix(JSON.stringify(param))) as FixResult;

export const test = async (param: Param) =>
  JSON.parse(await (await RUST_API).test(JSON.stringify(param))) as TestResult;
