import {
  createDefaultSave,
  normalizeSaveState,
  SAVE_KEY,
  touchSaveState,
} from './save-state.mjs';

/** localStorageを読み、未作成または破損時は安全な初期値を返す。 */
export function loadSaveState(storage, context, options = {}) {
  const fallback = () => createDefaultSave(context, options);
  let serialized;
  try {
    serialized = storage.getItem(SAVE_KEY);
  } catch (error) {
    return { state: fallback(), source: 'default', warning: 'セーブ領域を読み込めませんでした。' };
  }
  if (serialized === null) return { state: fallback(), source: 'default', warning: null };
  try {
    return {
      state: normalizeSaveState(JSON.parse(serialized), context, options),
      source: 'storage',
      warning: null,
    };
  } catch (error) {
    return {
      state: fallback(),
      source: 'recovered',
      warning: `保存データが壊れていたため初期状態で復旧しました（${error.message}）`,
    };
  }
}

/** 更新日時を付けてlocalStorageへ保存する。 */
export function saveSaveState(storage, state, now = new Date()) {
  const saved = touchSaveState(state, now);
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(saved));
  } catch (error) {
    throw new Error('セーブデータを保存できませんでした', { cause: error });
  }
  return saved;
}
