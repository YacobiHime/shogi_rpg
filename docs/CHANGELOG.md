---
title: 変更履歴
layout: default
nav_order: 7
---

# CHANGELOG

このプロジェクトの意思決定・進捗をマイルストーン単位で記録します。
書式は概ね [Keep a Changelog](https://keepachangelog.com/) に準拠しつつ、
設計方針の決定事項も残します。

## [Unreleased]

### 短編本編

- 行列式の神・夜古火姫と意思を持つ家臣の駒たちを描く短編「夜古火姫と盤上の灯」を追加
- 三つの駒落ち戦について、終局時の損耗・鹵獲の次戦継承、自由配置、持ち駒化、棋貨雇用、援軍要請を追加
- 対局iframe契約へ任意開始SFENと最終SFENを追加し、Hostingの入口を本編キャンペーンへ変更
- 途中実装で失われていた稽古相手とversion 1復活の呪文発行互換を復旧

### Added
- 2026-07-15時点の途中実装、既知の11テスト失敗、未接続機能、次のP0〜P5作業順を
  `IMPLEMENTATION_HANDOFF.md`へ記録。Hostingビルド成功を本編完成と誤認しないための判定条件も明記
- 7つの村、夜古火姫、段階的な将棋学習、定跡書、レベル成長、追加アイテム、
  素材差し替え条件と未確定事項を整理した`GAME_DESIGN.md`を追加。名前入力、ボスへの直接挑戦、
  初回勝利経験値、地点選択式探索・店・棋貨・サブクエスト、主人公の短い内心、
  やこび姫の人物像、任意ボイス方針、8〜12時間と約30分の両攻略ペースを確定
- GNU GPL v3の公式全文をルート`LICENSE`へ追加し、Hostingビルドへ`LICENSE`と
  `ASSETS_CREDITS.md`を同梱するライセンス表示を追加
- 配布対象と素材台帳を監査し、現在は外部NNUEを同梱していないこと、ティラノ公式サンプル素材と
  GPLエンジンの対応ソースが公開前の確認事項であることを記録
- 外部画像へ依存しない自作SVGの将棋盤・駒テーマを追加。木目調の盤、五角形の駒、
  筋・段の座標、星、成駒の朱文字、駒種別に集約した持ち駒枚数を表示
- 狭い画面で盤を横幅へ縮小し、対局操作を2列へ折り返すレスポンシブ表示を追加
- ティラノスクリプトへ`[shogi_match]`タグを追加し、対局条件を渡して全画面iframeを起動、
  勝敗・終了理由・手数を同一オリジン`postMessage`で返すM4連携を追加
- iframeの再読込・同一条件リトライでは進行を更新せず、勝利結果の受信時だけ撃破済み敵と
  章分岐フラグを重複なく保存する処理とメッセージ契約テストを追加
- Firebase Hostingのルートをティラノのノベル入口へ変更し、シナリオ・ランタイム・
  対局ブリッジを静的配布物へ含めるビルドを追加
- `src/save/`にバージョン付きセーブ状態、localStorage自動保存、旧形式移行、欠損補完、
  破損時の安全な初期復旧を追加し、プレイヤーレベルと解禁状態を対局準備へ結線
- 72 bitの進行状態へCRC-8を付け、紛らわしい文字を除いた16文字へ変換する
  「復活の呪文」と、準備画面での発行・入力・復元・入力ミス表示を追加
- 難易度変更とヒント・待ったの消費を即時保存し、再読み込み後も設定と残数を維持
- `data/level_unlocks.json`とレベル解禁処理を追加。スタンドアロン用`level`クエリに応じて
  準備画面の戦形・スキルを絞り込み、ヒント・待った回数のレベルアップ増加を反映
- 解禁テーブルの重複レベル・未知ID・登録漏れ・マスタの`unlock_level`不一致を検出し、
  URLで未解禁要素を直接指定した場合も対局開始前に拒否する検証を追加
- 対局中にAIが現局面の最善手を探索して表示するヒント機能を追加。
  スタンドアロン対局では2回まで使用でき、残り回数を画面に表示する
- 直前のプレイヤーの指し手と敵の応手を取り消す待った機能を追加。盤面、
  指し手履歴、千日手履歴を同時に復元し、スタンドアロン対局では3回まで使用できる
- `data/items.json`に「棋神の巻物」と「待った札」を追加し、ヒント・待ったの回数を
  マスタデータから決定できるようにした
- `.firebaserc`へFirebaseプロジェクト`shogi-64125`を登録し、本番デプロイ先を
  <https://shogi-64125.web.app/> に統一した
- 通常難易度の敵AIが指すたびに、探索ノード数を基準100%・標準偏差45%の正規分布を基に
  10〜145%の範囲で変動させ、上振れ幅だけを半分に圧縮して強すぎる着手を抑えるよう調整
- `data/items.json`に最初の恒久スキル「読み筋封じ」を追加し、対局準備画面または
  URLクエリ`?item=node_limit_half`から装備して敵の実効探索ノード数を50%にできるようにした
- `src/board-ui/items.mjs` / `test/items.test.mjs`: アイテムマスタの検証、探索量デバフの
  選択と倍率計算、不正なID・倍率の拒否を追加
- 対局開始前に対戦相手・戦形・難易度を画面上で選べる準備画面を追加。クエリ付きURLによる
  既存の直接起動にも対応し、対局中は条件選択へ戻れるようにした
- 対局UIで選択中の盤上駒・持ち駒を青色で強調し、王手放置や打ち歩詰めを除いた
  合法な移動先を緑色で表示する操作ガイドを追加
- 文化祭等の展示運用向けに、対局の再開始、結果画面からの再挑戦、初期化失敗時の再試行、
  オフライン案内、対応ブラウザでの画面スリープ抑止を追加
- `docs/CULTURAL_FESTIVAL_RUNBOOK.md`: 展示開始前の確認と、問題発生時の復旧手順を追加
- `firebase.json`: HalfKP版WASMのPThread実行に必要なCOOP/COEP/CORP応答ヘッダーと、
  対局UIへのルートリライトを設定
- `tools/build-hosting.mjs`: 対局UI・エンジン・マスタ・配布許可済みNNUEだけを`dist/`へ
  組み立て、敵マスタが参照するNNUEの配置漏れをデプロイ前に検出する処理を追加
- `src/board-ui/engine-loader.mjs`: 敵の`nnue_file`に応じて通常版またはHalfKP noeval版の
  WASMローダーを動的に読み込む処理を追加
- `src/board-ui/vendor/`: `@mizarjp/yaneuraou.halfkp.noeval` 7.6.3-alpha.0の本番配布用
  JS・WASM・Workerを追加
- 静的ホスティングへそのまま配置できるよう、通常版YaneuraOu.wasmと`shogi.esm.js`を含む
  ブラウザ実行用vendor資産を本番配布対象へ変更
- `src/board-ui/test/engine-loader.test.mjs`: エンジン選択、ローダー再利用、取得失敗時の
  フォールバックを確認するテストを追加
- `src/board-ui/nnue.mjs` / `test/nnue.test.mjs`: 敵の`nnue_file`を`assets/nnue/`配下の
  安全なURLへ解決する処理とテストを追加
- `src/board-ui/move-selection.mjs` / `test/move-selection.test.mjs`: 敵の`move_rank`へ
  難易度補正を適用し、利用可能なMultiPV候補から指し手を選ぶ処理とテストを追加
- `data/difficulty.json`: やさしい／ふつう／むずかしいのノード数倍率と手のランク補正を追加
- `src/board-ui/difficulty.mjs` / `test/difficulty.test.mjs`: 難易度マスタの取得・検証、
  実効ノード数の計算とテストを追加
- `data/enemies.json`: 内蔵評価関数を使う最初の敵「稽古相手」と、探索ノード数・最大思考時間を追加
- `src/board-ui/enemies.mjs`: 敵マスタの取得、スキーマ検証、戦形参照検証、IDによる選択を追加
- `src/board-ui/test/enemies.test.mjs` / `engine.test.mjs`: 敵データとノード数基準の探索停止を確認するテストを追加
- `data/formations.json`: 最初の戦形マスタとして平手局面を追加
- `src/board-ui/formations.mjs`: 戦形マスタの取得、スキーマ検証、IDによる選択を追加
- `src/board-ui/test/formations.test.mjs`: 実データ、重複ID、相性参照、未知IDを確認するテストを追加
- `src/board-ui/entering-king.mjs`: 先手28点・後手27点の入玉宣言について、玉の位置、
  敵陣の駒数、点数、王手状態、手番を評価する判定を追加
- `src/board-ui/test/entering-king.test.mjs`: 入玉宣言の成立条件と不成立条件を確認する
  テストを追加
- `src/board-ui/legal-moves.mjs`: 歩打ちで王手した局面について、相手に王手を解消する
  盤上の合法手があるかを調べる打ち歩詰め判定を追加
- `src/board-ui/test/legal-moves.test.mjs`: 打ち歩詰めの拒否、逃げ道がある歩打ち王手、
  歩以外の駒を打つ詰みを確認するテストを追加
- `src/board-ui/repetition.mjs`: 盤面・持ち駒・手番が同じ局面の4回出現を検出し、
  通常の千日手と連続王手による千日手を区別する履歴管理を追加
- `src/board-ui/test/repetition.test.mjs`: 局面キー、通常の千日手、連続王手の反則負けを
  確認するテストを追加

### Fixed
- 選択中の持ち駒を再度クリックしても選択解除できなかった問題を修正
- GitHub Pagesの公開対象から`AGENTS.md`と`SKILL.md`が除外され、
  サイドバーとドキュメント一覧に表示されなかった問題を修正
- 展示端末に旧版の盤面JavaScriptが最大1時間残り、選択中の駒と移動先の強調色が表示されない
  場合がある問題を修正。HTML・JavaScript・JSONを再検証するキャッシュ設定へ変更した
- Firebase HostingのルートURLでは`./main.js`が存在しない`/main.js`へ解決され、
  対局UIが「読み込み中...」から進まなかった問題を修正。HTMLの基準URLを
  `/src/board-ui/`へ固定し、ルート書き換え後の資産URLを確認する回帰テストを追加
- ブラウザの`fetch`を`ShogiEngine`のメソッドとして呼び出して`Illegal invocation`になり、
  NNUE取得が常にフォールバックしていた問題を修正
- エンジンが `bestmove win` を返した際、プレイヤーの勝利として表示していた問題を修正
- `shogi.js`単体では判定されない打ち歩詰めを、プレイヤーが指せた問題を修正

### Changed

- M5を進行中へ更新し、公開版の現行最小シナリオで検証済みの範囲と、製品版シナリオ、
  スマートフォン実機、ライセンス・対応ソースに関する残作業を明確化
- `AGENTS.md`を最小コンテキストで作業できる実務ガイドへ再編し、ルートからの発見用エントリを追加
- `PROJECT_PLAN.md`へ現在地、次の主作業、M2〜M5の完了条件を追加し、旧ガイドへの参照を修正
- NNUE指定時はHalfKP noeval版を使用し、ローダー取得・評価関数取得・エンジン初期化の
  いずれかに失敗した場合は通常版WASMの内蔵評価へ切り替えるよう変更
- 対局UIが敵の`nnue_file`をエンジン初期化へ渡し、取得した評価関数を`preRun`で仮想FSへ
  書き込むよう変更。未指定・未配置・取得失敗・空ファイルの場合は内蔵評価関数へフォールバックする
- `src/engine/engine.js`: `info multipv ... pv ...`の最終候補を順位別に収集し、
  `bestmove`とともに返すよう変更。対局UIは実効最大ランクをMultiPVへ設定し、候補不足時は
  利用可能な範囲へ縮退して指し手を選ぶ
- 対局UIがURLクエリ`difficulty`を受け取り、敵の基準ノード数へ難易度倍率を適用し、
  現在の難易度名を画面へ表示するよう変更
- 敵AIの強さは端末性能差を抑えるため`node_limit`を主基準とし、`max_think_time_ms`は
  極端に遅い端末で思考を停止する安全上限として扱う方針へ変更
- 対局UIがURLクエリ`enemy`で敵を受け取り、敵名と探索制限を対局へ反映するよう変更
- マイルストーン1を完了とし、マイルストーン2「RPG進行システム」を開始
- 対局UIがURLクエリ`formation`で戦形を受け取り、マスタの開始SFENを盤面とエンジンの
  双方へ適用するよう変更
- `src/board-ui/main.js`: プレイヤーの入玉宣言ボタンを制御し、エンジンにも27点法を
  設定して双方の宣言勝ちを処理するよう変更
- `src/board-ui/main.js`: 人間とエンジンの各着手後に千日手を判定し、引き分けまたは
  連続王手を続けた側の反則負けとして結果画面を表示するよう変更

### Notes

- 2026-07-15にFirebase公開URLをPC Chromeで確認。`crossOriginIsolated: true`、対局iframe内の
  SVG盤面とエンジン初期化、勝利結果の`postMessage`返却、勝利分岐、
  `defeated_training_partner`の保存までエラーなく完了
- 現在の公開ノベルは`scenario/m4.ks`の1対局だけで停止するM4結線用の最小構成であり、
  製品版の「本編完走」は本編シナリオ実装後に別途検証する

### 決定事項（設計フェーズ）

- 対象プラットフォーム：Webブラウザ（無料静的ホスティングを利用、サーバー処理なし）
- 将棋AIの推論はすべてクライアントサイド（ブラウザ）で実行する方針に決定
- 将棋AIエンジンは `YaneuraOu.wasm`（有志によるWASMビルド）を採用候補とする
- cshogi / python-shogi は本番のブラウザ実行には使用せず、開発補助ツールとして位置づける
- ティラノスクリプトを演出・進行管理レイヤーとして採用
- セーブシステムとして「復活の呪文」方式（文字列エンコード）をlocalStorageの二次バックアップとして導入
- 難易度（やさしい／ふつう／むずかしい）はゲーム中いつでも変更可能とする
- 敗北時はゲームオーバーにせず、リトライまたは拠点に戻っての準備を選べる形式とする
- 戦形（囲い）は完成局面から対局を開始する方式（駒組み過程は省略）
- 敵の強さは評価関数・ノード数制限・最大思考時間・MultiPVによる手のランク制御の組み合わせで表現
- ライセンス確認：YaneuraOu本体はGPLv3系、NNUE評価関数は自由配布のもの（リゼロ評価関数等）のみ使用可と判明
- ライセンス確認：水匠5・Hao（Háo）は公式GitHub Releaseとして無条件配布されており使用可と確認
- ライセンス確認：振電3（Shinden3）は開発者が無償公開を明言しているが正式なライセンス文書がないため、
  開発者への直接確認が取れるまで配布物への同梱を見送る暫定対応を決定（`.gitignore`で除外設定）
- プロジェクト全体をGPLv3で公開する方針に決定

### ドキュメント

- README.md 作成
- SYSTEM_DESIGN.md 作成
- PROJECT_PLAN.md 作成
- SPECIFICATION.md 作成
- CONTRIBUTING.md 作成
- LICENSE 作成
- DATA_SCHEMA.md 作成
- ASSETS_CREDITS.md 作成
- GLOSSARY.md 作成

### マイルストーン0（技術検証）

#### 進行中

- arashigaoka/YaneuraOu.wasm v0.1.2（npmパッケージ）の検証環境を構築
  - npmパッケージ `yaneuraou.wasm` からビルド済み資産を取得
  - WASMファイル（yaneuraou.js, yaneuraou.wasm, yaneuraou.data）を配置
  - COOP/COEPヘッダー対応の簡易HTTPサーバー（server.js）を作成
  - worker.jsをarashigaoka版API（YaneuraOu）に対応させて実装
- WASMビルド（GPL-3.0、評価関数k-p-256-32-32）を確認、ASSETS_CREDITS.mdに記録

#### 検証記録：mizar版の試行と失敗（2026-07-11）

- mizar/YaneuraOu.wasm v7.6.3-alpha.0の検証を試みたが失敗
  - Suisho5 HalfKP版（61MB）をダウンロード・試行 → SharedArrayBuffer/PThread問題で動作せず
  - SuishoPetite k-p版（1.4MB）をダウンロード・試行 → 同じくSharedArrayBuffer問題で動作せず
  - 原因: mizar版のWASMビルドはPThread（マルチスレッド）を使用しており、SharedArrayBufferが必須
  - COOP/COEPヘッダーを設定してもSharedArrayBufferが有効にならず、WASM初期化時にエラー
  - Chromeの機能フラグ（Experimental WebAssembly features）でも解決せず
  - 結論: 技術検証の目的を達成するため、arashigaoka版を使用（※後日訂正：下記参照）

#### 検証記録：USI通信・速度・UIブロック計測（2026-07-12）

- **訂正**: arashigaoka/YaneuraOu.wasm v0.1.2も実際にはPThread（マルチスレッド、Threads最大32）を使用するビルドであることが判明。
  npmパッケージ同梱のREADME.mdに `Threads: 32` `Cross-Origin-Embedder-Policy: require-corp` 等の記載があり、
  「シングルスレッド版」という当初の認識は誤りだった。SharedArrayBuffer自体はCOOP/COEPヘッダーにより有効化できており、
  mizar版で失敗した根本原因はPThread使用の有無ではなかった。
- 当初のworker.js実装（`index.html` → `worker.js`(Worker#1) → `yaneuraou.worker.js`(Worker#2、PThread用サブワーカー)という
  Worker内Worker構成）では `Uncaught TypeError: Failed to execute 'createObjectURL' on 'URL': Overload resolution failed`
  が発生し初期化が完了しなかった。原因はWorker内から更にPThread用サブWorkerを生成する入れ子構成にあると推定。
- 切り分けとして、Web Workerを介さずメインスレッドから直接 `YaneuraOu()` を呼び出す検証ページ（`test-mainthread.html`）を作成し、
  正常に初期化・USI通信ができることを確認。
- 上記の知見をもとに、Worker二段構成を廃止し、**メインスレッドから直接YaneuraOu()を呼び出す構成（`index-mainthread.html`）を採用**することを決定。
  エンジン内部が既にPThreadでマルチスレッド化されているため、メインスレッド側の追加Worker化は不要と判断。

**計測結果（Chrome、arashigaoka/YaneuraOu.wasm v0.1.2、評価関数 k-p-256-32-32、メインスレッド直接呼び出し方式）**

| 項目 | 結果 |
|---|---|
| crossOriginIsolated | true |
| WASM初期化時間 | 93.46ms |
| isready応答時間 | 27.92ms |
| go movetime 1000 | 1001.22ms（指定通り） |
| go movetime 3000 | 3004.51ms（指定通り） |
| MultiPV（3）動作 | 正常（multipv 1/2/3が並行して出力される） |
| UIブロック（思考中の最大フレーム間隔） | 17.38ms（理論値16.7ms、実質ブロックなしと判断） |

**既知の制限・要対応事項**
- 定跡ファイル（`book/standard_book.db`）を検証環境に同梱していないため `info string Error! : can't read file` の警告が出る。
  致命的ではないが、本番では `USI_OwnBook` を `false` にするか、定跡ファイルを別途用意する必要がある。
  戦形システムでは開始局面をSFEN指定する方針のため、定跡自体を使わない設計も検討可。
- スマートフォンのChromeでの動作確認は未実施。
- 本番候補エンジン（水匠5・hao）での同様の検証は未実施（現状の検証はarashigaoka版の軽量評価関数のみ）。

**M0（技術検証）の結論**: ブラウザ内でのYaneuraOu.wasm実行は技術的に成立することを確認。
アーキテクチャは「メインスレッド直接呼び出し」方式を採用する。M0の主要リスクは解消されたと判断し、
残る確認事項（本番エンジンでの検証・スマホ対応）を継続しつつ、M1（対局UI）に着手可能な状態とする。

#### 検証記録：本番候補エンジン（水匠5・hao）でのWASM実行（2026-07-12）

- npm上に `@mizarjp` 氏が公開しているYaneuraOu WASMビルド群を調査。アーキテクチャ別に複数パッケージが存在することが判明
  （`yaneuraou.halfkp` / `yaneuraou.halfkp.noeval` / `yaneuraou.halfkpe9.noeval` / `yaneuraou.k-p` 等）。
  パッケージ名と実際のビルドが指すアーキテクチャが一致しない場合があるため、`usi`応答の `id name` で実際のアーキテクチャを確認する必要がある。
- 当初 `@mizarjp/yaneuraou.halfkp` を試したところ、内部的に **HalfKPE9** アーキテクチャのビルドであることが判明し、
  水匠5・haoの `nn.bin`（`HalfKP(Friend)[125388->256x2]` アーキテクチャ）と不一致で読み込みエラーとなった。
  評価関数ファイルのバイナリヘッダーに埋め込まれた `Features=...` 文字列で、アーキテクチャの一致を事前確認できる。
- アーキテクチャが一致する **`@mizarjp/yaneuraou.halfkp.noeval`** に切り替えたところ、水匠5・haoともに正常動作を確認。
- **PThreadビルド特有の実装上の注意点**: モジュール初期化後に`FS.writeFile()`で評価関数を書き込むと、
  内部でプロキシされるスレッドからファイルが見えず読み込みに失敗する。`preRun`フックを使い、
  モジュール初期化（プロキシスレッド起動）より前に評価関数を仮想ファイルシステムへ書き込む必要がある。
- **評価関数の差し替えだけで別のAI人格に切り替え可能なことを実証**。同一のWASMエンジンバイナリのまま、
  `nn.bin`を水匠5用からhao用に差し替えるだけで動作した（エンジン本体＝探索アルゴリズムは共通、
  評価関数＝指し手の傾向・強さのみが変わる構造）。これは「敵の強さ・個性システム」の実装方針の技術的裏付けとなる。

**計測結果（Chrome、`@mizarjp/yaneuraou.halfkp.noeval` 7.6.3-alpha.0、メインスレッド直接呼び出し方式）**

| 項目 | 水匠5 (Suisho5) | hao |
|---|---|---|
| WASM初期化時間 | 293.94ms | 294.65ms |
| isready応答時間 | 1430.98ms | 1264.51ms |
| go movetime 1000 | 1001.07ms（指定通り） | - |
| go movetime 3000 | 3004.75ms（指定通り） | 3013.78ms（指定通り） |
| UIブロック（思考中の最大フレーム間隔） | 17.83ms | 17.80ms |

- isready応答時間が arashigaoka版（27.92ms）に比べて大幅に長い（約1.3〜1.4秒）。
  評価関数ファイル（64MB）の解析・展開処理に起因すると推定。対局開始時のローディングUI等での対応を検討する必要あり。
- UIブロック計測はarashigaoka版と同水準（約17.8ms、理論値16.7ms）で、実用上問題なし。

**既知の制限・要対応事項（更新）**
- Shinden3（振電3）はソースコードのみで、WASMビルドが存在しない。ビルド自体を別途行う必要がある。
  また正式ライセンス文書がない問題も未解決（開発者への確認待ち）。
- isready応答時間（約1.3〜1.4秒）の短縮、またはローディングUIでの吸収方針の検討が必要。

#### 次のステップ

1. isready応答時間短縮の可否を検証（Hashサイズ調整、評価関数の事前展開キャッシュ等）
2. スマートフォンのChromeでの動作確認（努力目標）
3. 定跡ファイル未同梱問題への対応方針を決定
4. Shinden3のライセンス確認・WASMビルド着手可否の判断
5. マイルストーン1（対局UIの最小構成）に着手

### 未着手

- マイルストーン2以降は未着手

---

## [Unreleased] マイルストーン1: 対局UIの最小構成（着手）

### Added
- `src/engine/engine.js`: USI通信ラッパー（`tools/m0-verification/index-mainthread.html`の
  `initEngine()`パターンを移植。メインスレッド直接呼び出し方式）
- `src/board-ui/board.js`: 盤面描画・駒移動UI（ルール判定は`shogi.js`(na2hiro, MIT)に委譲）
- `src/board-ui/main.js`: 対局UIとエンジンを繋ぐ最小ゲームループ（人間・先手 vs エンジン・後手）
- `src/board-ui/index.html`: 検証用ページ

### Changed
- `docs/PROJECT_PLAN.md`: 内容が`SYSTEM_DESIGN.md`と重複していた不具合を修正し、
  実際のマイルストーン計画（M0〜M5）を記載

### Notes
- 盤面ライブラリの選定: 既存の将棋盤JSライブラリを調査した結果、`shogi.js`
  （na2hiro/Kifu-for-JSモノレポ内、MIT license）を**ルールエンジンとして**採用。
  盤面の見た目（SVG描画）は自作する方針（README記載の技術スタック方針通り）。
  `kifu-for-js`自体はReact/MobX/react-dnd前提のため、本プロジェクトの
  素のJS/ティラノスクリプト構成には不採用とした

### 未着手（M1内の残タスク）
- 成り／不成り選択UI（仮の`window.confirm`から差し替え）
- 持ち駒を打つ操作のドラッグ&ドロップ対応
- 投了ボタン・詰み判定後の結果画面
- 駒・盤の画像素材（現状は暫定のテキスト表示）
- 本番評価関数（水匠5・hao）切り替え時のローディングUI

---

## [Unreleased] マイルストーン1: vendorセットアップとブラウザ実動作確認（2026-07-14）

### Added
- `src/board-ui/package.json`: `npm install shogi.js yaneuraou.wasm`用に作成
- `src/board-ui/server.js`: COOP/COEPヘッダー対応の開発用HTTPサーバー
  （`tools/m0-verification-suisho5/server.js`を移植、`.gitignore`対象）
- `board.js`の`applyUsiMove()`実装（USI形式の指し手文字列 `7g7f` / `P*5e` /
  成り`+`のパースと盤面反映）

### Fixed
- **shogi.jsは npm 配布物にビルド済みESMバンドルを含んでいない**ことが判明。
  `cjs/`（CommonJS、複数ファイル分割）のみ配布されているため、esbuildで
  ESM単一ファイルにバンドルして`vendor/shogi.esm.js`として配置する方式に変更
  （`src/board-ui/README.md`参照）
- `board.js`の下書き実装とshogi.jsの実APIとの不一致を修正:
  - 駒種`Kind`は実行時にはオブジェクトとして存在しない（TypeScript型のみ）。
    `Kind.FU`等への依存を排除し、`kindToString()`を使う表示に変更
  - `shogi.board[x][y]`（0-indexed配列への誤った1-indexedアクセス）を
    公開API`shogi.get(x, y)`に修正
  - 成り確認ダイアログが常に出ない不具合（`getMovesFrom()`が`promote`
    フィールドを返さない前提が誤りだった）を`Piece.canPromote(kind)`
    ベースの判定に修正
- **空きマスへのクリックが一切反応しない実装バグ**を修正。駒の`<g>`要素にしか
  `click`リスナーを付けていなかったため、移動先が空マスの着手が成立しなかった。
  全81マスに透明なクリック領域を敷く`_drawCellHitboxes()`を追加
- `yaneuraou.data`が`vendor/`配下だけでは`404`になる問題に対応
  （`.data`はHTMLドキュメント基準の相対パスで解決されるため、
  `src/board-ui/`直下にも配置。詳細は`docs/AGENTS.md`「実装上の既知の罠」の
  必須知識」7.参照）
- 開発用サーバーのドキュメントルートを`src/board-ui`ではなく`src/`に変更
  （`main.js`が`../engine/engine.js`を相対importするため）

### Notes
- Playwright（ヘッドレスChromium）でボードをクリック操作し、人間の着手→
  エンジンの応答→手番復帰までの対局ループがブラウザ上で成立することを確認済み
- 現`docs/AGENTS.md`に上記`yaneuraou.data`のパス解決の落とし穴を記録

---

## [Unreleased] マイルストーン1: 投了ボタン・詰み判定・結果画面（2026-07-14）

### Added
- `src/board-ui/index.html`: 投了ボタン(`#resign-button`)と結果表示オーバーレイ
  (`#result-overlay`)を追加
- `src/board-ui/board.js`: `hasLegalMoves(color)`を追加。詰み・打ち歩詰め以外の
  「指せる手がない」局面を検出する
  - shogi.jsの`getMovesFrom`/`getDropsBy`は盤外・自駒取りのみ除外し、王手放置となる手を
    除外しない（ライブラリのコメント通り）。そのため候補手ごとに現局面をSFEN文字列で
    複製した一時的な`Shogi`インスタンスに適用し、適用後も自玉が王手されたままかを
    `isCheck()`で確認して真の合法手のみをカウントする方式にした
  - 単純に`move()`→`unmove()`で本体を直接シミュレートする案は、`move()`が
    「行き所のない駒」を強制成りさせるケースで`unmove()`に渡す`promote`引数と
    実際の成り状態が食い違い、盤面が壊れるリスクがあったため採用しなかった
  - `board.lock()`を追加。対局終了後は盤面・持ち駒のクリックを一切受け付けなくする
- `src/board-ui/main.js`: 投了ボタンのハンドラ、人間/エンジンそれぞれの着手後に
  相手の`hasLegalMoves()`を確認して詰みを検出する処理、結果オーバーレイの表示処理を追加

### Fixed
- `#result-overlay`のCSSで`display: flex`をIDセレクタに直接指定していたため、
  `hidden`属性（UAスタイルシートの`[hidden]{display:none}`、属性セレクタで詳細度が低い）
  より優先されてしまい、対局中でもオーバーレイが常時最前面に表示され投了ボタンの
  クリックを吸収してしまう不具合があった。`#result-overlay:not([hidden])`セレクタに
  `display: flex`を移すことで修正

### Notes
- Playwrightで投了ボタンクリック→結果オーバーレイ表示→ボタン無効化までの流れを確認済み

### 未着手（M1内の残タスク、更新）
- 持ち駒を打つ操作のドラッグ&ドロップ対応
- 駒・盤の画像素材（現状は暫定のテキスト表示）
- 本番評価関数（水匠5・hao）切り替え時のローディングUI

---

## [Unreleased] マイルストーン1: 成り／不成り選択UIの本実装（2026-07-14）

### Added
- `src/board-ui/board.js`: `_promptPromotion()`を追加。仮実装だった`window.confirm`を、
  盤面コンテナに重ねて表示する自前のオーバーレイダイアログ（「成る」/「成らない」ボタン）に
  差し替えた。ダイアログ表示中は`_awaitingPromotion`フラグで盤面クリックを無視する

### Changed
- `src/board-ui/board.js`の`_tryMove()`: 成り判定を`Shogi.getIllegalUnpromotedRow()`/
  `Shogi.getRowToOppositeEnd()`（shogi.js内部の「行き所のない駒」判定と同じ基準の静的メソッド、
  クラス自体に生えているためimport後もアクセス可能なことを確認済み）で「強制成り」かどうかを
  先に判定するよう変更。強制成り（最終段の歩・香、最終2段の桂等）の場合はダイアログを出さず
  自動的に成り、選択の余地がある場合のみダイアログを表示する

### Notes
- Playwrightで3パターン（選択で成る／選択で成らない／強制成りでダイアログが出ない）を
  それぞれ検証済み。強制成りのケースでは想定通りダイアログが表示されず、USI形式の指し手
  （例: `5b5a+`）も正しく成り記号付きで生成されることを確認した

---

## [Unreleased] マイルストーン1: 持ち駒選択の駒種別クリック対応（2026-07-14）

### Changed
- `src/board-ui/board.js`: `_drawHandPiece()`を追加し、持ち駒を駒種ごとに個別のSVG要素
  として描画するよう変更。旧実装は持ち駒全体を1つの`<text>`にまとめており、クリックすると
  常に`hand[0]`＝先頭の駒種が選択されてしまう不具合があったため修正

### Notes
- 当初はドラッグ&ドロップでの打ち駒操作も実装したが、誤操作（意図せず盤外にドロップして
  何も起きない、他の駒に触れて誤爆する等）の懸念からユーザー判断で見送り、従来通り
  「持ち駒をクリックして選択→着手先マスをクリック」の2段階操作のみを採用することにした
- Playwrightで検証: 複数駒種を持つ状態で2枚目（角）をクリック→正しく角が選択され、
  着手先マスのクリックで`B*5e`が生成され、飛車は持ち駒に残ったままになることを確認

### 未着手（M1内の残タスク、更新）
- 駒・盤の画像素材（現状は暫定のテキスト表示）
- 本番評価関数（水匠5・hao）切り替え時のローディングUI

---

## [Unreleased] マイルストーン1: エンジン初期化中のローディングUI（2026-07-14）

### Added
- `src/board-ui/index.html`: `#loading-overlay`（スピナー＋メッセージ）を追加。
  `#result-overlay`と同様、`[hidden]`とID選択子の詳細度が競合しないよう
  `#loading-overlay:not([hidden])`にのみ`display: flex`を設定する形にした
- `src/board-ui/main.js`: `setLoading()`を追加し、`engine.init()`（エンジン初期化）〜
  `engine.ready()`（`isready`応答待ち、本番評価関数では約1.3〜1.4秒かかる。
  現`docs/AGENTS.md`参照）の間、ローディングオーバーレイでUIを隠すようにした。
  `engine.newGame()`実行後にオーバーレイを非表示にする
- 初期化失敗時（`main().catch`）もローディングオーバーレイにエラーメッセージを
  表示するよう変更（従来は`#status`テキストのみでオーバーレイが表示されたまま残っていた）

### Notes
- M1時点では軽量版(arashigaoka)を使用しているため実際の待ち時間は短いが、本番評価関数
  （水匠5・hao）へ`nnuePath`を指定して差し替えた際に効果を発揮する設計
- Playwrightで検証: ページ読み込み直後はオーバーレイが表示されメッセージが
  「エンジンを初期化中...」であること、`isready`完了後（`あなたの番です`表示時）には
  オーバーレイが非表示になることを確認

### 未着手（M1内の残タスク、更新）
- 駒・盤の画像素材（現状は暫定のテキスト表示）

---

## [Unreleased] マイルストーン1: 王手放置の着手拒否と自動テスト（2026-07-14）

### Added
- `src/board-ui/legal-moves.mjs`: SFENから複製した盤面へ候補手を適用し、着手後に
  自玉が王手されていないことを確認する共通合法手フィルターを追加
- `src/board-ui/test/legal-moves.test.mjs`: ピンされた駒の移動、王手中の合駒、
  判定時の盤面非破壊を確認するNode.jsテストを追加

### Fixed
- `shogi.js`の`getMovesFrom()`が王手放置を除外しないため、プレイヤーが自玉を
  王手された状態にする手を指せた問題を修正。盤上移動と持ち駒打ちの両方に適用した

### Changed
- `package.json`のライセンス表記をプロジェクト方針に合わせてGPL-3.0へ修正
- 対局UI READMEの完了済み項目とテスト手順を更新

---

## 記録テンプレート（今後のマイルストーン完了時に使用）

```markdown
## [YYYY-MM-DD] マイルストーンN: タイトル

### Added
- 追加した機能・ファイル

### Changed
- 変更した設計・仕様

### Fixed
- 修正した不具合

### Notes
- 検証結果・判明した制約事項など
```
