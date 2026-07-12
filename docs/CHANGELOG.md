# CHANGELOG

このプロジェクトの意思決定・進捗をマイルストーン単位で記録します。
書式は概ね [Keep a Changelog](https://keepachangelog.com/) に準拠しつつ、
設計方針の決定事項も残します。

## [Unreleased]

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
- 敵の強さは評価関数・思考時間・ノード数制限・MultiPVによる手のランク制御の組み合わせで表現
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

- マイルストーン1以降は未着手（M0完了を受けて次に着手予定）

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