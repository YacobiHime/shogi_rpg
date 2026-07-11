# M0技術検証環境

マイルストーン0「技術検証」のためのYaneuraOu WASM検証環境です。

## 目的

- YaneuraOu.wasmをブラウザのWeb Worker上で動作させる
- USIプロトコルによる通信を確認する
- 思考時間・ノード数・MultiPVによる強さ調整を確認する
- Chromeでの動作速度を計測する

## 使用しているWASMビルド

arashigaoka/YaneuraOu.wasm v0.1.2（npmパッケージ）
- 作者: arashigaoka 氏（Yuta Okumura、yaneurao/YaneuraOuのフォーク）
- URL: https://www.npmjs.com/package/yaneuraou.wasm
- ライセンス: GPL-3.0
- 評価関数: k-p-256-32-32（軽量版、yaneurao/YaneuraOu 2019/01/15リリース）

**注意**: これはマイルストーン0の技術検証用です。本番の評価関数として採用することを目的としていません。

**mizar版検証失敗による採用**: mizar/YaneuraOu.wasm（PThread使用、SharedArrayBuffer必須）が動作しなかったため、技術検証目的でarashigaoka版（シングルスレッド版）を使用しています。

## セットアップ手順

### 1. 依存関係のインストール

```bash
cd tools/m0-verification
npm install
```

npmパッケージ `yaneuraou.wasm` がインストールされます。

### 2. WASMファイルの配置

npmパッケージからWASMファイルをコピーします：

```bash
cd tools/m0-verification
cp node_modules/yaneuraou.wasm/yaneuraou.js .
cp node_modules/yaneuraou.wasm/yaneuraou.wasm .
cp node_modules/yaneuraou.wasm/yaneuraou.data .
```

現在のディレクトリ構成：

```
tools/m0-verification/
  ├── index.html                   （検証用UI）
  ├── worker.js                    （Web Worker）
  ├── server.js                    （COOP/COEP HTTPサーバー）
  ├── README.md                    （本ファイル）
  ├── yaneuraou.js                 （WASMローダー、npmからコピー）
  ├── yaneuraou.wasm               （WebAssemblyバイナリ、npmからコピー）
  ├── yaneuraou.data               （評価関数データ、npmからコピー）
  └── node_modules/                （npmパッケージ）
```

### 3. Webサーバーの起動

```bash
cd tools/m0-verification
node server.js
```

`server.js`はCOOP/COEPヘッダー対応の簡易HTTPサーバーです。

### 4. ブラウザでアクセス

Chromeで以下のURLにアクセスしてください：

http://localhost:8000/index.html

## 検証項目

### 基本的なUSI通信
- [ ] Worker初期化が正常に完了する
- [ ] `usi` コマンドで `usiok` が返ってくる
- [ ] `isready` コマンドで `readyok` が返ってくる
- [ ] `usinewgame` → `position startpos` → `go movetime 1000` で `bestmove` が返ってくる

### 強さ調整パラメータ
- [ ] `go movetime` で思考時間を変えた場合に応答時間が比例する
- [ ] `setoption name MultiPV value N` で複数候補手が取得できる

### 速度計測
- [ ] WASM初期化〜`isready`応答までの時間
- [ ] `go movetime 1000` 実行時の実測レスポンス時間
- [ ] 評価関数ファイルのロード時間

## 予想されるUSIコマンドシーケンス

```
usi
→ usiok

isready
→ readyok

usinewgame
→ (応答なし)

position startpos
→ (応答なし)

go movetime 1000
→ info ... (思考情報)
→ bestmove 2g2f (例)
```

## 注意事項

- この検証環境で使用している評価関数はk-p-256-32-32（軽量版）です
- WASMファイルは.gitignoreに登録されており、リポジトリにはコミットされません
- 検証結果は `docs/CHANGELOG.md` の `[Unreleased]` セクションに記録してください

## mizar版検証の経緯（参考）

mizar/YaneuraOu.wasm v7.6.3-alpha.0の検証を試みましたが、以下の理由で採用を見送りました：

- mizar版はPThread（マルチスレッド）を使用しており、SharedArrayBufferが必須
- COOP/COEPヘッダーを設定してもSharedArrayBufferが有効にならず、WASM初期化に失敗
- Chromeの機能フラグ（Experimental WebAssembly features）でも解決せず

詳細は `docs/CHANGELOG.md` および `docs/ASSETS_CREDITS.md` を参照してください。
