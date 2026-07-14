# 対局UI

マイルストーン1「盤面表示・駒移動・エンジンとの対局」の成果物を基盤として、
マイルストーン2のRPG進行データとの連携を追加しています。

## 構成

```
src/engine/engine.js      … USI通信ラッパー（tools/m0-verification/index-mainthread.htmlの移植）
src/board-ui/board.js     … 盤面描画・駒移動UI（shogi.jsをルールエンジンとして使用）
src/board-ui/main.js      … 上記2つを繋ぐエントリポイント
src/board-ui/entering-king.mjs … 27点法の入玉宣言条件を判定
src/board-ui/formations.mjs … 戦形マスタの取得・検証・選択
src/board-ui/enemies.mjs … 敵マスタの取得・検証・選択
src/board-ui/difficulty.mjs … 難易度マスタの取得・検証・ノード数補正
src/board-ui/move-selection.mjs … 手のランク補正とMultiPV候補からの指し手選択
src/board-ui/nnue.mjs     … 敵の評価関数ファイル名から配布URLを解決
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
直接`import`できない。**このプロジェクトはビルドツールを使わない方針**（`docs/AGENTS.md`の
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

**注意: サーバーのルートは`src/board-ui`や`src/`ではなく、プロジェクト直下にすること。**
`main.js`が`src/engine/engine.js`を、`formations.mjs`が`data/formations.json`を読むため、
それより下をドキュメントルートにするといずれかが`404`になる。

```bash
cd src/board-ui
node server.js
```

### 4. ブラウザで動作確認

サーバーのルートをプロジェクト直下にした場合:
```
http://localhost:<port>/src/board-ui/index.html
```

戦形IDを指定する場合:
```
http://localhost:<port>/src/board-ui/index.html?formation=standard
```

戦形は`data/formations.json`へ追加する。指定した戦形の`start_sfen`が盤面とエンジンの
両方へ渡され、未指定時は`standard`（平手）で開始する。

敵IDも指定する場合:
```
http://localhost:<port>/src/board-ui/index.html?formation=standard&enemy=training_partner
```

敵は`data/enemies.json`へ追加する。未指定時は`training_partner`（稽古相手）を使用する。
強さは`node_limit`を主基準とし、`max_think_time_ms`は低速端末で思考が終わらない場合の
安全上限として使う。

`nnue_file`が`null`ならエンジン内蔵評価関数を使用する。ファイル名を指定する場合は、
ライセンスとWASMエンジンとのNNUEアーキテクチャ一致を確認した評価関数を
`assets/nnue/<nnue_file>`へ配置する。指定ファイルが未配置、取得失敗、または空の場合は
内蔵評価関数へフォールバックする。ディレクトリを含む値は敵マスタの検証で拒否される。

難易度も指定する場合:
```
http://localhost:<port>/src/board-ui/index.html?formation=standard&enemy=training_partner&difficulty=easy
```

難易度は`data/difficulty.json`へ定義する。未指定時は`normal`（ふつう）を使用し、
`node_limit_mult`を敵の`node_limit`へ乗算した実効ノード数で探索する。また、
`move_rank_max_bonus`を敵の`move_rank.max`へ加算し、MultiPVで得た実効範囲内の候補から
ランダムに指し手を選ぶ。現在の稽古相手では、`easy`は第1〜第3候補、`normal`と`hard`は
第1候補のみが選択対象になる。候補不足時は利用可能なランクまで自動的に縮退する。

## 既知の未実装・要対応事項（このコードをベースに実装を進める際の引き継ぎ事項）

- 水匠5・haoと互換性のあるHalfKP noeval版WASMを本番配布用vendorへ組み込む手順の確定
- 駒・盤の本番用画像素材（現状はSVGの簡易図形と文字表示）

`applyUsiMove()`のパーサー実装、盤面API呼び出し箇所（`shogi.get()`等）、空きマスへの
クリック判定（`_drawCellHitboxes()`）、王手放置となる着手と打ち歩詰めの拒否、
通常の千日手と連続王手による反則の判定は実装済み。

## テスト

```bash
npm test
```

敵・戦形・難易度マスタのスキーマと参照整合性、難易度を反映した実効ノード数と手のランク範囲、
MultiPV候補の収集・ランダム選択・候補不足時のフォールバック、NNUEのパス解決・初期化前注入・
未配置時の内蔵評価へのフォールバック、ノード数基準のUSIコマンドと
最大思考時間による停止処理を確認する。合法手フィルターが王手放置の盤上移動・持ち駒打ちと打ち歩詰めを拒否し、通常の
歩打ち王手や歩以外の駒を打つ詰みは許可すること、および通常の千日手と連続王手による
千日手を正しく区別することをNode.jsの組み込みテストランナーで確認する。
加えて、27点法の入玉宣言について、先手28点・後手27点の点数、敵陣の駒数、王手状態、
手番を正しく判定することも確認する。

## 入玉宣言

対人の合意を必要とする24点法の持将棋は、対エンジンの一人用ゲームには適用せず、
日本将棋連盟が案内する27点法の入玉宣言（先手28点・後手27点）を採用する。
プレイヤーの手番で条件がすべて成立すると「入玉宣言」ボタンが有効になる。
エンジンにも `EnteringKingRule=CSARule27` を設定し、双方で同じ条件を使用する。
