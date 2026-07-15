---
name: shogi-data-entry
description: 敵（enemies.json）・戦形（formations.json）・アイテム（items.json）・レベル解禁テーブル（level_unlocks.json）などのマスタデータを新規追加/編集する際に使用する。「敵を追加して」「新しい戦形を登録して」「アイテムのデータを作って」等の依頼で発動する。
title: 将棋RPG マスタデータ追加スキル
layout: default
nav_order: 12
---

# 将棋RPG マスタデータ追加スキル

`data/` 配下のマスタデータ（敵・戦形・アイテム・レベル解禁テーブル）を追加・編集する際は、
必ず `docs/DATA_SCHEMA.md` に定義されたスキーマに厳密に従うこと。

## 手順

1. **必ず `docs/DATA_SCHEMA.md` を読む**。スキーマが更新されている可能性があるため、
   記憶を頼りにせずファイルを直接確認する。
2. 追加/編集対象に応じて、以下のファイルを編集する。
   - 敵データ → `data/enemies.json`
   - 戦形データ → `data/formations.json`
   - アイテム/スキルデータ → `data/items.json`
   - レベル解禁テーブル → `data/level_unlocks.json`
3. `enemy_id` / `formation_id` / `item_id` は既存データと重複しない一意な文字列にする
   （命名は英語スネークケース、例: `chapter3_boss`, `anaguma_gakoi`, `hint_ticket_lv2`）。
4. 戦形データを追加する場合、`start_sfen` は実際に正しい局面のSFENでなければならない。
   SFENが不明な場合は、開発者に確認するか `docs/GLOSSARY.md` の将棋用語を参照しつつ
   「SFEN不明のため要確認」と明示したプレースホルダーを入れ、TODOコメントを残す。
   **架空のSFENを推測で埋めない。**
5. 敵の強さパラメータ（`max_think_time_ms` / `node_limit` / `move_rank`）を設定する際は、
   `docs/PROJECT_PLAN.md` のマイルストーン（敵の強さ制御システム）や既存の敵データとの
   相対的なバランスを参考にする。極端な値（例: 0ms、無制限ノード数）は避ける。
6. NNUE評価関数ファイル（`nnue_file`）を指定する場合、`docs/ASSETS_CREDITS.md` に
   記載されている自由配布のファイルのみを指定する。記載のないファイル名を新規に使う場合は、
   先にライセンスを確認する必要がある旨を利用者に伝える。
   **特に振電3（Shinden3）は開発者への利用許諾確認待ちのため、`nnue_file`に指定してはならない。**
   現時点で敵データに指定してよい評価関数は「水匠5」「Hao（Háo）」「リゼロ評価関数」の3種のみ。
7. 編集後、以下を必ず行う。
   - JSONとして valid であることを確認する（構文チェック）
   - `docs/CHANGELOG.md` の `[Unreleased]` セクションに追加内容を1行で記録する
   - 戦形の相性（`strong_against` / `weak_against`）を設定した場合、対になる戦形側の
     データとの整合性（矛盾がないか）も確認する

## 注意事項

- このスキルはデータファイルの追加・編集のみを対象とする。エンジン組み込みコード
  （`src/engine` 等）の変更が必要な場合は、それを明示した上でユーザーに確認する。
- 一度に大量のデータを生成する依頼であっても、SFENや強さパラメータなど検証が必要な値は
  「仮の値」であることを明示する。将棋的に不正確な情報を断定的に記載しない。
