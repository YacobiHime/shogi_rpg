import assert from 'node:assert/strict';
import test from 'node:test';

import {
  decodeSaveCode,
  encodeSaveCode,
  formatSaveCode,
  SAVE_CODE_ALPHABET,
} from '../../save/save-code.mjs';

const catalog = {
  formationIds: ['standard', 'mino', 'anaguma'],
  bossIds: ['boss1', 'boss2'],
};
const state = {
  chapter: 5,
  player_level: 12,
  unlocked_formations: ['standard', 'anaguma'],
  defeated_bosses: ['boss1'],
  item_counts: { hint_ticket: 3, undo_ticket: 2 },
  difficulty: 'normal',
};

test('80bitの状態を紛らわしい文字のない16文字で往復変換する', () => {
  const code = encodeSaveCode(state, catalog);
  const restored = decodeSaveCode(code, catalog);

  assert.equal(code.length, 16);
  assert.ok([...code].every((character) => SAVE_CODE_ALPHABET.includes(character)));
  assert.doesNotMatch(code, /[01IO]/);
  assert.deepEqual(restored, {
    version: 1,
    chapter: 5,
    player_level: 12,
    unlocked_formations: ['standard', 'anaguma'],
    defeated_bosses: ['boss1'],
    item_counts: { hint_ticket: 3, undo_ticket: 2 },
    difficulty: 'normal',
  });
});

test('ハイフン・空白・小文字を無視して復元する', () => {
  const formatted = formatSaveCode(encodeSaveCode(state, catalog)).toLowerCase();
  assert.equal(formatted.split('-').length, 4);
  assert.equal(decodeSaveCode(` ${formatted} `, catalog).chapter, 5);
});

test('1文字の入力ミスをチェックサムで検出する', () => {
  const code = encodeSaveCode(state, catalog);
  const replacement = code[4] === '2' ? '3' : '2';
  const mistyped = code.slice(0, 4) + replacement + code.slice(5);

  assert.throws(() => decodeSaveCode(mistyped, catalog), /入力ミス/);
});

test('長さ、使用文字、カタログ上限を検証する', () => {
  assert.throws(() => decodeSaveCode('ABC', catalog), /16文字/);
  assert.throws(() => decodeSaveCode('0000000000000000', catalog), /使用できない文字/);
  assert.throws(
    () => encodeSaveCode(state, {
      ...catalog,
      formationIds: Array.from({ length: 17 }, (_, index) => `f${index}`),
    }),
    /最大16件/,
  );
  assert.throws(() => encodeSaveCode({ ...state, chapter: 64 }, catalog), /1〜63/);
  assert.throws(() => encodeSaveCode({ ...state, player_level: 0 }, catalog), /1〜255/);
});

test('現在のカタログに存在しないビットを含む呪文を拒否する', () => {
  const code = encodeSaveCode(state, catalog);
  assert.throws(
    () => decodeSaveCode(code, { formationIds: ['standard'], bossIds: catalog.bossIds }),
    /存在しない解禁情報/,
  );
});
