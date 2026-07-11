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
  - 結論: 技術検証の目的を達成するため、arashigaoka版（シングルスレッド版）を使用

#### 次のステップ

1. Webサーバーを起動: `cd tools/m0-verification && node server.js`
2. Chromeで http://localhost:8000/index.html にアクセス
3. USI通信・強さ調整・速度計測の検証を実施
4. 結果を本セクションに記録

### 未着手

- マイルストーン1以降は未着手

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