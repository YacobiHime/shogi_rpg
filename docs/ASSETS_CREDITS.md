---
title: 素材・クレジット台帳
layout: default
nav_order: 9
---

# ASSETS / CREDITS

本プロジェクトに含まれる外部ソフトウェア・素材と、その出典・利用条件を記録する台帳です。
これは法的助言ではありません。公開前には、実際の配布ファイルと本台帳を再照合します。

## 監査状況（2026-07-19）

現在のFirebase Hostingビルドが配布する主な外部要素は、YaneuraOuのWASMビルド、
YaneuraOu公式リリースの標準定跡DB、`shogi.js`のバンドル、およびティラノスクリプトの
ランタイムです。外部NNUEファイルは現在配布していません。

`tools/build-hosting.mjs`は、ルートの`LICENSE`と本台帳を配布物へ同梱します。vendor資産は
明示したファイルだけを許可し、NNUEは`data/enemies.json`から参照されるファイルだけをコピーします。

公開前に解決が必要な事項:

1. GPLのWASMバイナリについて、配布した版に対応する完全なソースコードを同じ配布場所から
   取得できるようにする。
2. `tyrano/`へ取り込んだランタイムの正確な配布版と、同梱ライブラリの版・ライセンス全文を
   固定した第三者通知を用意する。
3. リポジトリに残るティラノ公式サンプル素材を、自作または再配布可能と確認した素材へ
   差し替える。現在のHostingビルドは許可したキャラクター画像、標準定跡DB、敵マスタが参照する
   NNUEだけを`assets/`からコピーするが、公開リポジトリ自体からの二次配布可否は別途解決が必要。
4. `standard_book.db`は公式リリースの取得アーカイブ内に個別の`LICENSE`がないため、
   親リポジトリのGPL-3.0を同ファイルへ適用して再配布できる根拠と出自を公開前に再確認する。
5. Hosting対象外でも、Git追跡済みの`ShogiAI/Shinden3/source/`と`stir131/Stirling.exe`は
   公開リポジトリ経由の配布になる。各ファイルの出自・版・再配布条件を確定するまで公開リスクとして扱う。

## 記入ルール

- 追加前に、入手元、制作者、正確なライセンス名・版、再配布可否を確認する。
- 「ページに禁止と書かれていない」だけでは再配布許可済みと扱わない。
- GPL等で対応ソースの提供が必要なバイナリは、使用した版・ビルド手順・ソース提供場所を記録する。
- 独自利用規約の素材は、プロジェクト本体のGPLへ再ライセンスせず、個別条件を明記する。
- 再配布不可、支援者限定、または条件不明の素材は配布物へ含めない。

## プロジェクト本体

### shogi_rpg

- 種別: ゲーム本体
- 制作者: YacobiHimeおよび本プロジェクトの貢献者
- ライセンス: GPL-3.0-or-later
- ライセンス全文: `/LICENSE`
- 自作範囲: ゲーム固有のJavaScript、シナリオ、データ、SVG盤・駒
- 注意: 下記の外部要素には各項目の個別条件が適用される

## 将棋エンジン・ルールライブラリ

### yaneuraou.wasm 0.1.2（通常版）

- 種別: 将棋AIエンジンのWASMビルド
- 入手元: https://www.npmjs.com/package/yaneuraou.wasm
- ソース: https://github.com/arashigaoka/YaneuraOu.wasm
- 制作者: Yuta Okumura（arashigaoka）、YaneuraOuの開発者・貢献者
- ライセンス: GPL-3.0（npmパッケージの`package.json`と`Copying.txt`で確認）
- 使用箇所: `src/board-ui/vendor/yaneuraou.*`
- 用途: 内蔵評価を使う通常敵、およびHalfKP初期化失敗時のフォールバック
- 表記要否: 要
- 対応ソース: 公開前に、配布バイナリと一致するソース一式の提供方法を確定する
- 追加日: 2026-07-11

### @mizarjp/yaneuraou.halfkp.noeval 7.6.3-alpha.0

- 種別: 外部評価関数を読むHalfKP版のWASMビルド
- 入手元: https://www.npmjs.com/package/@mizarjp/yaneuraou.halfkp.noeval
- ソース: https://github.com/mizar/YaneuraOu.wasm
- 制作者: mizar、YaneuraOuの開発者・貢献者
- ライセンス: GPL-3.0（npmパッケージメタデータで確認）
- 使用箇所: `src/board-ui/vendor/yaneuraou.halfkp.noeval.*`
- 表記要否: 要
- 対応ソース: 公開前に、配布バイナリと一致するソース一式の提供方法を確定する
- 追加日: 2026-07-14

### YaneuraOu（上流）

- 種別: 将棋AIエンジン
- 入手元・ソース: https://github.com/yaneurao/YaneuraOu
- 制作者: やねうらお、および各上流プロジェクトの開発者・貢献者
- ライセンス: GPL-3.0
- 使用箇所: 上記WASMビルドの上流
- 表記要否: 要

### shogi.js 5.5.0

- 種別: 将棋ルールライブラリ
- 入手元: https://www.npmjs.com/package/shogi.js
- ソース: https://github.com/na2hiro/Kifu-for-JS/tree/master/packages/shogi.js
- 制作者: na2hiro
- ライセンス: MIT
- 使用箇所: 合法手判定、成り、持ち駒、SFEN変換。
  `src/board-ui/vendor/shogi.esm.js`へバンドルして配布
- ライセンス表示: バンドル末尾の`Bundled license information`に保持
- 追加日: 2026-07-14

## 将棋定跡データ

### YaneuraOu v4.73_book `standard_book.db`

- 種別: やねうら王形式の標準定跡DB
- 公式入手元: https://github.com/yaneurao/YaneuraOu/releases/tag/v4.73_book
- 配布ファイル: `assets/books/standard_book.db`
- 使用箇所: 対局開始時にWASM仮想FSの`/user_book1.db`へ配置し、敵専用定跡がない対局で使用
- ファイルサイズ: 13,512,347 bytes
- SHA-256: `5714F4FADB3DA6E8F1E7D9261ADDC88ED3CCE4F5269D061A02CFDA3EAB46ECDB`
- ライセンス確認状況: 取得アーカイブ内に同ファイル用の別`LICENSE`はない。
  現在は親リポジトリYaneuraOuのGPL-3.0対象として扱う
- 公開前確認: 公式リリース由来であることと、親リポジトリのGPL-3.0に基づく再配布条件を
  再確認し、必要な対応ソース・表示方法を確定する
- 表記要否: 要
- 追加日: 2026-07-19

## ノベルエンジン

### ティラノスクリプト

- 種別: HTML5ノベルゲームエンジン
- 公式サイト: https://tyrano.jp/
- ソース: https://github.com/ShikemokuMK/tyranoscript
- 制作者: ShikemokuMK / STRIKEWORKS
- 取り込み版の識別情報: `system/Config.tjs`は6.00、KAGランタイムは5.20を示す。
  正確な配布版・コミットは未固定
- 利用条件: 公式サイトでは無料、商用利用可、ゲーム開発目的の改造可、連絡・クレジット不要と案内
- 使用箇所: `tyrano/`、`system/`、`scenario/`
- 表記要否: 公式FAQ上は不要。本台帳では出典を表示する
- 注意: 標準的なSPDXライセンスとしてではなく、公式の独自利用条件として記録する

### ティラノランタイム同梱ライブラリ

`tyrano/libs/`等には複数の第三者ライブラリが含まれます。ソースヘッダーから確認できた
代表例は次のとおりです。

| ライブラリ | ローカル識別情報 | ライセンス |
|---|---|---|
| jQuery | 3.6.0 | MIT |
| jQuery Migrate | 1.4.1 | MIT |
| jQuery UI | ファイル名に版なし | MIT |
| anime.js | 3.2.1 | MIT |
| howler.js | 2.2.3 | MIT |
| animate.css | ヘッダーでDaniel Edenを表示 | MIT |
| jquery.a3d | Copyright 2012 ShikemokuMK | MIT |
| jQuery touchSwipe | 1.6.18 | MITまたはGPL-2.0のデュアル（本配布ではMITを選択） |
| Remodal | ファイルヘッダーで確認 | MIT |
| jquery.lettering | Copyright 2010 Dave Rupert | WTFPL |

Three.js、html2canvas、jsQR、jsrender、lz-string、textillate関連、AR関連等も含まれるため、
全ファイルの版とライセンス全文を固定するまでは監査未完了です。

## 評価関数（NNUE）

### 現在の配布状態

- `data/enemies.json`の現行敵は`nnue_file: null`
- `assets/nnue/`には`.gitkeep`だけがあり、外部NNUEバイナリはない
- Hostingビルドにも外部NNUEは含まれない

### 振電3（ローカル検証のみ・配布未承認）

- ローカルファイル: `ShogiAI/Shinden3/eval/nn.bin`（Git追跡外、Hosting対象外）
- ファイルサイズ: 128,409,130 bytes
- SHA-256: `F6E808025B9BA54EAF73DAFC69CE40F0EC442CB476E5B6D3CA6601E53FAD4361`
- アーキテクチャ: HalfKP512
- 互換性: 現在同梱しているHalfKP256版WASMとは非互換であり、現行対局UIでは使用しない
- 再配布: 評価関数バイナリの第三者再配布権を確認できていないため、配布物・敵マスタへ含めない
- 公開リスク: 評価関数とは別に、`ShogiAI/Shinden3/source/`と`stir131/Stirling.exe`が
  既にGit追跡されている。Hosting対象外でも公開リポジトリ自体が配布経路になるため、
  出自、正確な版、変更内容、対応ライセンス、再配布条件を確定するまで公開承認しない
- 対応方針: この監査では削除していない。公開前に権利確認のうえ、追跡継続、隔離、除外のいずれかを決定する

### 将来候補（配布未承認）

| 名称 | 候補入手元 | 現在の判断 |
|---|---|---|
| リゼロ評価関数 | YaneuraOu関連配布物（正確なURL未固定） | 権利・再配布許可の一次資料が未固定。配布不可 |
| 水匠5 | https://github.com/yaneurao/YaneuraOu/releases/tag/suisho5 | ダウンロード可能であることと第三者再配布許可は別。明示条件または許諾確認まで配布不可 |
| Hao（Háo） | https://github.com/nodchip/tanuki-/releases | リポジトリ本体のライセンスだけでは評価関数バイナリの権利を断定しない。確認まで配布不可 |
| 振電3 | たややん提供。ローカル`nn.bin`を識別済み | 再配布許諾未確認かつHalfKP512で現WASMと非互換。配布不可 |

水匠6以降など支援者限定で入手した評価関数は、明示的な再配布許諾がない限り候補にも含めません。

## 盤・駒

### 自作SVG将棋盤・駒

- 種別: ブラウザ内SVG描画
- 入手元: 外部素材なし
- 制作者: 本プロジェクト
- ライセンス: GPL-3.0-or-later
- 表記要否: 不要
- 使用箇所: `src/board-ui/board.js`、`src/board-ui/board-theme.mjs`
- 追加日: 2026-07-15
- 備考: 外部画像・外部フォントを使用しない

## キャラクター

### やこび姫 ミニキャラ

- 種別: 対局UI用キャラクター画像（透過PNG）
- 原画: プロジェクトオーナー提供の`アイコン.png`
- 制作: 提供原画を参照し、OpenAIの画像生成機能でミニキャラ化
- 使用箇所: `assets/characters/yakobihime-chibi.png`
- ライセンス: プロジェクト本体と同じGPL-3.0-or-laterとして提供
- 表記要否: 不要
- 追加日: 2026-07-17
- 備考: 黒いボブ、左右で異なる瞳色、紺色の制服という原画の識別要素を継承

## リポジトリ内のティラノサンプル素材

`assets/`には、初期ティラノプロジェクト由来と見られる立ち絵、背景、BGM、音声、
メニュー画像があります。少なくとも「あかね／やまと」立ち絵の公式配布ページは、
個人・非商用ゲームに限定し、二次配布・転載・素材自体のアップロードを禁止しています。

- 公式立ち絵ページ: https://plugin.tyrano.jp/item/4000
- 著作権表示: 2016 © STRIKEWORKS/ShikemokuMK All Rights Reserved
- 現在の扱い: Hostingビルド対象外。公開リポジトリとして配布する前に差し替えまたは除外が必要
- その他の背景・BGM・音声・UI画像: 個別の出典と条件が未固定のため、同様に配布承認しない

## 使用不可・保留リスト

| 名称 | 理由 | 確認日 |
|---|---|---|
| あかね／やまと公式立ち絵 | 非商用限定かつ素材の二次配布・転載・アップロード禁止。GPL素材として再配布不可 | 2026-07-15 |
| 出典未固定のティラノサンプル画像・音声 | 個別の再配布条件を追跡できない | 2026-07-15 |
| 水匠6以降等の支援者限定評価関数 | 入手資格と第三者再配布権は別であり、再配布許諾未確認 | 2026-07-15 |
| リゼロ・水匠5・Hao・振電3の評価関数 | バイナリ自体の第三者再配布条件を一次資料で固定できていない | 2026-07-15 |
| `ShogiAI/Shinden3/source/` | Git追跡済みのため公開リポジトリ経由で配布される。出自・版・変更内容・対応ソースの記録が未完了 | 2026-07-19 |
| `stir131/Stirling.exe` | Git追跡済み実行ファイル。出自と再配布条件を台帳化できておらず、公開リポジトリへの残置は未承認 | 2026-07-19 |

## クレジット表示案（現在の配布物）

```text
将棋AIエンジン: YaneuraOu
WASMビルド: yaneuraou.wasm by Yuta Okumura / GPL-3.0
HalfKP WASMビルド: YaneuraOu.wasm by mizar / GPL-3.0
標準定跡DB: YaneuraOu v4.73_book standard_book.db / GPL-3.0（公開前に出自・適用条件を再確認）
将棋ルール: shogi.js by na2hiro / MIT
ノベルエンジン: ティラノスクリプト by ShikemokuMK / STRIKEWORKS
本作のライセンスと第三者通知: /LICENSE, /ASSETS_CREDITS.md
```
