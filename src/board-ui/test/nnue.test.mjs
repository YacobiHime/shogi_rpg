import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveNnuePath } from '../nnue.mjs';

test('nullは内蔵評価関数を表すためパスへ変換しない', () => {
  assert.equal(resolveNnuePath(null), null);
});

test('評価関数ファイル名を配布ディレクトリのURLへ変換する', () => {
  assert.equal(resolveNnuePath('suisho 5.bin'), '../../assets/nnue/suisho%205.bin');
  assert.equal(resolveNnuePath('hao.bin', '/game/nnue'), '/game/nnue/hao.bin');
});

test('ディレクトリを含むファイル名を拒否する', () => {
  assert.throws(() => resolveNnuePath('../nn.bin'), /ディレクトリ/);
  assert.throws(() => resolveNnuePath('eval\\nn.bin'), /ディレクトリ/);
});
