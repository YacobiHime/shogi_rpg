import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ENGINE_PROFILES,
  loadEngineFactories,
  loadEngineFactory,
} from '../engine-loader.mjs';

function loaderEnvironment(factories = {}) {
  const appended = [];
  const globalObject = {};
  const documentObject = {
    createElement: () => ({}),
    head: {
      appendChild(script) {
        appended.push(script.src);
        const profile = Object.values(ENGINE_PROFILES).find(
          ({ scriptPath }) => scriptPath === script.src
        );
        if (profile && factories[profile.globalName]) {
          globalObject[profile.globalName] = factories[profile.globalName];
          queueMicrotask(script.onload);
        } else {
          queueMicrotask(script.onerror);
        }
      },
    },
  };
  return { appended, documentObject, globalObject };
}

test('NNUE未指定時は内蔵評価版だけを読み込む', async () => {
  const builtin = async () => {};
  const environment = loaderEnvironment({ YaneuraOu: builtin });

  const result = await loadEngineFactories(null, environment);

  assert.equal(result.factory, builtin);
  assert.equal(result.fallbackFactory, null);
  assert.equal(result.useNnue, false);
  assert.deepEqual(environment.appended, ['./vendor/yaneuraou.js']);
});

test('NNUE指定時はHalfKP noeval版とフォールバック用内蔵評価版を読み込む', async () => {
  const builtin = async () => {};
  const halfkp = async () => {};
  const environment = loaderEnvironment({
    YaneuraOu: builtin,
    YaneuraOu_HalfKP_noeval: halfkp,
  });

  const result = await loadEngineFactories('../../assets/nnue/hao.bin', environment);

  assert.equal(result.factory, halfkp);
  assert.equal(result.fallbackFactory, builtin);
  assert.equal(result.useNnue, true);
  assert.deepEqual(environment.appended, [
    './vendor/yaneuraou.js',
    './vendor/yaneuraou.halfkp.noeval.js',
  ]);
});

test('HalfKPローダーを取得できない場合は内蔵評価版へフォールバックする', async () => {
  const builtin = async () => {};
  const environment = loaderEnvironment({ YaneuraOu: builtin });
  let fallback;

  const result = await loadEngineFactories('../../assets/nnue/missing.bin', {
    ...environment,
    onFallback: (details) => { fallback = details; },
  });

  assert.equal(result.factory, builtin);
  assert.equal(result.fallbackFactory, null);
  assert.equal(result.useNnue, false);
  assert.equal(fallback.stage, 'loader');
});

test('既に公開済みのファクトリはscriptを追加せず再利用する', async () => {
  const builtin = async () => {};
  const environment = loaderEnvironment();
  environment.globalObject.YaneuraOu = builtin;

  assert.equal(await loadEngineFactory('builtin', environment), builtin);
  assert.deepEqual(environment.appended, []);
});
