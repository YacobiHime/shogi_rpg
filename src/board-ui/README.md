# M1: 対局UI最小構成

マイルストーン1「盤面表示・駒移動・エンジンとの対局」の実装です。
RPG要素（戦形・アイテム・スキル・難易度・ティラノスクリプト連携）はスコープ外
（M2以降）。詳細は `docs/PROJECT_PLAN.md` の M1 セクション参照。

## 構成

```
src/engine/engine.js      … USI通信ラッパー（tools/m0-verification/index-mainthread.htmlの移植）
src/board-ui/board.js     … 盤面描画・駒移動UI（shogi.jsをルールエンジンとして使用）
src/board-ui/main.js      … 上記2つを繋ぐエントリポイント
src/board-ui/index.html   … 検証用ページ
src/board-ui/vendor/      … 外部ライブラリの配置場所（.gitignore対象、下記手順で用意）
```

## セットアップ手順

### 1. shogi.js の取得とvendorへの配置

```bash
cd src/board-ui
npm init -y   # まだpackage.jsonがなければ
npm install shogi.js
```

`shogi.js`はESモジュール/CommonJS両対応のビルド成果物を`node_modules/shogi.js/`配下に
生成する。**このプロジェクトはビルドツールを使わない方針**（`docs/CLAUDE.md`のディレクトリ
構成方針）のため、ブラウザから直接`import`できる形でvendor配置する。

```bash
cp node_modules/shogi.js/dist/index.mjs ./vendor/shogi.esm.js
# 実際の出力ファイル名はバージョンにより異なる可能性があるため、
# node_modules/shogi.js/package.json の "module" または "exports" フィールドを確認すること
```

**重要: API仕様は実装前に必ずTypeDocで確認すること。**
`board.js`内のコード（`shogi.board[x][y]`、`getMovesFrom()`、`move()`、`drop()`、
`hands`、`toSFENString()`等）は一般的なAPIパターンを想定した下書きであり、
実際のプロパティ名・引数順が異なる可能性がある。以下を必ず参照して、
`board.js`内の `// TODO: 実際の...を確認` コメント箇所を修正すること。

- TypeDoc: http://apps.81.la/Shogi.js/docs/modules.html
- テストコード: https://github.com/na2hiro/Kifu-for-JS/tree/master/packages/shogi.js/test

### 2. YaneuraOu.wasmの配置

`tools/m0-verification/README.md`の手順と同じ。

```bash
cd src/board-ui
npm install yaneuraou.wasm
cp node_modules/yaneuraou.wasm/yaneuraou.js ./vendor/
cp node_modules/yaneuraou.wasm/yaneuraou.wasm ./vendor/
cp node_modules/yaneuraou.wasm/yaneuraou.data ./vendor/
```

`index.html`の`<script src="./vendor/yaneuraou.js">`のパスと一致させること。

### 3. 開発用HTTPサーバーの起動

`tools/m0-verification/README.md`と同じ制約（COOP/COEPヘッダー、
Content-Length明示）を満たすサーバーが必要。`tools/m0-verification-suisho5/server.js`
を参考に、このディレクトリ用に用意すること（`.gitignore`対象、リポジトリには含めない）。

### 4. ブラウザで動作確認

```
http://localhost:<port>/src/board-ui/index.html
```

## 既知の未実装・要対応事項（このコードをベースに実装を進める際の引き継ぎ事項）

- `board.js` の `applyUsiMove()`: エンジンが返したUSI形式の指し手（例: `7g7f`, `P*5e`,
  成りの`+`）を盤面に反映するパーサーが未実装
- `board.js` の shogi.js API呼び出し箇所（`// TODO`コメント参照）: 実際のAPI仕様との突き合わせ
- 成り選択: 現状`window.confirm`の簡易実装。仕様書7.3の「成り／不成りの選択」UIとして
  盤面上にボタン表示する形に置き換えること
- 投了ボタン・詰み判定後の結果画面（仕様書7.3参照）
- 持ち駒を打つ操作のドラッグ&ドロップ対応（現状はクリック2段階のみ）
- 本番評価関数（水匠5・hao）への切り替え時の`nnuePath`指定とローディングUI
  （`isready`に1.3〜1.4秒かかる。`docs/CLAUDE.md`6.参照）
