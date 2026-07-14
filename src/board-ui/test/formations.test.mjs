import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { loadFormation, validateFormations } from '../formations.mjs';

const formationsUrl = new URL('../../../data/formations.json', import.meta.url);

test('formations.jsonの平手戦形を読み込める', async () => {
  const data = JSON.parse(await readFile(formationsUrl, 'utf8'));
  const formations = validateFormations(data);

  assert.equal(formations[0].formation_id, 'standard');
  assert.equal(
    formations[0].start_sfen,
    'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1'
  );
});

test('指定した戦形を取得できる', async () => {
  const formation = await loadFormation('standard', {
    fetchImpl: async () => ({
      ok: true,
      json: async () => JSON.parse(await readFile(formationsUrl, 'utf8')),
    }),
  });

  assert.equal(formation.name, '平手');
});

test('重複IDと未定義の相性参照を拒否する', () => {
  const base = {
    formation_id: 'standard',
    name: '平手',
    side: 'both',
    start_sfen: '9/9/9/9/9/9/9/9/9 b - 1',
    unlock_level: 1,
    strong_against: [],
    weak_against: [],
  };

  assert.throws(() => validateFormations([base, { ...base }]), /重複/);
  assert.throws(
    () => validateFormations([{ ...base, strong_against: ['missing'] }]),
    /未定義/
  );
});

test('存在しない戦形IDを明確なエラーにする', async () => {
  await assert.rejects(
    loadFormation('missing', {
      fetchImpl: async () => ({ ok: true, json: async () => [{
        formation_id: 'standard',
        name: '平手',
        side: 'both',
        start_sfen: '9/9/9/9/9/9/9/9/9 b - 1',
        unlock_level: 1,
        strong_against: [],
        weak_against: [],
      }] }),
    }),
    /見つかりません/
  );
});
