import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateEnteringKingDeclaration } from '../entering-king.mjs';

const BLACK = 0;
const WHITE = 1;
const BLACK_POSITION =
  '4K4/PPPPPPPPP/4R4/9/9/9/9/9/4k4 b B2G2S2N2LP 1';
const WHITE_POSITION =
  '4K4/9/9/9/9/9/4r4/ppppppppp/4k4 w b2g2s2n2l 1';

test('先手は28点で入玉宣言できる', () => {
  assert.deepEqual(evaluateEnteringKingDeclaration(BLACK_POSITION, BLACK, false), {
    eligible: true,
    isTurn: true,
    kingInEnemyCamp: true,
    campPieceCount: 10,
    points: 28,
    requiredPoints: 28,
    inCheck: false,
  });
});

test('後手は27点で入玉宣言できる', () => {
  const result = evaluateEnteringKingDeclaration(WHITE_POSITION, WHITE, false);
  assert.equal(result.eligible, true);
  assert.equal(result.points, 27);
  assert.equal(result.requiredPoints, 27);
});

test('成った大駒も5点、小駒は1点として数える', () => {
  const sfen = '4K4/PPPPPPPPP/4+R4/9/9/9/9/9/4k4 b B2G2S2N2LP 1';
  const result = evaluateEnteringKingDeclaration(sfen, BLACK, false);
  assert.equal(result.points, 28);
  assert.equal(result.campPieceCount, 10);
});

test('王手中または相手の手番では宣言できない', () => {
  assert.equal(
    evaluateEnteringKingDeclaration(BLACK_POSITION, BLACK, true).eligible,
    false
  );
  assert.equal(
    evaluateEnteringKingDeclaration(BLACK_POSITION.replace(' b ', ' w '), BLACK, false).eligible,
    false
  );
});

test('敵陣の駒数または点数が不足すると宣言できない', () => {
  const nineCampPieces =
    '4K4/PPPPPPPPP/9/9/9/9/9/9/4k4 b 2R2B2G2S2N2L 1';
  const twentySevenPoints = BLACK_POSITION.replace('B2G2S2N2LP', 'B2G2S2N2L');

  assert.equal(
    evaluateEnteringKingDeclaration(nineCampPieces, BLACK, false).eligible,
    false
  );
  assert.equal(
    evaluateEnteringKingDeclaration(twentySevenPoints, BLACK, false).eligible,
    false
  );
});
