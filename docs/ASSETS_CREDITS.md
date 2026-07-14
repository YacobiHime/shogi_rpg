---
title: 素材・クレジット台帳
layout: default
nav_order: 9
---

# ASSETS / CREDITS

本プロジェクトで使用する外部素材・ソフトウェア（画像・音声・エンジン・評価関数等）と、
そのライセンス・出典を記録する台帳です。**素材を追加するたびに必ず追記してください。**
出典・ライセンス情報は後から追跡するのが困難なため、追加時点での記録を徹底します。

## 記入ルール

- 1素材につき1エントリを追加する
- 「ライセンス」欄は必ずライセンス名（CC BY-SA 4.0 等）とバージョンを明記する
- クレジット表記が必要なライセンスの場合、「表記要否」を "要" にし、実際にゲーム内クレジット画面に
  掲載する文言を「表記文言」に記載する
- 再配布不可・支援者限定配布のものは同梱しない（別途「使用不可素材リスト」に記録し、理由を残す）

## テンプレート

```markdown
### [素材名]

- 種別: 画像 / 音声 / エンジン / 評価関数 / フォント / その他
- 入手元URL:
- 制作者・団体:
- ライセンス:
- 表記要否: 要 / 不要
- 表記文言（要の場合）:
- 使用箇所:
- 追加日:
```

---

## ソフトウェア・エンジン

### YaneuraOu（やねうら王）

- 種別: 将棋AIエンジン
- 入手元URL: https://github.com/yaneurao/YaneuraOu
- 制作者: やねうらお 氏 他
- ライセンス: GPLv3系（Stockfish / Apery / SilentMajority 由来コードを含むため、それらのライセンスに従う）
- 表記要否: 要（GPLv3に基づくライセンス表記・ソースコード開示義務あり）
- 使用箇所: 敵AIの対局思考エンジン（YaneuraOu.wasmとして組み込み）
- 追加日: （記入）

### YaneuraOu.wasm（WASMビルド）

- 種別: 将棋AIエンジン（WASM移植版）
- 入手元URL: https://github.com/mizar/YaneuraOu.wasm
- 制作者: mizar 氏
- ライセンス: 元プロジェクト（YaneuraOu）のライセンスに準拠（GPLv3系）
- 表記要否: 要
- 使用箇所: ブラウザ内での将棋AI実行（Web Worker）
- 追加日: （記入）

### YaneuraOu.wasm（mizar版、検証失敗・採用見送り）

- 種別: 将棋AIエンジン（WASMビルド）
- 入手元URL: https://github.com/mizar/YaneuraOu.wasm/releases/tag/v7.6.3-alpha.0
- Releaseファイル: Suisho5-YaneuraOu.wasm-v7.6.3-alpha.0-wasm.zip, SuishoPetite-YaneuraOu.wasm-v7.6.3-alpha.0-wasm.zip
- 制作者: mizar 氏
- ライセンス: **GPLv3**（元プロジェクトであるYaneuraOuのライセンスに準拠）
- 評価関数: 水匠5 (Suisho5) HalfKP NNUE、SuishoPetite k-p NNUE
- **検証結果**: 採用見送り
  - mizar版のWASMビルドはPThread（マルチスレッド）を使用しており、SharedArrayBufferが必須
  - COOP/COEPヘッダーを設定してもSharedArrayBufferが有効にならず、WASM初期化に失敗
  - Chromeの機能フラグ（Experimental WebAssembly features）でも解決せず
  - 技術検証の目的を達成するため、arashigaoka版（シングルスレッド版）に戻した
- **重要**: mizar版の使用はM0技術検証の試行に過ぎず、本番採用を意味するものではありません
- 表記要否: 要（検証失敗の記録として残す）
- 使用箇所: 検証のみで本番配布には組み込まない
- 検証日: 2026-07-11
- 結果: 失敗（SharedArrayBuffer/PThread問題により採用見送り）

### YaneuraOu.wasm（arashigaoka版、M0技術検証用）

- 種別: 将棋AIエンジン（WASMビルド）
- 入手元URL: https://www.npmjs.com/package/yaneuraou.wasm（npmパッケージ、v0.1.2）
- 制作者: arashigaoka 氏（Yuta Okumura、yaneurao/YaneuraOuのフォーク）
- ライセンス: **GPL-3.0**（確認済み。npmパッケージのpackage.jsonおよびREADME.mdより確認）
- 評価関数: k-p-256-32-32（軽量版、yaneurao/YaneuraOu 2019/01/15リリース）
- **重要**: これはマイルストーン0の技術検証（WASM実行・Web Worker通信・USIプロトコル・速度計測）のための一時的な使用であり、arashigaoka版に同梱されている評価関数(k-p-256-32-32)を本番配布用の評価関数として採用するものではありません
- **mizar版検証失敗による採用**: mizar版がSharedArrayBuffer/PThread問題で動作しなかったため、技術検証目的でarashigaoka版（シングルスレッド版）を使用
- 本番評価関数は引き続き「水匠5」「Hao（Háo）」「リゼロ評価関数」から検討する
- 表記要否: 要（検証専用ツールとしての記録。本番配布には組み込まない）
- 使用箇所: /tools/m0-verification/ 配下での技術検証用
- 追加日: 2026-07-11

### shogi.js

- 種別: 将棋ルールエンジン（JavaScriptライブラリ）
- 入手元URL: https://github.com/na2hiro/Kifu-for-JS/tree/master/packages/shogi.js（npmパッケージ名: `shogi.js`）
- 制作者: na2hiro 氏
- ライセンス: **MIT**
- 表記要否: 不要（MITのためクレジット表記は必須ではないが、慣行として掲載を推奨）
- 使用箇所: 対局UIの合法手判定・成り／持ち駒・SFEN変換（`src/board-ui/board.js`）。
  npm配布物にビルド済みESMバンドルが含まれないため、esbuildで単一ESMファイルに
  バンドルした上で`src/board-ui/vendor/shogi.esm.js`として配置（`.gitignore`対象、
  配布物には含まれる。手順は`src/board-ui/README.md`参照）
- 追加日: 2026-07-14

## 評価関数（NNUEファイル）

### リゼロ評価関数

- 種別: 評価関数ファイル
- 入手元URL: （やねうら王プロジェクト内で配布。要URL確認）
- 制作者: やねうら王プロジェクト
- ライセンス: 権利主張なし、自由使用可
- 表記要否: 不要（ただし出典明記を推奨）
- 使用箇所: 敵AIの評価関数（強さの階層のベース）
- 追加日: （記入）

### Hao（Háo）評価関数

- 種別: 評価関数ファイル（標準NNUE、halfkp_256x2-32-32型）
- 入手元URL: https://github.com/nodchip/tanuki-/releases
- 制作者: nodchip 氏（tanuki-シリーズ開発者）
- ライセンス確認状況: **確認済み（2026年時点）**
  - `nodchip/tanuki-` リポジトリの正式なGitHub Releaseとして公開。無料・無条件でダウンロード可能
  - リポジトリ本体はやねうら王同様GPLv3系と思われるが、LICENSEファイルの内容は実装前に念のため再確認すること
- 表記要否: 要（提供者クレジット表記を推奨）
- 使用箇所: 敵AIの評価関数（無償公開の中では最強クラスとされる階層）
- 使用エンジン: `shogiAI/hao/`（やねうら王ベース探索部と組み合わせて使用）
- 確認日: 2026-07-09

### 振電3（Shinden3）評価関数

- 種別: 評価関数ファイル（振り飛車特化型）
- 制作者: たややん 氏（水匠開発者）提供
- ライセンス確認状況: **要確認**
- 使用箇所: 敵AIの評価関数（振り飛車特化・強豪クラスの階層）
- 使用エンジン: `shogiAI/Shinden3/`（WASM対応コードも同梱、マイルストーン0のWASMビルド検証に活用）

### 水匠5 評価関数（Suisho5）

- 種別: 評価関数ファイル（NNUE_halfKP256型）
- 入手元URL: https://github.com/yaneurao/YaneuraOu/releases/tag/suisho5
- 制作者: たややん 氏（水匠開発者）、やねうら王プロジェクト経由で提供
- ライセンス確認状況: **確認済み（2026年時点）**
  - `yaneurao/YaneuraOu` リポジトリの正式なReleaseとして公開。ログイン・課金不要でダウンロード可能
  - ページ上に再配布禁止・個人利用限定等の制限記載なし
  - リポジトリ全体の方針（Stockfish由来コード含む、GPLv3系）に準ずるものとして扱う
  - 同ページに「やねうら王に支援してもっと強い評価関数を入手する」という支援者向け導線があり、
    **これが無料版（水匠5まで）と支援者限定版（水匠10beta等）の境界線**であることを確認済み
- 表記要否: 要（提供者クレジット表記を推奨。「水匠5 評価関数 by たややん」等）
- 使用箇所: 敵AIの評価関数（強豪クラスの階層）
- 使用エンジン: `shogiAI/Suisho5/`（やねうら王ベース探索部と組み合わせて使用）
- **本プロジェクトで使用する水匠は5のみとする**。水匠6以降は支援者限定配布のため対象外
- 確認日: 2026-07-09

## 将棋盤・駒画像

- （未選定：Wikimedia Commons上のCC BY-SA駒画像等を候補として調査中。選定後に本セクションへ追記）

## RPG演出用素材（キャラクター・背景・BGM・SE等）

- （未選定）

## フォント

- （未選定）

---

## 使用不可・使用見送り素材リスト

将来的に「使えると思ったが使用不可だった」ものを記録し、同じ調査を繰り返さないようにする。

| 名称 | 理由 | 確認日 |
|---|---|---|
| 水匠6以降（水匠10beta等含む） | やねうら王支援者限定配布（GitHub Sponsors/FANBOX経由）のため、無償同梱不可 | 2026-07-09 |

**本プロジェクトで使用する評価関数は「水匠5」「Hao（Háo）」「振電3」「リゼロ評価関数」の4種**とする。

---

## クレジット画面掲載文言（ドラフト）

ゲーム内クレジット画面に掲載する想定の文言をまとめておく場所です。実装時にそのまま利用できるよう整理します。

```
将棋AIエンジン: やねうら王 (YaneuraOu) / GPLv3
YaneuraOu.wasm by mizar
評価関数: リゼロ評価関数 (やねうら王プロジェクト)
評価関数: 水匠5 by たややん (やねうら王プロジェクト経由で提供)
評価関数: Hao (Háo) by nodchip (tanuki-プロジェクト)
評価関数: 振電3 by たややん
（画像・音楽等の素材クレジットは追加され次第ここに追記）
```