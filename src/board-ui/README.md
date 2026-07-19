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
src/board-ui/enemy-opening-books.mjs … 村固有の敵定跡・完成形・飛車筋制約
src/board-ui/difficulty.mjs … 難易度マスタの取得・検証・ノード数補正
src/board-ui/items.mjs … アイテム／スキルマスタの取得・検証・探索量デバフ補正
src/board-ui/match-assists.mjs … ヒント表示と待った用の手番履歴管理
src/board-ui/move-selection.mjs … 手のランク補正とMultiPV候補からの指し手選択
src/board-ui/nnue.mjs     … 敵の評価関数ファイル名から配布URLを解決
src/board-ui/engine-loader.mjs … NNUEの有無に応じてWASMローダーを動的選択
src/board-ui/novel-bridge.mjs … iframe対局からティラノへ終局結果を返却
src/novel/match-bridge.mjs … 対局URL・結果メッセージ契約とiframe管理
src/novel/tyrano-match-tag.mjs … ティラノの[shogi_match]タグ
src/board-ui/index.html   … 検証用ページ
src/board-ui/vendor/      … 静的配信に含めるブラウザ実行用の外部ライブラリ
```

## セットアップ手順

### 1. shogi.js の取得とvendorへの配置

本番配布に必要な`vendor/shogi.esm.js`はリポジトリへ同梱済み。更新・再生成する場合は
次の手順を使う。

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

通常版の本番配布資産もリポジトリへ同梱済み。バージョン更新時は
`tools/m0-verification/README.md`と同じ次の手順で再配置する。

```bash
cd src/board-ui
npm install yaneuraou.wasm
cp node_modules/yaneuraou.wasm/yaneuraou.js ./vendor/
cp node_modules/yaneuraou.wasm/yaneuraou.wasm ./vendor/
cp node_modules/yaneuraou.wasm/yaneuraou.worker.js ./vendor/
cp node_modules/yaneuraou.wasm/yaneuraou.data ./vendor/
```

通常版ローダーは`engine-loader.mjs`が必要時に`./vendor/yaneuraou.js`を読み込む。

**注意: `yaneuraou.data`は`vendor/`だけでなく`src/board-ui/`直下にも配置すること。**
```bash
cp node_modules/yaneuraou.wasm/yaneuraou.data ./yaneuraou.data
```
`yaneuraou.js`は`.wasm`はスクリプト自身の場所基準で解決するが、`.data`は
ドキュメント（`index.html`）の場所基準の相対パスでfetchするため、`vendor/`配下だけでは
`404`になる（動作確認で判明した挙動）。

水匠5・Hao用の`yaneuraou.halfkp.noeval.js`、`.wasm`、`.worker.js`は本番配布用として
`vendor/`へ同梱済み。これらは`@mizarjp/yaneuraou.halfkp.noeval` 7.6.3-alpha.0由来で、
`nnue_file`を指定した敵のときだけ動的に読み込まれる。

やねうら王公式の標準定跡DBは`assets/books/standard_book.db`（13,512,347 byte、約13.5MB）へ
配置済み。`ShogiEngine`は初期化前にファイルを取得し、Emscripten仮想FSの
`/user_book1.db`へpreloadする。新しい`FS.mkdirTree()` / `FS.writeFile()`と、同梱WASMの
古い`FS_createPath()` / `FS_createDataFile()`の両方を扱う。取得・空ファイル・仮想FS書き込みの
失敗時は、定跡なしの探索へフォールバックして対局を継続する。

評価関数本体は既存ファイルを本番URLへコピーする。PowerShellでは次のように配置できる。

```powershell
Copy-Item ../../ShogiAI/Suisho5/eval/nn.bin ../../assets/nnue/suisho5.bin
Copy-Item ../../ShogiAI/hao/eval/nn.bin ../../assets/nnue/hao.bin
```

`data/enemies.json`の`nnue_file`には、配置先の`suisho5.bin`または`hao.bin`を指定する。

振電3（Shinden3）は同梱しない。ローカル評価関数はHalfKP 512次元で、現在のHalfKP noeval
WASM（HalfKP 256次元）と非互換であり、第三者再配布の許諾も確認できていないためである。

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

### 4. Firebase Hosting用ビルド・本番配信

本番配信先は、COOP/COEP応答ヘッダーと64MB級のNNUEファイルを扱えるFirebase Hostingを使う。
FirebaseプロジェクトIDは`shogi-64125`で、`.firebaserc`の既定プロジェクトとして管理する。
プロジェクトIDと公開URLは識別子であり、APIキーや認証情報のような秘密情報ではない。
プロジェクト直下で次を実行すると、実行に必要なファイルだけが`dist/`へ出力される。

```powershell
node tools/build-hosting.mjs
```

`data/enemies.json`が参照する`nnue_file`が`assets/nnue/`にない場合、ビルドはエラーで停止する。
ビルドは`assets/books/standard_book.db`を固定パスから明示コピーし、`vendor/`はallowlistにある
ブラウザ実行資産だけを許可する。`assets/nnue/`も全件ではなく、敵マスタが参照する`.bin`だけを
コピーする。未知のvendor資産、参照先のないNNUE、不正なNNUEファイル名は配布せずビルドを停止する。
Firebase CLIへログインした後、次のコマンドでローカル確認と配信を行う。

```powershell
npx firebase-tools emulators:start --only hosting
npx firebase-tools deploy --only hosting
```

本番URL: <https://shogi-64125.web.app/>

公開後はレスポンスに`Cross-Origin-Opener-Policy: same-origin`と
`Cross-Origin-Embedder-Policy: require-corp`が付き、ブラウザで`crossOriginIsolated === true`に
なることを確認する。Firebase Hostingの無料転送枠は月10GBのため、64MB級NNUEを使う公開テストでは
転送量にも注意する。

### 5. ブラウザで動作確認

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

`opening_book_id: null`の一般敵は、仮想FSへ読み込んだ標準定跡DBをやねうら王の自己定跡として
使用する。村固有の敵は`opening_book_id`から`data/enemy_openings.json`を引き、次の順序付き
`steps`にある合法手をUSIの`go ... searchmoves ...`で優先する。自己定跡は`searchmoves`より先に
着手を決めるため、この対局では`USI_OwnBook=false`と`BookFile=no_book`にして敵専用定跡を
迂回させない。

敵専用定跡の手が王手や進路妨害で違法なら、通常の合法手探索へフォールバックする。
`constraints.rook_files`を持つ四間飛車は、`activate_after_move`の`8b4b`以後、飛車・竜の移動先と
飛車打ちを1〜4筋へ限定した合法手だけを`searchmoves`へ渡す。したがって、定跡完成後や
駒組み途中の妨害後も居飛車へ戻らない。現行の割り当ては次のとおり。

- 第2章: 棒銀
- 第3章: 四間飛車＋美濃囲い
- 第4章: 角道を止める四間飛車
- 第5章: 角換わり、横歩取り、相掛かり、汎用居飛車を敵ごとに指定
- 第6章: 四間飛車穴熊

`nnue_file`が`null`ならエンジン内蔵評価関数を使用する。ファイル名を指定する場合は、
ライセンスとWASMエンジンとのNNUEアーキテクチャ一致を確認した評価関数を
`assets/nnue/<nnue_file>`へ配置する。指定ファイルが未配置、取得失敗、または空の場合は
通常版WASMの内蔵評価関数へフォールバックする。HalfKPローダーまたはHalfKPエンジンの
初期化に失敗した場合も同様に通常版へ切り替える。ディレクトリを含む値は敵マスタの検証で拒否される。

難易度も指定する場合:
```
http://localhost:<port>/src/board-ui/index.html?formation=standard&enemy=training_partner&difficulty=easy
```

保存データがない初回だけプレイヤーレベルを指定する場合は`level`を付ける（省略時は1）。準備画面には
そのレベルで解禁済みの戦形・スキルだけを表示し、以後はlocalStorageのセーブを参照する。
未解禁のIDをURLへ直接指定しても対局は開始しない。

```
http://localhost:<port>/src/board-ui/index.html?level=3
```

難易度は`data/difficulty.json`へ定義する。未指定時は`normal`（ふつう）を使用し、
`node_limit_mult`を敵の`node_limit`へ乗算した実効ノード数で探索する。通常難易度では、
敵が指すたびに実効ノード数を基準100%・標準偏差45%の正規分布を基に揺らし、上振れ幅だけを
半分に圧縮する（10%から145%に制限）。また、
`move_rank_max_bonus`を敵の`move_rank.max`へ加算し、MultiPVで得た実効範囲内の候補から
ランダムに指し手を選ぶ。現在の稽古相手では、`easy`は第1〜第3候補、`normal`と`hard`は
第1候補のみが選択対象になる。候補不足時は利用可能なランクまで自動的に縮退する。

探索量デバフスキルも指定する場合:
```
http://localhost:<port>/src/board-ui/index.html?formation=standard&enemy=training_partner&difficulty=normal&item=node_limit_half
```

スキルは`data/items.json`へ定義する。現在は`type: "enemy_debuff_nodes"`かつ
`consumable: false`でレベル1から解禁されるスキルを準備画面で1つ装備できる。
`effect_value`は敵探索量へ掛ける倍率で、
`node_limit_half`（読み筋封じ）の`0.5`は実効ノード数を50%にする。`item`を省略すると未装備になる。

対局中の「ヒント」は敵の強さと独立した5万ノード・最大3秒のAI探索を行い、現局面の
最善手・次善手・3番手を「5二銀」のような日本語表記で表示する。「待った」は
直前のプレイヤーの指し手と敵の応手を取り消し、指し直し可能な局面へ戻す。
初回セーブでは`data/items.json`の`hint_ticket`を2個、`undo_ticket`を3個所持し、
対局ではセーブデータの所持数を使用上限として使用時に自動保存する。

## 既知の未実装・要対応事項（このコードをベースに実装を進める際の引き継ぎ事項）

- 次善手デバフなど、探索量削減以外の未対応アイテム／スキル

盤と駒は外部画像を使わず、`board.js`と`board-theme.mjs`が自作SVGとして描画する。
木目調の盤、五角形の駒、筋を数字・段を漢数字とする座標、成駒の朱文字、持ち駒の枚数表示を含む。

## ティラノスクリプト連携

Hosting用ビルド後、`http://localhost:8002/dist/index.html`を開くと`scenario/m4.ks`から
`[shogi_match]`タグが対局UIを全画面iframeで起動する。タグの指定例:

```ks
[shogi_match match_id="chapter1.training:1" enemy="training_partner" formation="standard" difficulty="normal" item="node_limit_half"]
```

終局後は`f.match_result`で勝敗・終了理由・手数を分岐に使える。勝利時は
`sf.shogi_rpg.chapter_flags`と共通セーブの`defeated_bosses`へ反映される。

`applyUsiMove()`のパーサー実装、盤面API呼び出し箇所（`shogi.get()`等）、空きマスへの
クリック判定（`_drawCellHitboxes()`）、王手放置となる着手と打ち歩詰めの拒否、
通常の千日手と連続王手による反則の判定は実装済み。

## 七村RPGの冒険コース

`data/world.json`の各章は`course.nodes`と`course.links`を持つ。`main`リンクが入口から通常敵を
経てボスへ至る本道、`branch`リンクが入口または敵地点から宝箱へ伸びる寄り道である。本道は先頭から
連続して勝利したprefixだけを順番に解放し、未勝利の敵を飛ばせない。宝箱は接続元の勝利後に
開けられるが、未開封でもボスへの本道を妨げない。

旧セーブに後方の敵だけが記録されていても途中の地点は解放しない。一方、旧版でボス撃破済みなら
章クリアを取り消さず、ボス地点と次章解放を復旧する。この救済は通常敵を勝利済みに補完しない。

## テスト

```bash
npm test
```

敵・戦形・難易度・アイテムマスタのスキーマと参照整合性、難易度と探索量デバフを反映した実効ノード数と手のランク範囲、
MultiPV候補の収集・ランダム選択・候補不足時のフォールバック、NNUEのパス解決・初期化前注入・
エンジン動的選択・各初期化段階からの内蔵評価へのフォールバック、標準定跡DBの仮想FS preload、
USIオプション検出、敵専用定跡と`go searchmoves`、四間飛車の飛車筋維持、ノード数基準のUSIコマンドと
最大思考時間による停止処理を確認する。合法手フィルターが王手放置の盤上移動・持ち駒打ちと打ち歩詰めを拒否し、通常の
歩打ち王手や歩以外の駒を打つ詰みは許可すること、および通常の千日手と連続王手による
千日手を正しく区別することをNode.jsの組み込みテストランナーで確認する。
ヒントの上位3手選択・日本語表示整形、待ったの手番履歴復元、取り消し後の千日手履歴も確認する。
加えて、27点法の入玉宣言について、先手28点・後手27点の点数、敵陣の駒数、王手状態、
手番を正しく判定することも確認する。

## 入玉宣言

対人の合意を必要とする24点法の持将棋は、対エンジンの一人用ゲームには適用せず、
日本将棋連盟が案内する27点法の入玉宣言（先手28点・後手27点）を採用する。
プレイヤーの手番で条件がすべて成立すると「入玉宣言」ボタンが有効になる。
エンジンにも `EnteringKingRule=CSARule27` を設定し、双方で同じ条件を使用する。
