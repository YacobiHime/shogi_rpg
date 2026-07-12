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
| 将棋AIエンジン | YaneuraOu.wasm（USIプロトコル、メインスレッドから直接呼び出し。詳細は下記「WASM将棋エンジン統合時の必須知識」） |
| 開発補助 | cshogi / python-shogi（本番のブラウザ実行には使用しない） |
| セーブ | localStorage ＋ 復活の呪文（文字列エンコード） |

## ディレクトリ構成（想定、`CONTRIBUTING.md`参照）

```
/data          … 敵・戦形・アイテム等のマスタデータ（JSON）
/src/engine    … 将棋AIエンジン（メインスレッド直接呼び出し）/ USI通信まわり
/src/board-ui  … 対局UI
/src/save      … セーブ・復活の呪文まわり
/src/novel     … ティラノスクリプト連携
/assets        … 画像・音声等の素材
/docs          … 設計書・仕様書
/tools         … 開発補助スクリプト（cshogi/python-shogi等、本番配布に含めない）
```

## 実装時の重要な制約

- **将棋AIエンジン（YaneuraOu.wasm）はメインスレッドから直接呼び出す**（Web Worker内から呼び出すと
  `createObjectURL`エラーで動作しないため。M0検証で確定した方針、詳細は下記「WASM将棋エンジン統合時の必須知識」参照）
- **cshogi / python-shogi をブラウザ実行コードに混入させない**。これらはPython実装であり `/tools` 配下の開発補助スクリプトでのみ使用する
- **サーバーサイド処理を前提とした実装を提案しない**。無料静的ホスティング・サーバーレス構成が絶対条件
- 敵データ・戦形データ・アイテムデータを追加/変更する際は `docs/DATA_SCHEMA.md` のスキーマに従うこと。スキーマ自体を変更する場合は先に `DATA_SCHEMA.md` を更新してから実装する
- 評価関数（NNUEファイル）は自由配布が明言されているもの（リゼロ評価関数等）のみを扱う。ライセンス不明なファイルの追加を提案しない
- **振電3（Shinden3）の評価関数（`shogiAI/Shinden3/eval/`）は配布物に含めない**（開発者への利用許諾確認待ちのため、`.gitignore`で除外済み）。この評価関数を`data/`配下のマスタデータや本番ビルドに組み込む提案・実装をしないこと。ローカル検証目的での参照のみ許可される
- 「戦形」と「囲い」の用語は `GLOSSARY.md` に従い、コード上は `formation` に統一する

## WASM将棋エンジン統合時の必須知識（M0検証で判明、実装前に必読）

マイルストーン0で判明した、YaneuraOu.wasmをブラウザに統合する際の落とし穴。M1以降で
対局UIとエンジンを本格的に結線する際、これを知らずに実装すると同じ問題に何度もぶつかる。
検証環境の実物は `tools/m0-verification/`（arashigaoka軽量版）と
`tools/m0-verification-suisho5/`（水匠5・hao本番候補版）にあり、動作実績のあるコード
（特に`index-mainthread.html`系ファイルの`initEngine()`）をそのまま参考にすること。

1. **Web Worker内からYaneuraOu.wasmを呼び出さない。メインスレッドから直接呼び出す。**
   Worker内から更にPThread用サブWorkerを生成する「入れ子Worker構成」は
   `createObjectURL`のOverload resolutionエラーで無音に失敗する。
   エンジン自体が内部でPThread化されているため、外側のWorkerでの多重化は不要かつ有害。
   実測では3秒思考中でもUIフレーム間隔は理論値並み（約17.4ms、理論値16.7ms）で、
   メインスレッド直接方式でもUIブロックは実用上問題にならないことを確認済み。

2. **評価関数(nn.bin等)は`preRun`フックでモジュール初期化前に仮想ファイルシステムへ書き込む。**
   初期化後に`engine.FS.writeFile()`すると、内部でプロキシされる別スレッドから見えず
   `Error! : failed to read nn.bin`になる（原因が分かりにくい汎用エラーメッセージ）。
   ```js
   const nnBytes = new Uint8Array(await (await fetch('nn.bin')).arrayBuffer());
   YaneuraOu_XXX({ preRun: [(mod) => mod.FS.writeFile('/nn.bin', nnBytes)] })
     .then((instance) => { /* ここでusi等を送る */ });
   ```

3. **評価関数ファイルとWASMビルドのアーキテクチャ一致を必ず確認する。**
   npmパッケージ名（例: `yaneuraou.halfkp`）だけではアーキテクチャを保証しない。
   `usi`応答の`id name`と、評価関数ファイル先頭のヘッダー文字列
   （`od -A x -t x1z nn.bin | head -4` で見える `Features=HalfKP(Friend)[...]` 等）を
   突き合わせて一致を確認すること。不一致でも「アーキテクチャ不一致」とは表示されず、
   汎用的な読み込み失敗エラーにしかならない。

4. **開発用HTTPサーバーは`Content-Length`ヘッダーを明示的に返す必要がある。**
   Node.jsのデフォルトのchunked転送のままだと、Emscriptenのfetch実装が使う`HEAD`
   リクエストでファイルサイズを取得できず、大きなファイル（評価関数等）の読み込みが
   失敗する。`tools/m0-verification-suisho5/server.js`に対応済みの実装例がある。

5. **エンジン本体と評価関数は分離した設計にする。**
   同一のWASMエンジンバイナリのまま、`nn.bin`を差し替えるだけで水匠5⇔haoのような
   異なるAI人格に切り替えられることを実証済み（同一アーキテクチャの評価関数同士に限る）。
   「敵の強さ・個性システム」は、エンジンを固定し評価関数ファイルと思考時間/ノード数制限/
   MultiPV設定の組み合わせで表現する設計にすること。

6. **isready応答（評価関数の解析）に本番評価関数では約1.3〜1.4秒かかる。**
   arashigaoka軽量版（約28ms）に比べて大幅に長い。対局開始時にローディングUIで
   吸収する設計にすること。

詳細な検証ログ・計測数値は `docs/CHANGELOG.md` の「検証記録」セクションを参照。



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