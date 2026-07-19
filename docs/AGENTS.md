---
title: AIエージェント向け作業ガイド
layout: default
nav_order: 11
---

# AGENTS.md

この文書は、本リポジトリで作業するAIエージェントの標準手順である。
**通常はこのファイルと [PROJECT_PLAN.md](./PROJECT_PLAN.md) だけを最初に読む。**
詳細資料は下表に該当する変更を行うときだけ読むこと。

## 1. 最初に行うこと

1. `git status --short`で既存変更を確認し、ユーザーの変更を上書きしない。
2. `docs/PROJECT_PLAN.md`で現在のマイルストーン、次の作業、完了条件を確認する。
3. 対象コードと近接テストを検索してから、最小範囲を変更する。
4. 変更に対応するテストを実行し、必要な文書を同じ変更内で更新する。

指示の優先順位は、ユーザーの依頼 > このファイル > `PROJECT_PLAN.md` > 対象機能の詳細文書・既存コード。
仕様と実装が食い違う場合は推測で広げず、現在のテストとユーザー意図を確認する。

## 2. プロジェクトの不変条件

- 将棋をコアバトルにしたブラウザRPG。PC版Chromeが必須、スマートフォンは努力目標。
- 本番はFirebase Hosting上の**静的アプリ**。AI思考、ルール、セーブをすべてブラウザ内で完結させ、サーバー処理を追加しない。
- 対局UIはJavaScript ES Modules、インデント2スペース。盤面表現はSFEN、指し手はUSIを使う。
- YaneuraOu.wasmはブラウザのメインスレッドから直接呼ぶ。外側のWeb Workerで包まない。
- `cshogi` / `python-shogi`は`tools/`内の開発補助専用。本番コードや配布物へ入れない。
- マスタデータは`data/*.json`を正とし、UIへ値を直書きしない。
- コード上の用語は`formation`（表示上は「戦形」）。「囲い」と混同しそうな変更だけ`GLOSSARY.md`を確認する。
- GPLv3互換かつ再配布可能と確認できた依存・素材だけを追加する。振電3の評価関数は配布物・マスタ・ビルドへ入れない。
- 認証トークン、秘密鍵、サービスアカウント等をコミットしない。FirebaseプロジェクトID`shogi-64125`と公開URLは秘密ではない。
- デプロイ、push、外部サービスの更新は、ユーザーが明示的に依頼した場合だけ行う。

## 3. 構成と責務

| パス | 責務 |
|---|---|
| `src/board-ui/` | 盤面、対局進行、準備画面、RPG効果、テスト |
| `src/engine/` | YaneuraOu.wasmの初期化とUSI通信 |
| `data/` | 敵、戦形、難易度、アイテム、解禁条件のマスタ |
| `src/save/` | セーブ状態、localStorage、復活の呪文 |
| `src/novel/`, `scenario/`, `tyrano/` | M4のノベル連携領域 |
| `assets/` | 配布素材とNNUE。追加時は権利を確認 |
| `tools/` | 開発・検証・Hostingビルド。配布ランタイムではない |
| `dist/` | 生成物。直接編集しない |
| `docs/` | 仕様、計画、決定記録 |

## 4. 必要なときだけ読む文書

| 変更内容 | 読む文書 | 同時に更新する文書 |
|---|---|---|
| 挙動・画面・ゲームルール | `SPECIFICATION.md` | `SPECIFICATION.md` |
| モジュール境界・データフロー | `SYSTEM_DESIGN.md` | `SYSTEM_DESIGN.md` |
| `data/*.json`または保存形式 | `DATA_SCHEMA.md` | スキーマ変更時は先に`DATA_SCHEMA.md` |
| 用語・表示名 | `GLOSSARY.md` | 新語があれば`GLOSSARY.md` |
| 素材・依存関係 | `ASSETS_CREDITS.md`, `LICENSE` | `ASSETS_CREDITS.md` |
| 対局UIの起動・詳細 | `src/board-ui/README.md` | 手順が変わる場合のみ同README |
| マイルストーンの状態・優先順位 | `PROJECT_PLAN.md` | `PROJECT_PLAN.md` |

すべてのユーザー向け機能追加・修正は`CHANGELOG.md`の`[Unreleased]`にも簡潔に記録する。
機械的リファクタやテストだけの変更では、挙動・契約が変わらなければ仕様文書の更新は不要。

## 5. 実装上の既知の罠

- NNUEはエンジン初期化前の`preRun`で仮想FSへ書き込む。初期化後の`FS.writeFile()`ではPThread側から見えない。
- WASMとNNUEのアーキテクチャ（例: HalfKP）を一致させる。不一致でもエラー表示は曖昧。
- `.data`はHTMLと同じ階層、`.wasm`はローダースクリプト基準で解決される。配置基準を混同しない。
- 開発サーバーはCOOP/COEPと`Content-Length`を返す。既存の`src/board-ui/server.js`を使う。
- 本番NNUEの`isready`には約1.3〜1.4秒かかるため、初期化中UIを消さない。
- エンジン本体と評価関数を分離し、敵の棋力差はNNUE、ノード数、思考上限、MultiPVで表現する。
- 村固有の敵戦法は`opening_book_id`と`enemy_openings.json`を正とする。やねうら王の自己定跡は
  `go searchmoves`より先に着手を決めるため、専用戦法がある対局では自己定跡を無効にする。
- 村内コースの本道は、入口から全通常敵を順に通ってボスへ至る連続prefixで解禁する。
  旧セーブの撃破済みボス救済を除き、未勝利の通常敵を飛ばす導線を再導入しない。
- 通常難易度の敵探索量は着手ごとに正規分布で変動する。ヒント探索にはこの乱数と敵デバフを適用しない。
- 「待った」は直前のプレイヤー着手と敵の応手を戻し、プレイヤー手番へ戻す。盤面だけでなく指し手・千日手履歴も復元する。

動作実績のあるWASM統合例は`tools/m0-verification/`と`tools/m0-verification-suisho5/`にある。

## 6. 標準コマンド

プロジェクト直下から実行する。

```powershell
# 自動テスト
npm --prefix src/board-ui test

# Firebase Hosting用distを再生成
node tools/build-hosting.mjs

# ローカル起動（表示されたportを使用）
node src/board-ui/server.js

# 本番配信（明示依頼時のみ）
npx firebase-tools deploy --only hosting
```

代表URL:

- ローカル: `http://localhost:<port>/src/board-ui/index.html`
- 本番: <https://shogi-64125.web.app/>
- パラメータ: `?formation=standard&enemy=training_partner&difficulty=normal&item=node_limit_half`

## 7. 完了条件

- 依頼された挙動が実装され、正常系だけでなく主要な失敗・境界条件も扱っている。
- 変更箇所に最も近いテストを追加・更新し、`npm --prefix src/board-ui test`が通る。
- 配信対象を変えた場合は`node tools/build-hosting.mjs`も通る。`dist/`は直接編集しない。
- `git diff --check`が通り、無関係な既存変更を含めていない。
- 上表に該当する文書と`CHANGELOG.md`を更新する。
- マイルストーンを完了した場合だけ`PROJECT_PLAN.md`の状態と次の作業を更新する。
- コミットする場合はConventional Commits（`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`）を使う。

最終報告では、変更結果、重要な設計判断、実行した検証、未実施事項（特にデプロイ）だけを簡潔に伝える。
