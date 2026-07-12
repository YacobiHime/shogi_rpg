# データスキーマ定義

実装時に参照するリファレンスとして、各種マスタデータ／セーブデータのJSON構造を定義します。
仕様の詳細な意図は `SPECIFICATION.md` / `SYSTEM_DESIGN.md` を参照してください。

## 1. 敵データ（`data/enemies.json`）

```jsonc
{
  "enemy_id": "chapter1_boss",       // string, 一意
  "name": "村の道場主",               // string, 表示名
  "chapter": 1,                       // number, 登場章
  "nnue_file": "rezero_eval.bin",     // string, 使用評価関数ファイル名（自由配布のみ）
  "think_time_ms": 300,               // number, 基礎思考時間（難易度係数を乗算前の値）
  "node_limit": null,                 // number | null, 探索ノード数上限
  "move_rank": { "min": 1, "max": 1 },// 候補手のうち何番目から選択するか（1=最善手のみ）
  "allowed_openings": ["yagura"],     // string[], 使用可能な戦形ID（formations.jsonのformation_idを参照）
  "handicap": null,                   // string | null, 駒落ち設定（例: "kaku_ochi"）
  "start_sfen_override": null         // string | null, 戦形以外で開始局面を直接指定したい場合
}
```

## 2. 戦形（囲い）データ（`data/formations.json`）

```jsonc
{
  "formation_id": "mino_gakoi",     // string, 一意
  "name": "美濃囲い",                // string
  "side": "player",                  // "player" | "enemy" | "both"
  "start_sfen": "SFEN文字列",        // string, 完成局面のSFEN
  "unlock_level": 3,                 // number, プレイヤーが使用可能になるレベル（enemy側は無視）
  "strong_against": ["yagura"],      // string[], 有利な相手戦形ID
  "weak_against": ["anaguma"]        // string[], 不利な相手戦形ID
}
```

## 3. アイテム／スキルデータ（`data/items.json`）

```jsonc
{
  "item_id": "hint_ticket",         // string, 一意
  "name": "棋神の巻物",              // string, 表示名
  "type": "hint",                    // "hint" | "undo" | "handicap" | "formation_start" |
                                      // "extra_hand_pieces" | "enemy_debuff_time" | "enemy_debuff_rank"
  "unlock_level": 4,                 // number
  "effect_value": 1,                 // number, 効果量（ヒント+1回、思考時間-50%など、typeにより意味が変わる）
  "stackable": true,                 // boolean, 所持数を積み増せるか
  "consumable": true                 // boolean, 対局ごとに消費するか、恒久スキルか
}
```

## 4. レベルアップ／解禁テーブル（`data/level_unlocks.json`）

```jsonc
{
  "level": 5,
  "unlocks": {
    "formations": ["anaguma"],           // string[], formation_id
    "items": ["hint_ticket"],            // string[], item_id
    "skill_upgrades": {
      "undo_max": 1,                      // 待った回数上限の増分
      "hint_max": 0                       // ヒント回数上限の増分
    }
  }
}
```

## 5. 難易度係数テーブル（`data/difficulty.json`）

```jsonc
{
  "easy":   { "think_time_mult": 0.5, "move_rank_max_bonus": 2 },
  "normal": { "think_time_mult": 1.0, "move_rank_max_bonus": 0 },
  "hard":   { "think_time_mult": 1.5, "move_rank_max_bonus": 0 }
}
```

## 6. 対局開始構成（対局UI起動時にティラノスクリプトから渡すパラメータ）

```jsonc
{
  "enemy_id": "chapter1_boss",
  "difficulty": "normal",
  "player_formation": "mino_gakoi",
  "handicap_given_to_enemy": null,
  "hints": { "used": 0, "max": 2 },
  "undo": { "used": 0, "max": 3 },
  "enemy_debuffs_applied": ["think_time_half"]
}
```

## 7. セーブデータ（localStorage、`shogi_rpg_save`キー）

```jsonc
{
  "chapter": 5,
  "player_level": 12,
  "unlocked_formations": ["yagura", "mino_gakoi", "anaguma"],
  "unlocked_items": ["hint_ticket"],
  "defeated_bosses": ["chapter1_boss", "chapter2_boss"],
  "item_counts": { "hint_ticket": 3, "undo_ticket": 2 },
  "difficulty": "normal",
  "updated_at": "2026-07-09T00:00:00Z"
}
```

## 8. 復活の呪文（エンコード対象のビット構造案）

| フィールド | ビット幅 | 備考 |
|---|---|---|
| chapter | 6 bit | 最大63章まで対応 |
| player_level | 8 bit | 最大255レベルまで対応 |
| unlocked_formations | 16 bit | 戦形ごとに1ビットのフラグ |
| defeated_bosses | 32 bit | ボスごとに1ビットのフラグ |
| item_counts.hint | 4 bit | 最大15個まで |
| item_counts.undo | 4 bit | 最大15個まで |
| difficulty | 2 bit | 0=やさしい, 1=ふつう, 2=むずかしい |
| checksum | 8 bit | 上記全体に対する簡易チェックサム |

- 合計 80 bit 程度。Base32相当のエンコードで英数字16文字前後の文字列になる想定
- 実装時は `unlocked_formations` / `defeated_bosses` のビット数を実際のマスタデータ件数に合わせて調整する

## 9. USI通信メッセージ（対局UI ⇔ 将棋AIエンジン）

対局UI・将棋AIエンジン間はUSIプロトコルのテキストコマンドをそのまま利用する。
エンジンは**メインスレッドから直接呼び出す方式**（`docs/CLAUDE.md`参照）で、
`engine.postMessage()` / `engine.addMessageListener()` を介してやり取りする。

```
// 対局UI → エンジン（engine.postMessage）
"usi"
"isready"
"setoption name Threads value 1"
"setoption name EvalFile value rezero_eval.bin"
"position sfen <SFEN> moves <指し手...>"
"go movetime <ms>" もしくは "go nodes <n>"

// エンジン → 対局UI（addMessageListenerのコールバック）
"usiok"
"readyok"
"bestmove <指し手>"
"info depth ... pv ..." （ヒント表示等に利用）
```