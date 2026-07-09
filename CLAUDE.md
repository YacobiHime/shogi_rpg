# CLAUDE.md

このファイルはClaude Codeがこのリポジトリで作業する際に自動的に読み込む、プロジェクトの文脈情報です。

## プロジェクト概要

将棋の対局をコアバトルとするブラウザ向けRPG。物語の進行に応じて使用可能な戦形・アイテム・
スキルが増え、敵（将棋AI）も段階的に強くなる。**無料の静的ホスティングで配信するため、
将棋AIの推論を含むすべての処理をクライアントサイド（ブラウザ）で完結させる。サーバーサイド処理は持たない。**

詳細な設計・仕様は `docs/` 配下を参照すること（作業前に必ず目を通す）：

- `README.md` — 全体概要
- `SYSTEM_DESIGN.md` — アーキテクチャ、モジュール間連携
- `SPECIFICATION.md` — 機能仕様
- `DATA_SCHEMA.md` — 各種JSONデータのスキーマ定義（実装時はこれに厳密に従う）
- `PROJECT_PLAN.md` — マイルストーンと優先順位
- `GLOSSARY.md` — 将棋用語・ゲーム内用語の対応表（表記ゆれ防止のため必ず確認）
- `CHANGELOG.md` — 決定事項の記録

## 技術スタック

| レイヤー | 技術 |
|---|---|
| 演出・進行管理 | ティラノスクリプト |
| 対局UI | JavaScript（既存ライブラリ＋自作） |
| 将棋AIエンジン | YaneuraOu.wasm（USIプロトコル、Web Worker内で実行） |
| 開発補助 | cshogi / python-shogi（本番のブラウザ実行には使用しない） |
| セーブ | localStorage ＋ 復活の呪文（文字列エンコード） |

## ディレクトリ構成（想定、`CONTRIBUTING.md`参照）

```
/data          … 敵・戦形・アイテム等のマスタデータ（JSON）
/src/engine    … Web Worker / USI通信まわり
/src/board-ui  … 対局UI
/src/save      … セーブ・復活の呪文まわり
/src/novel     … ティラノスクリプト連携
/assets        … 画像・音声等の素材
/docs          … 設計書・仕様書
/tools         … 開発補助スクリプト（cshogi/python-shogi等、本番配布に含めない）
```

## 実装時の重要な制約

- **将棋AIの思考は必ずWeb Worker内で実行する**。メインスレッドをブロックしてはいけない
- **cshogi / python-shogi をブラウザ実行コードに混入させない**。これらはPython実装であり `/tools` 配下の開発補助スクリプトでのみ使用する
- **サーバーサイド処理を前提とした実装を提案しない**。無料静的ホスティング・サーバーレス構成が絶対条件
- 敵データ・戦形データ・アイテムデータを追加/変更する際は `docs/DATA_SCHEMA.md` のスキーマに従うこと。スキーマ自体を変更する場合は先に `DATA_SCHEMA.md` を更新してから実装する
- 評価関数（NNUEファイル）は自由配布が明言されているもの（リゼロ評価関数等）のみを扱う。ライセンス不明なファイルの追加を提案しない
- 「戦形」と「囲い」の用語は `GLOSSARY.md` に従い、コード上は `formation` に統一する

## コーディング規約（`CONTRIBUTING.md`参照）

- JavaScriptはES Modules、インデント2スペース
- コミットメッセージは Conventional Commits（`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`）
- 将棋関連の変数名はSFEN/USI用語に準拠（`sfen`, `usiMove` 等）

## ライセンス

本プロジェクトはYaneuraOu（GPLv3系）を組み込むため、リポジトリ全体をGPLv3で公開する。
新規に依存関係・素材を追加する場合はライセンス互換性を確認し、`ASSETS_CREDITS.md` に追記すること。

## 作業完了時のチェックリスト

- [ ] 関連するドキュメント（`SYSTEM_DESIGN.md` / `SPECIFICATION.md` / `DATA_SCHEMA.md`）を更新したか
- [ ] `CHANGELOG.md` に変更点を記録したか
- [ ] 新規素材・依存関係を追加した場合、`ASSETS_CREDITS.md` に記録したか
- [ ] `PROJECT_PLAN.md` のどのマイルストーンに対応する作業かを意識しているか
