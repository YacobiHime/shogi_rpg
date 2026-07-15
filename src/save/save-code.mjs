import { SAVE_VERSION } from './save-state.mjs';

export const SAVE_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIFFICULTIES = ['easy', 'normal', 'hard'];
const PAYLOAD_BYTES = 9;
const CODE_LENGTH = 16;

export class SaveCodeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SaveCodeError';
  }
}

function crc8(bytes) {
  let crc = 0;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

function toBytes(value, length) {
  const bytes = new Uint8Array(length);
  let remaining = value;
  for (let index = length - 1; index >= 0; index -= 1) {
    bytes[index] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }
  return bytes;
}

function append(value, field, width) {
  return (value << BigInt(width)) | BigInt(field);
}

function makeMask(selectedIds, catalog, max, field) {
  if (catalog.length > max) throw new SaveCodeError(`${field}は最大${max}件までです`);
  const selected = new Set(selectedIds);
  let mask = 0n;
  catalog.forEach((id, index) => {
    if (selected.has(id)) mask |= 1n << BigInt(index);
  });
  for (const id of selected) {
    if (!catalog.includes(id)) throw new SaveCodeError(`${field}に未知のIDがあります: ${id}`);
  }
  return mask;
}

function encodeBase32(value) {
  let result = '';
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    const shift = BigInt((CODE_LENGTH - index - 1) * 5);
    result += SAVE_CODE_ALPHABET[Number((value >> shift) & 31n)];
  }
  return result;
}

function decodeBase32(code) {
  let value = 0n;
  for (const character of code) {
    const digit = SAVE_CODE_ALPHABET.indexOf(character);
    if (digit < 0) throw new SaveCodeError(`使用できない文字が含まれています: ${character}`);
    value = (value << 5n) | BigInt(digit);
  }
  return value;
}

export function formatSaveCode(code) {
  return code.match(/.{1,4}/g)?.join('-') || '';
}

/** 進行状態を16文字の復活の呪文へ変換する。 */
export function encodeSaveCode(state, catalog) {
  if (!Number.isInteger(state.chapter) || state.chapter < 1 || state.chapter > 63) {
    throw new SaveCodeError('chapterは1〜63の整数にしてください');
  }
  if (!Number.isInteger(state.player_level)
    || state.player_level < 1 || state.player_level > 255) {
    throw new SaveCodeError('player_levelは1〜255の整数にしてください');
  }
  const difficulty = DIFFICULTIES.indexOf(state.difficulty);
  if (difficulty < 0) throw new SaveCodeError('難易度を復活の呪文へ変換できません');
  const formationMask = makeMask(
    state.unlocked_formations, catalog.formationIds, 16, 'unlocked_formations'
  );
  const bossMask = makeMask(
    state.defeated_bosses, catalog.bossIds, 32, 'defeated_bosses'
  );
  const hintCount = state.item_counts.hint_ticket || 0;
  const undoCount = state.item_counts.undo_ticket || 0;
  if (![hintCount, undoCount].every((count) => Number.isInteger(count) && count >= 0 && count <= 15)) {
    throw new SaveCodeError('ヒントと待ったの所持数は0〜15にしてください');
  }

  let payload = 0n;
  payload = append(payload, state.chapter, 6);
  payload = append(payload, state.player_level, 8);
  payload = append(payload, formationMask, 16);
  payload = append(payload, bossMask, 32);
  payload = append(payload, hintCount, 4);
  payload = append(payload, undoCount, 4);
  payload = append(payload, difficulty, 2);
  const checksum = crc8(toBytes(payload, PAYLOAD_BYTES));
  return encodeBase32((payload << 8n) | BigInt(checksum));
}

/** 復活の呪文を検証して、保存可能な進行状態へ戻す。 */
export function decodeSaveCode(input, catalog) {
  if (catalog.formationIds.length > 16) {
    throw new SaveCodeError('unlocked_formationsは最大16件までです');
  }
  if (catalog.bossIds.length > 32) {
    throw new SaveCodeError('defeated_bossesは最大32件までです');
  }
  const code = String(input).toUpperCase().replace(/[\s-]/g, '');
  if (code.length !== CODE_LENGTH) {
    throw new SaveCodeError(`復活の呪文は${CODE_LENGTH}文字です`);
  }
  const packed = decodeBase32(code);
  const payload = packed >> 8n;
  const actualChecksum = Number(packed & 0xffn);
  if (crc8(toBytes(payload, PAYLOAD_BYTES)) !== actualChecksum) {
    throw new SaveCodeError('復活の呪文が一致しません。入力ミスがないか確認してください');
  }

  let remainingBits = 72;
  const take = (width) => {
    remainingBits -= width;
    return Number((payload >> BigInt(remainingBits)) & ((1n << BigInt(width)) - 1n));
  };
  const chapter = take(6);
  const playerLevel = take(8);
  const formationMask = take(16);
  const bossMask = take(32);
  const hintCount = take(4);
  const undoCount = take(4);
  const difficulty = DIFFICULTIES[take(2)];
  if (chapter < 1 || playerLevel < 1 || !difficulty) {
    throw new SaveCodeError('復活の呪文に不正な進行状態が含まれています');
  }
  if (formationMask >= 2 ** catalog.formationIds.length
    || bossMask >= 2 ** catalog.bossIds.length) {
    throw new SaveCodeError('現在のマスタに存在しない解禁情報が含まれています');
  }
  const idsFromMask = (mask, ids) => ids.filter(
    (id, index) => Math.floor(mask / (2 ** index)) % 2 === 1
  );
  return {
    version: SAVE_VERSION,
    chapter,
    player_level: playerLevel,
    unlocked_formations: idsFromMask(formationMask, catalog.formationIds),
    defeated_bosses: idsFromMask(bossMask, catalog.bossIds),
    item_counts: { hint_ticket: hintCount, undo_ticket: undoCount },
    difficulty,
  };
}
