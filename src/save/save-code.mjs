export const SAVE_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

const DIFFICULTIES = ['easy', 'normal', 'hard'];
const LEGACY_PAYLOAD_BYTES = 9;
const LEGACY_CODE_LENGTH = 16;
const V2_PREFIX = 'SR2-';

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

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
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

function encodeLegacyBase32(value) {
  let result = '';
  for (let index = 0; index < LEGACY_CODE_LENGTH; index += 1) {
    const shift = BigInt((LEGACY_CODE_LENGTH - index - 1) * 5);
    result += SAVE_CODE_ALPHABET[Number((value >> shift) & 31n)];
  }
  return result;
}

function decodeLegacyBase32(code) {
  let value = 0n;
  for (const character of code) {
    const digit = SAVE_CODE_ALPHABET.indexOf(character);
    if (digit < 0) throw new SaveCodeError(`使用できない文字が含まれています: ${character}`);
    value = (value << 5n) | BigInt(digit);
  }
  return value;
}

function encodeBytesBase32(bytes) {
  let result = '';
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += SAVE_CODE_ALPHABET[(buffer >>> bits) & 31];
      buffer &= (1 << bits) - 1;
    }
  }
  if (bits > 0) result += SAVE_CODE_ALPHABET[(buffer << (5 - bits)) & 31];
  return result;
}

function decodeBytesBase32(code) {
  const bytes = [];
  let buffer = 0;
  let bits = 0;
  for (const character of code) {
    const digit = SAVE_CODE_ALPHABET.indexOf(character);
    if (digit < 0) throw new SaveCodeError(`使用できない文字が含まれています: ${character}`);
    buffer = (buffer << 5) | digit;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >>> bits) & 0xff);
      buffer &= (1 << bits) - 1;
    }
  }
  if (bits > 0 && buffer !== 0) {
    throw new SaveCodeError('復活の呪文の末尾が壊れています');
  }
  return new Uint8Array(bytes);
}

function compactState(state) {
  return {
    v: 2,
    p: state.profile_created ? 1 : 0,
    n: state.player_name,
    s: state.name_suffix,
    c: state.chapter,
    o: state.current_location,
    l: state.player_level,
    x: state.experience,
    g: state.currency,
    f: state.unlocked_formations,
    i: state.unlocked_items,
    e: state.defeated_enemies,
    b: state.unlocked_books,
    h: state.opened_chests,
    t: state.completed_tutorials,
    q: state.quest_states,
    k: state.item_counts,
    a: state.equipped_item,
    d: state.difficulty,
  };
}

function expandState(value) {
  if (!value || typeof value !== 'object' || value.v !== 2) {
    throw new SaveCodeError('未対応の復活の呪文です');
  }
  return {
    version: 2,
    profile_created: value.p === 1,
    player_name: value.n,
    name_suffix: value.s,
    chapter: value.c,
    current_location: value.o,
    player_level: value.l,
    experience: value.x,
    currency: value.g,
    unlocked_formations: value.f,
    unlocked_items: value.i,
    defeated_enemies: value.e,
    unlocked_books: value.b,
    opened_chests: value.h,
    completed_tutorials: value.t,
    quest_states: value.q,
    item_counts: value.k,
    equipped_item: value.a,
    difficulty: value.d,
  };
}

function encodeVersion2(state) {
  const payload = new TextEncoder().encode(JSON.stringify(compactState(state)));
  const checksum = crc32(payload);
  const packed = new Uint8Array(payload.length + 4);
  packed.set(payload);
  packed[payload.length] = checksum >>> 24;
  packed[payload.length + 1] = checksum >>> 16;
  packed[payload.length + 2] = checksum >>> 8;
  packed[payload.length + 3] = checksum;
  return V2_PREFIX + encodeBytesBase32(packed);
}

function decodeVersion2(input) {
  const normalized = String(input).toUpperCase().replace(/[\s-]/g, '');
  if (!normalized.startsWith('SR2')) throw new SaveCodeError('復活の呪文の版を判別できません');
  const bytes = decodeBytesBase32(normalized.slice(3));
  if (bytes.length < 6) throw new SaveCodeError('復活の呪文が短すぎます');
  const payload = bytes.slice(0, -4);
  const expected = (
    (bytes.at(-4) * 0x1000000)
    + (bytes.at(-3) << 16)
    + (bytes.at(-2) << 8)
    + bytes.at(-1)
  ) >>> 0;
  if (crc32(payload) !== expected) {
    throw new SaveCodeError('復活の呪文が一致しません。入力ミスがないか確認してください');
  }
  try {
    return expandState(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(payload)));
  } catch (error) {
    if (error instanceof SaveCodeError) throw error;
    throw new SaveCodeError('復活の呪文の内容を読み取れません');
  }
}

function decodeLegacy(input, catalog) {
  if (catalog.formationIds.length > 16) {
    throw new SaveCodeError('unlocked_formationsは最大16件までです');
  }
  if (catalog.bossIds.length > 32) {
    throw new SaveCodeError('defeated_bossesは最大32件までです');
  }
  const code = String(input).toUpperCase().replace(/[\s-]/g, '');
  if (code.length !== LEGACY_CODE_LENGTH) {
    throw new SaveCodeError(`復活の呪文は${LEGACY_CODE_LENGTH}文字です`);
  }
  const packed = decodeLegacyBase32(code);
  const payload = packed >> 8n;
  const actualChecksum = Number(packed & 0xffn);
  if (crc8(toBytes(payload, LEGACY_PAYLOAD_BYTES)) !== actualChecksum) {
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
    version: 1,
    chapter,
    player_level: playerLevel,
    unlocked_formations: idsFromMask(formationMask, catalog.formationIds),
    defeated_bosses: idsFromMask(bossMask, catalog.bossIds),
    item_counts: { hint_ticket: hintCount, undo_ticket: undoCount },
    difficulty,
  };
}

/** 表示用に復活の呪文を区切る。 */
export function formatSaveCode(code) {
  if (String(code).startsWith(V2_PREFIX)) {
    const payload = String(code).slice(V2_PREFIX.length).replace(/-/g, '');
    return V2_PREFIX + (payload.match(/.{1,5}/g)?.join('-') || '');
  }
  return String(code).match(/.{1,4}/g)?.join('-') || '';
}

/** 現行進行状態をversion 2の可変長復活の呪文へ変換する。 */
export function encodeSaveCode(state, catalog) {
  if (state?.version === 2) return encodeVersion2(state);
  // version 1時代の呼び出し元を壊さず、既存の16文字形式を発行する。
  // 製品版本編のUIはversion 2だけを渡すため、通常はSR2形式になる。
  return encodeLegacySaveCode(state, catalog);
}

/** version 2または旧16文字形式を検証し、保存可能な進行状態へ戻す。 */
export function decodeSaveCode(input, catalog = { formationIds: [], bossIds: [] }) {
  const normalized = String(input).trim().toUpperCase();
  if (normalized.replace(/[\s-]/g, '').startsWith('SR2')) {
    return decodeVersion2(normalized);
  }
  return decodeLegacy(normalized, catalog);
}

/** 旧形式の互換テストと移行確認専用。新規UIからは使用しない。 */
export function encodeLegacySaveCode(state, catalog) {
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
    state.unlocked_formations,
    catalog.formationIds,
    16,
    'unlocked_formations',
  );
  const bossMask = makeMask(
    state.defeated_bosses,
    catalog.bossIds,
    32,
    'defeated_bosses',
  );
  const hintCount = state.item_counts.hint_ticket || 0;
  const undoCount = state.item_counts.undo_ticket || 0;
  if (![hintCount, undoCount].every(
    (count) => Number.isInteger(count) && count >= 0 && count <= 15
  )) {
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
  const checksum = crc8(toBytes(payload, LEGACY_PAYLOAD_BYTES));
  return encodeLegacyBase32((payload << 8n) | BigInt(checksum));
}
