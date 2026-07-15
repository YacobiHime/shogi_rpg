import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const mainUrl = new URL('../../rpg/main.mjs', import.meta.url);
const indexUrl = new URL('../../rpg/index.html', import.meta.url);

test('七村RPGの主要画面と対局導線を本編入口へ接続する', async () => {
  const [main, index] = await Promise.all([
    readFile(mainUrl, 'utf8'),
    readFile(indexUrl, 'utf8'),
  ]);
  assert.match(index, /夜古火姫と七つの将棋村/);
  assert.match(main, /loadMatchSetupOptions/);
  assert.match(main, /openMatchFrame/);
  assert.match(main, /applyEncounterVictory/);
  assert.match(main, /data-chest/);
  assert.match(main, /data-quest/);
  assert.match(main, /data-buy/);
  assert.match(main, /encodeSaveCode/);
  assert.match(main, /renderEnding/);
});

test('駒軍勢キャンペーンの進行キーや最終局面継承を参照しない', async () => {
  const main = await readFile(mainUrl, 'utf8');
  assert.doesNotMatch(main, /shogi_rpg_campaign|final_sfen|army|鹵獲|援軍/);
});
