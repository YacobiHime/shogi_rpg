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

**shogi.js@5.5.0 は npm 配布物にビルド済みESMバンドル（`dist/`）を含んでいない。**
`node_modules/shogi.js/`配下には`cjs/`（CommonJS、複数ファイルに分割、`Kind`は型のみで
実行時オブジェクトとしては存在しない）しか存在しないため、そのままではブラウザから
直接`import`できない。**このプロジェクトはビルドツールを使わない方針**（`docs/CLAUDE.md`の
ディレクトリ構成方針）だが、vendorへの一度きりの変換としてesbuildを使ってESM単一ファイルに
バンドルする。

```bash
npx esbuild node_modules/shogi.js/cjs/shogi.js --bundle --format=esm --outfile=vendor/shogi.esm.js
```

このバンドルは名前付きexportを持たず、`Shogi`/`Color`/`Piece`/`kindToString`/`colorToString`
をプロパティに持つオブジェクトをdefault exportする（`board.js`の読み込み方参照）。

**確認済みのAPI仕様（`board.js`内で使用）:**
- 駒種`kind`は`"FU"`, `"KY"`, `"TO"`, `"NY"`, `"NK"`, `"NG"`, `"UM"`, `"RY"`等の**文字列**
  （`Kind.FU`のようなオブジェクトアクセスは不可）。表示名は`kindToString(kind)`を使うこと
- 盤面アクセスは`shogi.board[x][y]`ではなく`shogi.get(x, y)`（`board`配列は内部的に0-indexed）
- `move(fromx, fromy, tox, toy, promote)` / `drop(tox, toy, kind, color?)` は想定通りの引数順
- `getMovesFrom(x, y)`が返す候補手には`promote`フィールドは含まれない
  （成り可否は`Piece.canPromote(kind)`で別途判定する）

APIの一次情報は以下を参照:
- TypeDoc: http://apps.81.la/Shogi.js/docs/modules.html
- テストコード: https://github.com/na2hiro/Kifu-for-JS/tree/master/packages/shogi.js/test

### 2. YaneuraOu.wasmの配置

`tools/m0-verification/README.md`の手順と同じ。

```bash
cd src/board-ui
npm install yaneuraou.wasm
cp node_modules/yaneuraou.wasm/yaneuraou.js ./vendor/
cp node_modules/yaneuraou.wasm/yaneuraou.wasm ./vendor/
cp node_modules/yaneuraou.wasm/yaneuraou.worker.js ./vendor/
cp node_modules/yaneuraou.wasm/yaneuraou.data ./vendor/
```

`index.html`の`<script src="./vendor/yaneuraou.js">`のパスと一致させること。

**注意: `yaneuraou.data`は`vendor/`だけでなく`src/board-ui/`直下にも配置すること。**
```bash
cp node_modules/yaneuraou.wasm/yaneuraou.data ./yaneuraou.data
```
`yaneuraou.js`は`.wasm`はスクリプト自身の場所基準で解決するが、`.data`は
ドキュメント（`index.html`）の場所基準の相対パスでfetchするため、`vendor/`配下だけでは
`404`になる（動作確認で判明した挙動）。

### 3. 開発用HTTPサーバーの起動

`tools/m0-verification/README.md`と同じ制約（COOP/COEPヘッダー、Content-Length明示）を
満たすサーバーが必要。`tools/m0-verification-suisho5/server.js`を参考にした実装例を
`src/board-ui/server.js`として用意すること（`.gitignore`対象、リポジトリには含めない）。

**注意: サーバーのルートは`src/board-ui`ではなく`src/`にすること。**
`main.js`が`../engine/engine.js`を相対importするため、`src/board-ui`だけを
ドキュメントルートにすると`src/engine/engine.js`が`404`になる。

```bash
cd src/board-ui
node server.js
```

### 4. ブラウザで動作確認

サーバーのルートを`src/`にした場合:
```
http://localhost:<port>/board-ui/index.html
```

## 既知の未実装・要対応事項（このコードをベースに実装を進める際の引き継ぎ事項）

- 成り選択: 現状`window.confirm`の簡易実装。仕様書7.3の「成り／不成りの選択」UIとして
  盤面上にボタン表示する形に置き換えること
- 投了ボタン・詰み判定後の結果画面（仕様書7.3参照）
- 持ち駒を打つ操作のドラッグ&ドロップ対応（現状はクリック2段階のみ）
- 本番評価関数（水匠5・hao）への切り替え時の`nnuePath`指定とローディングUI
  （`isready`に1.3〜1.4秒かかる。`docs/CLAUDE.md`6.参照）

`applyUsiMove()`のパーサー実装、盤面API呼び出し箇所（`shogi.get()`等）、空きマスへの
クリック判定（`_drawCellHitboxes()`）は実装・動作確認済み。
