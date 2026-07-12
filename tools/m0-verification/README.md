# M0技術検証環境（arashigaoka版）

マイルストーン0「技術検証」のためのYaneuraOu WASM検証環境です。
軽量な評価関数（k-p-256-32-32）を使った、最初の動作確認用です。

本番候補エンジン（水匠5・hao）の検証は `tools/m0-verification-suisho5/` を参照してください。

## 目的

- YaneuraOu.wasmをブラウザ上で動作させる
- USIプロトコルによる通信を確認する
- 思考時間・ノード数・MultiPVによる強さ調整を確認する
- Chromeでの動作速度・UIブロック具合を計測する

## 使用しているWASMビルド

arashigaoka/YaneuraOu.wasm v0.1.2（npmパッケージ）
- 作者: arashigaoka 氏（yaneurao/YaneuraOuのフォーク）
- URL: https://www.npmjs.com/package/yaneuraou.wasm
- ライセンス: GPL-3.0
- 評価関数: k-p-256-32-32（軽量版、yaneurao/YaneuraOu 2019/01/15リリース）

**注意**: これはマイルストーン0の技術検証用です。本番の評価関数として採用することを目的としていません。

**訂正（2026-07-12）**: 当初「シングルスレッド版」と記載していましたが誤りでした。
実際はPThread（マルチスレッド、Threads最大32）を使用するビルドです。npmパッケージ同梱の
README.mdに `Threads: 32` 等の記載があり確認済み。詳細は `docs/CHANGELOG.md` を参照。

## アーキテクチャ決定：メインスレッド直接呼び出し方式

**当初の`worker.js`（Web Worker内からYaneuraOu()を呼ぶ構成）は`Uncaught TypeError: Failed to execute
'createObjectURL' on 'URL': Overload resolution failed`エラーで動作しませんでした。**
原因は、Worker内から更にPThread用のサブWorkerを生成する「入れ子Worker構成」にあると推定されます。

切り分けの結果、**Web Workerを一切使わず、メインスレッドから直接`YaneuraOu()`を呼び出す方式**であれば
正常動作することを確認しました。エンジン内部が既にPThreadでマルチスレッド化されているため、
追加のWorker化は不要と判断し、この方式を採用しています。

実測では、3秒間の思考中でもUIのフレーム間隔は理論値（16.7ms）とほぼ同じ17.4ms程度に収まっており、
UIブロックは実質的に問題ないレベルです。

## ディレクトリ構成

```
tools/m0-verification/
  ├── index-mainthread.html    （検証用UI・採用方式。メインスレッド直接呼び出し）
  ├── test-mainthread.html     （最小限の切り分け用テストページ）
  ├── index.html                （旧：Worker経由方式、動作しない。経緯の記録として残置）
  ├── worker.js                 （旧：Worker経由方式のWorkerコード。動作しない）
  ├── server.js                 （COOP/COEP対応HTTPサーバー。★各自作成が必要、.gitignore対象）
  ├── README.md                 （本ファイル）
  ├── yaneuraou.js               （WASMローダー、npmからコピー。.gitignore対象）
  ├── yaneuraou.wasm             （WebAssemblyバイナリ、npmからコピー。.gitignore対象）
  ├── yaneuraou.data             （評価関数データ、npmからコピー。.gitignore対象）
  └── node_modules/              （npmパッケージ。.gitignore対象）
```

**現在使うべきなのは `index-mainthread.html` です。** `index.html` と `worker.js` は
入れ子Worker構成が動作しなかった経緯を残すために置いていますが、動作しません。

## セットアップ手順

### 1. 依存関係のインストール

```bash
cd tools/m0-verification
npm install
```

### 2. WASMファイルの配置

```bash
cd tools/m0-verification
cp node_modules/yaneuraou.wasm/yaneuraou.js .
cp node_modules/yaneuraou.wasm/yaneuraou.wasm .
cp node_modules/yaneuraou.wasm/yaneuraou.data .
```

### 3. server.jsの作成

`server.js`は`.gitignore`対象のためリポジトリに含まれていません。以下の要件を満たすHTTPサーバーを
このディレクトリに用意してください（要件の理由は下記「ハマりどころ」を参照）：

- `Cross-Origin-Opener-Policy: same-origin` と `Cross-Origin-Embedder-Policy: require-corp` を返す
- 全レスポンスに `Content-Length` ヘッダーを明示的に設定する（`fs.stat`のサイズを使う）
- ポート8000で起動（`tools/m0-verification-suisho5/server.js`はポート8001を使うため、同時起動可能）

`tools/m0-verification-suisho5/server.js`に実装例があるので、それを参考にコピー・調整してください。

### 4. Webサーバーの起動

```bash
node server.js
```

### 5. ブラウザでアクセス

Chromeで以下のURLにアクセスしてください：

http://localhost:8000/index-mainthread.html

## ハマりどころ（このディレクトリでの検証で判明した注意点）

1. **Worker内からWorkerを生成する構成は避ける**。`createObjectURL`のOverload resolutionエラーで
   無音に失敗する。メインスレッド直接呼び出し方式を使うこと。
2. **HTTPサーバーは`Content-Length`ヘッダーを明示的に返す必要がある**。Node.jsのデフォルトの
   chunked転送のままだと、大きなファイル（評価関数等）の`HEAD`リクエストでサイズが取得できず、
   WASM側のファイル取得ロジックが失敗する。
3. 詳細な計測結果・経緯は `docs/CHANGELOG.md` の該当セクションを参照。

## 検証項目チェックリスト

- [x] メインスレッド初期化が正常に完了する
- [x] `usi` コマンドで `usiok` が返ってくる
- [x] `isready` コマンドで `readyok` が返ってくる
- [x] `usinewgame` → `position startpos` → `go movetime 1000` で `bestmove` が返ってくる
- [x] `go movetime` で思考時間を変えた場合に応答時間が比例する
- [x] `setoption name MultiPV value N` で複数候補手が取得できる
- [x] WASM初期化〜`isready`応答までの時間を計測
- [x] `go movetime 1000` 実行時の実測レスポンス時間を計測
- [x] 思考中のUIブロック具合（フレーム間隔）を計測

計測結果は `docs/CHANGELOG.md` に記録済みです。

## 注意事項

- WASMファイル・`node_modules`・`server.js`は`.gitignore`に登録されており、リポジトリにはコミットされません
- 検証結果は `docs/CHANGELOG.md` の該当マイルストーンセクションに記録してください