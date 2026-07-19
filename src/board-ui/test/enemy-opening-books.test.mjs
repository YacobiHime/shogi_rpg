import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import shogiLib from '../vendor/shogi.esm.js';
import {
  findEnemyOpeningBook,
  getEnemyOpeningDecision,
  validateEnemyOpeningBooks,
} from '../enemy-opening-books.mjs';

const masterUrl = new URL('../../../data/enemy_openings.json', import.meta.url);
const { Shogi } = shogiLib;

async function loadMaster() {
  return validateEnemyOpeningBooks(JSON.parse(await readFile(masterUrl, 'utf8')));
}

function applyMove(shogi, move) {
  const parsed = /^([1-9])([a-i])([1-9])([a-i])(\+)?$/.exec(move);
  assert.ok(parsed, `テスト用の盤上移動ではありません: ${move}`);
  const rank = (letter) => letter.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
  shogi.move(
    Number(parsed[1]), rank(parsed[2]), Number(parsed[3]), rank(parsed[4]), Boolean(parsed[5])
  );
}

function play(shogi, history, move) {
  applyMove(shogi, move);
  history.push(move);
}

async function playOpening(bookId, blackMoves, whiteMoves) {
  const { books } = await loadMaster();
  const book = findEnemyOpeningBook(books, bookId);
  const shogi = new Shogi();
  const history = [];

  for (let index = 0; index < whiteMoves.length; index += 1) {
    play(shogi, history, blackMoves[index]);
    const decision = getEnemyOpeningDecision(book, shogi.toSFENString(1), history);
    assert.equal(decision.status, 'active', `${bookId} step ${index + 1}`);
    assert.ok(decision.moves.includes(whiteMoves[index]), `${bookId}: ${whiteMoves[index]}`);
    play(shogi, history, whiteMoves[index]);
  }
  return { book, shogi, history };
}

test('各章で使う8種類の敵戦法をマスタから読み込める', async () => {
  const master = await loadMaster();
  assert.deepEqual(master.books.map((book) => book.book_id), [
    'white_bogin',
    'white_shiken_mino',
    'white_closed_shiken',
    'white_kakugawari',
    'white_yokofudori',
    'white_aigakari',
    'white_ibisha',
    'white_shiken_anaguma',
  ]);
  assert.equal(findEnemyOpeningBook(master.books, 'white_bogin').side, 'white');
  assert.equal(findEnemyOpeningBook(master.books, null), null);
});

test('棒銀は同じ8c8dを歩と銀の別stepとして順に指す', async () => {
  const blackMoves = ['7g7f', '6g6f', '5g5f', '4g4f', '3g3f'];
  const whiteMoves = ['8c8d', '8d8e', '7a7b', '7b8c', '8c8d'];
  const { book, shogi, history } = await playOpening('white_bogin', blackMoves, whiteMoves);

  play(shogi, history, '9g9f');
  assert.deepEqual(getEnemyOpeningDecision(book, shogi.toSFENString(1), history), {
    status: 'complete', moves: [],
  });
});

test('四間飛車＋美濃囲いを完成させる', async () => {
  const blackMoves = [
    '7g7f', '6g6f', '5g5f', '4g4f', '3g3f', '9g9f', '1g1f', '8g8f',
  ];
  const whiteMoves = [
    '3c3d', '4c4d', '8b4b', '5a6b', '7a7b', '6b7a', '7a8b', '6a6b',
  ];
  const { book, shogi, history } = await playOpening(
    'white_shiken_mino', blackMoves, whiteMoves
  );

  play(shogi, history, '2g2f');
  const decision = getEnemyOpeningDecision(book, shogi.toSFENString(1), history);
  assert.equal(decision.status, 'constrained');
  assert.equal(decision.reason, 'formation_complete');
});

test('角道を止めた四間飛車を完成させる', async () => {
  const { book, shogi, history } = await playOpening(
    'white_closed_shiken',
    ['7g7f', '6g6f', '5g5f'],
    ['3c3d', '4c4d', '8b4b'],
  );

  play(shogi, history, '4g4f');
  const decision = getEnemyOpeningDecision(book, shogi.toSFENString(1), history);
  assert.equal(decision.status, 'constrained');
  assert.ok(decision.moves.includes('4b4c'));
  assert.ok(!decision.moves.some((move) => /^4b[5-9][a-i]/.test(move)));
});

test('角換わり、横歩取り、相掛かり、汎用居飛車を敵別に誘導する', async () => {
  const scenarios = [
    {
      id: 'white_kakugawari',
      black: ['7g7f', '2g2f', '2f2e', '1g1f'],
      white: ['3c3d', '8c8d', '8d8e', '2b8h+'],
      followup: '7i8h',
    },
    {
      id: 'white_yokofudori',
      black: ['7g7f', '2g2f', '2f2e', '6g6f', '8g8f', '5g5f'],
      white: ['8c8d', '8d8e', '3c3d', '8e8f', '8b8f', '8f7f'],
      followup: '4g4f',
    },
    {
      id: 'white_aigakari',
      black: ['2g2f', '2f2e', '7g7f', '6g6f', '8g8f'],
      white: ['8c8d', '8d8e', '4a3b', '8e8f', '8b8f'],
      followup: '5g5f',
    },
    {
      id: 'white_ibisha',
      black: ['7g7f', '6g6f', '5g5f', '4g4f'],
      white: ['8c8d', '8d8e', '3c3d', '4a3b'],
      followup: '3g3f',
    },
  ];

  for (const scenario of scenarios) {
    const { book, shogi, history } = await playOpening(
      scenario.id, scenario.black, scenario.white
    );
    play(shogi, history, scenario.followup);
    assert.deepEqual(getEnemyOpeningDecision(book, shogi.toSFENString(1), history), {
      status: 'complete', moves: [],
    });
  }
});

test('四間飛車穴熊の完成後も振り飛車側だけを探索する', async () => {
  const { book, shogi, history } = await playOpening(
    'white_shiken_anaguma',
    [
      '7g7f', '2g2f', '6g6f', '5g5f', '4g4f',
      '3g3f', '9g9f', '1g1f', '6i7h', '4i5h',
    ],
    [
      '3c3d', '4c4d', '8b4b', '5a6b', '9a9b',
      '6b7b', '7b8b', '8b9a', '7a8b', '6a7b',
    ],
  );

  play(shogi, history, '8g8f');
  const decision = getEnemyOpeningDecision(book, shogi.toSFENString(1), history);
  assert.equal(decision.status, 'constrained');
  assert.equal(decision.reason, 'formation_complete');
  assert.ok(!decision.moves.some((move) => /^4b[5-9][a-i]/.test(move)));
});

test('定跡が妨害されても、振った後の飛車を居飛車へ戻さない', async () => {
  const { books } = await loadMaster();
  const book = findEnemyOpeningBook(books, 'white_shiken_mino');
  const checked = '4k4/5r3/9/9/9/9/9/4R4/4K4 w - 1';
  const history = ['7g7f', '8b4b'];

  const decision = getEnemyOpeningDecision(book, checked, history);
  assert.equal(decision.status, 'constrained');
  assert.equal(decision.reason, 'no_legal_book_move');
  assert.ok(decision.moves.length > 0);
  assert.ok(!decision.moves.some((move) => /^4b[5-9][a-i]/.test(move)));
});

test('振る前に王手で定跡手が指せなければ通常探索へ戻せる', async () => {
  const { books } = await loadMaster();
  const book = findEnemyOpeningBook(books, 'white_bogin');
  const checked = '4k4/9/9/9/9/9/9/4R4/4K4 w - 1';

  assert.deepEqual(getEnemyOpeningDecision(book, checked, []), {
    status: 'blocked', moves: [], reason: 'no_legal_book_move',
  });
});

test('未知形式、重複ID、不正なUSI指し手・完成条件・制約を拒否する', async () => {
  const master = await loadMaster();
  const first = master.books[0];
  assert.throws(
    () => validateEnemyOpeningBooks({ ...master, version: 2 }), /基本情報/,
  );
  assert.throws(
    () => validateEnemyOpeningBooks({ ...master, books: [first, first] }), /重複/,
  );
  assert.throws(
    () => validateEnemyOpeningBooks({
      ...master, books: [{ ...first, steps: [{ moves: ['invalid'] }] }],
    }),
    /moves/,
  );
  assert.throws(
    () => validateEnemyOpeningBooks({
      ...master, books: [{ ...first, completion: [{ square: '0z', piece: 'R' }] }],
    }),
    /completion/,
  );
  assert.throws(
    () => validateEnemyOpeningBooks({
      ...master,
      books: [{
        ...first,
        constraints: { rook_files: [0, 4], activate_after_move: '8c8d' },
      }],
    }),
    /constraints/,
  );
});
