---
title: データスキーマ定義
layout: default
nav_order: 5
---

# データスキーマ定義

実装時に参照するリファレンスとして、各種マスタデータ／セーブデータのJSON構造を定義します。
仕様の詳細な意図は `SPECIFICATION.md` / `SYSTEM_DESIGN.md` を参照してください。

## 1. 敵データ（`data/enemies.json`）

ファイルのルートは、以下のオブジェクトを要素に持つ配列とする。

```jsonc
{
  "enemy_id": "chapter1_boss",       // string, 一意
  "name": "村の道場主",               // string, 表示名
  "chapter": 1,                       // number, 登場章
  "nnue_file": null,                  // string | null, assets/nnue内の評価関数ファイル名。nullは内蔵評価関数
  "max_think_time_ms": 10000,         // positive integer, 最大思考時間（安全上限）
  "node_limit": 10000,                // positive integer, 強さの基準となる探索ノード数上限
  "move_rank": { "min": 1, "max": 1 },// 候補手のうち何番目から選択するか（1=最善手のみ）
  "allowed_openings": ["standard"],   // string[], プレイヤーが選べるformation_id
  "opening_book_id": "white_bogin",  // string | null, enemy_openings.jsonのbook_id
  "handicap": null,                   // string | null, 駒落ち設定（例: "kaku_ochi"）
  "start_sfen_override": null         // string | null, 戦形以外で開始局面を直接指定したい場合
}
```

- `nnue_file`にはディレクトリを含まないファイル名だけを指定する。対局UIは
  `assets/nnue/<nnue_file>`として解決し、モジュール初期化前に仮想FSの`/nn.bin`へ書き込む
- 指定時はHalfKP noeval版WASMを使用する。ファイルが未配置、取得失敗、空ファイルの場合、または
  HalfKPローダー／エンジン初期化に失敗した場合は、対局を中断せず通常版の内蔵評価関数へ
  フォールバックする
- 評価関数は使用するWASMエンジンとNNUEアーキテクチャが一致し、再配布条件を確認済みのものに限る。
  素材追加時は`docs/ASSETS_CREDITS.md`も更新する
- `opening_book_id`は`data/enemy_openings.json`に存在するIDだけを許可する。`null`の一般敵は
  やねうら王の標準定跡DBを使用し、IDを持つ村固有敵は敵専用定跡を優先する

### 1.1 敵専用定跡（`data/enemy_openings.json`）

後手側の戦法・囲いを村ごとに固定する小規模な定跡マスタ。ルートは`version`と`books`を持つ。

```jsonc
{
  "version": 1,
  "books": [
    {
      "book_id": "white_closed_shiken", // string, 一意
      "name": "後手角道を止める四間飛車",
      "side": "white",                  // 現行はwhiteのみ
      "steps": [
        { "moves": ["3c3d"] },          // 同じstep内は合法な代替候補
        { "moves": ["4c4d"] },
        { "moves": ["8b4b"] }
      ],
      "completion": [
        { "square": "4b", "piece": "R" },
        { "square": "4d", "piece": "P" }
      ],
      "constraints": {
        "rook_files": [1, 2, 3, 4],
        "activate_after_move": "8b4b"
      }
    }
  ]
}
```

- `book_id`は小文字英数字と`_`で構成し、`name`は表示用の空でない文字列とする
- `steps`は1件以上。各`moves`はUSI形式の着手を1件以上持ち、敵の実着手を先頭から順に照合する。
  棒銀の歩と銀の`8c8d`のように、同じUSI表記が別stepへ再登場しても順序を保って処理する
- `completion`は完成形に必要な後手駒を`square`と`piece`で示す。`square`は`1a`〜`9i`、
  `piece`は`P | L | N | S | G | B | R | K`。同じマスを重複指定しない
- `constraints`は省略可能。`rook_files`は飛車・竜の移動先と飛車打ちを許可する筋、
  `activate_after_move`は制約を開始する定跡手で、必ずいずれかのstepへ含める
- 次のstepに合法手がなければ通常探索へフォールバックする。制約の開始後は、通常探索でも
  現局面の全合法手から制約違反を除いた`searchmoves`を使い、四間飛車を居飛車へ戻さない

## 2. 戦形（囲い）データ（`data/formations.json`）

ファイルのルートは、以下のオブジェクトを要素に持つ配列とする。

```jsonc
{
  "formation_id": "mino_gakoi",     // string, 一意
  "name": "美濃囲い",                // string
  "side": "player",                  // "player" | "enemy" | "both"
  "start_sfen": "SFEN文字列",        // string, 完成局面のSFEN
  "unlock_level": 3,                 // number, プレイヤーが使用可能になるレベル（enemy側は無視）
  "strong_against": ["yagura"],      // string[], 有利な相手戦形ID
  "weak_against": ["anaguma"]        // string[], 不利な相手戦形ID
}
```

### 2.1 対局中の戦形コールアウト（`data/formation_callouts.json`）

盤面の駒配置から戦形を検出した際に、やこび姫が表示する文言を管理する。
検出条件は`src/board-ui/formation-callouts.mjs`に置き、表示名と発話文をマスタデータとする。

```jsonc
{
  "version": 1,
  "initial_speech": "戦形が見えたら知らせるね！", // 対局開始時の吹き出し
  "undo_speech": "もう一度、盤面を見てみよう！", // 待った使用時の吹き出し
  "callouts": [
    {
      "callout_id": "bogin", // 検出処理と対応する一意ID
      "name": "棒銀",        // 表示名
      "speech": "棒銀！"     // 検出時の発話文
    }
  ]
}
```

- 現行の`callout_id`は`bogin`、`gold_yagura`、`right_shiken`を必須とする
- `name`は1〜30文字、`speech`は1〜40文字、開始時・待った時の文言は1〜80文字とする
- 同じ`callout_id`は1局につき一度だけ発話し、先手・後手のどちらが組んでも検出対象とする

## 3. アイテム／スキルデータ（`data/items.json`）

ファイルのルートは、以下のオブジェクトを要素に持つ配列とする。

```jsonc
{
  "item_id": "hint_ticket",         // string, 一意
  "name": "棋神の巻物",              // string, 表示名
  "type": "hint",                    // "hint" | "undo" | "handicap" | "formation_start" |
                                      // "extra_hand_pieces" | "enemy_debuff_nodes" | "enemy_debuff_rank"
  "unlock_level": 4,                 // number
  "effect_value": 1,                 // number, 効果量（typeにより意味が変わる）
  "stackable": true,                 // boolean, 所持数を積み増せるか
  "consumable": true                 // boolean, 対局ごとに消費するか、恒久スキルか
}
```

- `enemy_debuff_nodes`の`effect_value`は、敵の探索ノード数へ掛ける倍率とする。
  0より大きく1以下を指定し、`0.5`なら探索量を50%にする
- `hint` / `undo`の`effect_value`は、1以上の整数で対局中の使用可能回数を表す
- 実効ノード数は`敵のnode_limit × 難易度のnode_limit_mult × effect_value`を
  四捨五入し、最低1に補正する。未装備時の倍率は1とする
- 現在の対局準備画面では、プレイヤーレベル1で解禁済みかつ`consumable: false`の
  `enemy_debuff_nodes`を1つだけ装備できる
- セーブデータと未結線のスタンドアロン対局では、レベル1で解禁済みの
  `hint` / `undo`の`effect_value`合計をその対局の使用上限にする。M3結線後は
  対局開始構成の`hints.max` / `undo.max`を優先する

## 4. レベルアップ／解禁テーブル（`data/level_unlocks.json`）

ファイルのルートは、以下のオブジェクトを要素に持つ配列とする。

```jsonc
{
  "level": 5,
  "unlocks": {
    "formations": ["anaguma"],           // string[], formation_id
    "items": ["hint_ticket"],            // string[], item_id
    "skill_upgrades": {
      "undo_max": 1,                      // 待った回数上限の増分
      "hint_max": 0                       // ヒント回数上限の増分
    }
  }
}
```

- `level`は1〜255の整数。配列は昇順かつ重複不可
- `formations` / `items`は空配列を許可するが、同じIDを複数レベルへ登録してはならない
- 全`formation_id` / `item_id`をいずれかのレベルへ1回だけ登録し、各マスタの
  `unlock_level`と解禁テーブルの`level`を一致させる
- 未定義ID、マスタの登録漏れ、重複ID、レベル不一致は対局条件の読込時にエラーとする
- `undo_max` / `hint_max`は0以上の整数で、そのレベルまでの値を累積して基本使用回数へ加算する
- localStorageの`player_level`を正とする。保存データがない初回だけURLクエリ
  `?level=<1〜255>`を初期値として取り込み、省略時はレベル1とする

本編version 2では、この表をレベル由来の補助回数・任意アイテム解禁に限定する。
次章の攻略に必要な戦形・基本ガイドは、別途追加する章報酬マスタからボス撃破時または章解禁時に付与し、
低レベルでボスへ直行したプレイヤーを次章で進行不能にしない。章報酬マスタの正確なIDと構造は、
本編マスタ実装前に本書へ追記する。

## 5. 難易度係数テーブル（`data/difficulty.json`）

```jsonc
{
  "easy":   { "node_limit_mult": 0.5, "node_limit_stddev_ratio": 0,    "move_rank_max_bonus": 2 },
  "normal": { "node_limit_mult": 1.0, "node_limit_stddev_ratio": 0.45, "move_rank_max_bonus": 0 },
  "hard":   { "node_limit_mult": 1.5, "node_limit_stddev_ratio": 0,    "move_rank_max_bonus": 0 }
}
```

- `easy` / `normal` / `hard` の3キーを必須とする
- `node_limit_mult` は0より大きい数値とし、敵の`node_limit`へ乗算後、四捨五入して最低1に補正する
- `node_limit_stddev_ratio` は0以上0.5以下の数値とする。敵が指すたびに実効ノード数を
  平均値の比率で示した標準偏差を持つ正規分布を基に補正する。標準偏差2個分で制限した後、
  正の偏差だけを半分に圧縮するため、倍率の範囲は
  `1 - 2 × node_limit_stddev_ratio`〜`1 + node_limit_stddev_ratio`となる。`0`なら補正しない
- `move_rank_max_bonus` は0以上の整数とし、敵の`move_rank.max`へ加算する
- 実効範囲は`move_rank.min`から`move_rank.max + move_rank_max_bonus`までとし、
  その最大値をMultiPVの候補数として設定する
- 実効範囲内に存在する候補手から等確率で1手を選ぶ。合法手が少なく候補数が不足する場合は、
  取得できた最大ランクまで範囲を縮め、指定した最小ランクにも届かない場合は取得できた最下位の手を使う
- MultiPVの`info`行を取得できない場合は、エンジンの`bestmove`（第1候補）へフォールバックする

## 6. ノベル・対局UI連携

### 6.1 対局開始構成

```jsonc
{
  "match_id": "chapter1.training:1", // 1〜64文字。英数字と . _ : -
  "enemy_id": "chapter1_boss",
  "formation_id": "mino_gakoi",
  "difficulty_id": "normal",
  "item_id": "node_limit_half" // string | null
}
```

iframe URLではそれぞれ`match_id`、`enemy`、`formation`、`difficulty`、`item`へ対応する。
`bridge=tyrano`も必須とする。`item`は未装備時に省略する。戦形とアイテムは現在の
プレイヤーレベルで解禁済みでなければならず、URLから未解禁IDを直接指定した場合も開始しない。

### 6.2 対局結果メッセージ

`postMessage`で返すメッセージは`SYSTEM_DESIGN.md` 2.1節の形式とする。`version`は現在`1`。
`outcome`は`win | loss | draw`、`reason`は`checkmate | resignation | entering_king |
repetition | perpetual_check`、`move_count`は0以上の整数とする。

ティラノの永続変数`sf.shogi_rpg`には次を保存する。撃破済み敵の正本は
`shogi_rpg_save.defeated_bosses`であり、ティラノ側へ同じ配列を重複保存しない。

```jsonc
{
  "chapter_flags": { "defeated_training_partner": true },
  "last_match_result": { /* 6.2の対局結果メッセージ */ }
}
```

## 7. セーブデータ（localStorage、`shogi_rpg_save`キー）

### 7.1 現行形式（version 1）

```jsonc
{
  "version": 1,
  "chapter": 5,
  "player_level": 12,
  "unlocked_formations": ["yagura", "mino_gakoi", "anaguma"],
  "unlocked_items": ["hint_ticket"],
  "defeated_bosses": ["chapter1_boss", "chapter2_boss"],
  "item_counts": { "hint_ticket": 3, "undo_ticket": 2 },
  "difficulty": "normal",
  "updated_at": "2026-07-09T00:00:00Z"
}
```

- `version`は現在`1`。省略された旧形式は読み込み時に現行形式へ移行し、未来版は拒否する
- `chapter`は1〜63、`player_level`は1〜255、消費アイテム所持数は0〜15の整数
- ID配列は重複を許さず、現在の戦形・アイテム・敵マスタに存在するIDだけを保存する
- レベル解禁済みIDが旧セーブで欠けている場合は`level_unlocks.json`から補完する
- 難易度の変更、ヒント・待ったの消費、復活の呪文からの復元時に自動保存する
- JSON欠損は安全に補完し、解析不能・未知ID・範囲外値などの破損時は警告付きで初期状態へ復旧する
- `updated_at`はISO 8601日時。復活の呪文には含めず、保存時に更新する

### 7.2 本編用の予定形式（version 2）

本編機能の実装時に、次の形式へ版番号付きで移行する。実装が切り替わるまでは7.1を現行形式とする。

```jsonc
{
  "version": 2,
  "player_name": "やまと",                 // 1〜12文字の表示用テキスト
  "name_suffix": "kun",                    // "kun" | "chan"
  "chapter": 5,                             // 解禁済みの最新章
  "current_location": "chapter3_village", // location_id
  "player_level": 12,
  "experience": 1450,
  "currency": 320,                          // ゲーム内通貨「棋貨」の所持数
  "unlocked_formations": ["mino_gakoi"],
  "unlocked_items": ["hint_ticket"],
  "defeated_enemies": ["chapter1_villager1", "chapter1_boss"],
  "unlocked_books": ["shogi_basics", "bogin"],
  "opened_chests": ["chapter1.chest1"],
  "completed_tutorials": ["basics_piece_control"],
  "quest_states": { "chapter1.quest1": "completed" },
  "item_counts": { "hint_ticket": 3, "undo_ticket": 2 },
  "difficulty": "normal",
  "updated_at": "2026-07-15T00:00:00Z"
}
```

- `player_name`は前後の空白を除いた1〜12文字とし、HTMLまたはティラノタグとして解釈しない
- `name_suffix`は夜古火姫からの呼ばれ方を表し、表示時に`player_name`へ「くん」または「ちゃん」を付ける
- `experience`と`currency`は0以上の安全な上限内の整数とし、上限値は成長・経済マスタと同時に確定する
- `defeated_enemies`は通常敵とボスの初回勝利を同じID配列で保存し、初回経験値の二重取得を防ぐ
- 章クリアは、その章のボスIDが`defeated_enemies`に含まれることから判定する
- `quest_states`は`not_started | active | completed`のいずれかとする。`not_started`は省略できる
- ID配列と状態キーは各マスタに存在する値だけを許可し、重複を許さない
- version 1からは、既存の`defeated_bosses`を`defeated_enemies`へ引き継ぎ、
  追加フィールドを安全な初期値で補完する。未知IDや破損は従来どおり警告して復旧する
- localStorage以外のサーバー、Cookie、外部データベースへ進行データを送信しない

## 8. 復活の呪文

### 8.1 現行16文字形式（version 1、将来は読込専用）

| フィールド | ビット幅 | 備考 |
|---|---|---|
| chapter | 6 bit | 最大63章まで対応 |
| player_level | 8 bit | 最大255レベルまで対応 |
| unlocked_formations | 16 bit | 戦形ごとに1ビットのフラグ |
| defeated_bosses | 32 bit | ボスごとに1ビットのフラグ |
| item_counts.hint | 4 bit | 最大15個まで |
| item_counts.undo | 4 bit | 最大15個まで |
| difficulty | 2 bit | 0=やさしい, 1=ふつう, 2=むずかしい |
| checksum | 8 bit | 上記9 byteに対するCRC-8（多項式`0x07`） |

- 合計80 bitを`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`でBase32相当に変換し、16文字にする
- 表示時は4文字ごとに`-`を入れる。入力時は大文字小文字、空白、`-`を無視する
- `unlocked_formations`は`formations.json`の配列順で最大16件、`defeated_bosses`は
  専用ボスマスタ導入までは`enemies.json`の配列順で最大32件を割り当てる。既存要素の順番は変更しない
- 解禁済みアイテムは`player_level`と解禁表から復元し、個数はヒント札・待った札だけを格納する
- `version`と`updated_at`は呪文に含めず、復元時に現行バージョンと現在日時を設定する

### 8.2 本編用の予定形式（version 2、可変長）

- 接頭辞を`SR2-`とし、version 1と入力時に判別できるようにする
- プレイヤー名をUTF-8で格納し、進行データは安定したマスタ順のビット集合と整数へ圧縮する
- プレイヤー名、呼ばれ方、章、レベル、経験値、通貨、難易度、敵の初回勝利、戦形、
  アイテム、定跡書、宝箱、講座、サブクエストの状態を対象とする
- 対局途中の局面、現在の一時演出、`updated_at`は対象外とする
- 誤入力と破損を検出するチェックサム、保存形式版、コンテンツカタログ版を含める
- 判別しにくい文字を除いた文字セットを使い、画面上は一定文字数ごとに区切る
- 生成、検証、復元はすべてブラウザ内で行い、サーバーへ文字列やセーブ内容を送らない
- version 1の16文字形式は引き続き入力でき、不足するversion 2項目を初期値で補完する
- 正確なビット幅と最大文字数は、本編マスタのID件数を確定してから実装前に本節へ追記する

## 9. USI通信メッセージ（対局UI ⇔ 将棋AIエンジン）

対局UI・将棋AIエンジン間はUSIプロトコルのテキストコマンドをそのまま利用する。
エンジンは**メインスレッドから直接呼び出す方式**（`docs/AGENTS.md`参照）で、
`engine.postMessage()` / `engine.addMessageListener()` を介してやり取りする。

```
// 対局UI → エンジン（engine.postMessage）
"usi"
"isready"
"setoption name Threads value 1"
"setoption name EvalFile value rezero_eval.bin"
"setoption name BookDir value ."
"setoption name BookFile value user_book1.db"
"setoption name USI_OwnBook value true"
"setoption name BookMoves value 40"
"position sfen <SFEN> moves <指し手...>"
"go nodes <n>"  // JavaScript側でmax_think_time_ms経過時に"stop"を送る
"go nodes <n> searchmoves <USI指し手...>" // 敵専用定跡・戦法維持では必ず末尾へ置く

// エンジン → 対局UI（addMessageListenerのコールバック）
"usiok"
"readyok"
"bestmove <指し手>"
"info depth ... pv ..." （ヒント表示等に利用）
```

標準定跡DBは初期化前にEmscripten仮想FSの`/user_book1.db`へ配置する。利用可能な
`option name ...`をUSI応答から収集し、エンジンが列挙したオプションだけを設定する。
村固有の敵では自己定跡が`searchmoves`を迂回しないよう、`USI_OwnBook=false`と
`BookFile=no_book`を設定してから敵専用定跡を使う。

## 10. 七村RPGワールド（`data/world.json`）

各章は従来の会話、遭遇、宝箱、クエスト、店に加え、マップ表示用の`course`を必須とする。

```jsonc
{
  "chapter_id": "chapter2_village",
  "number": 2,
  "boss_id": "ch2_boss_ginka",
  "course": {
    "nodes": [
      { "node_id": "ch2_start", "type": "start", "label": "村の入口", "x": 9, "y": 53 },
      { "node_id": "ch2_ayumu_node", "type": "encounter", "enemy_id": "ch2_ayumu", "x": 34, "y": 53 },
      { "node_id": "ch2_chest_node", "type": "chest", "chest_id": "ch2_chest_gate", "x": 34, "y": 88 },
      { "node_id": "ch2_kei_node", "type": "encounter", "enemy_id": "ch2_kei", "x": 61, "y": 53 },
      { "node_id": "ch2_boss_node", "type": "encounter", "enemy_id": "ch2_boss_ginka", "x": 88, "y": 53 }
    ],
    "links": [
      { "from": "ch2_start", "to": "ch2_ayumu_node", "kind": "main" },
      { "from": "ch2_ayumu_node", "to": "ch2_chest_node", "kind": "branch" },
      { "from": "ch2_ayumu_node", "to": "ch2_kei_node", "kind": "main" },
      { "from": "ch2_kei_node", "to": "ch2_boss_node", "kind": "main" }
    ]
  }
}
```

- `node_id`は全章で一意。`type`は`start | encounter | chest`、`x` / `y`は0〜100の数値
- 入口は章ごとに1件だけ置く。遭遇は同章の`encounters[].enemy_id`、宝箱は同章の
  `chests[].chest_id`を参照し、全件を重複なく配置する
- `kind: "main"`は入口から全遭遇を一列につなぎ、末尾を`boss_id`にする。
  `kind: "branch"`は入口または遭遇地点から宝箱へつなぐ。宝箱からはリンクを出さない
- 入口以外の入リンクは1本、全地点は入口から到達可能、循環と本道分岐は禁止する
- 本道は先頭から連続してクリアしたprefixだけを順に解放する。後方の撃破記録だけでは
  未勝利地点を飛ばせない。branchは接続元のクリア後に解放し、宝箱の未開封はボス解放を妨げない
- 旧セーブでボス撃破済みなら、ボス地点と次章解放を維持する。起動時は全章の
  `boss_id`と`defeated_enemies`を照合して不足する章解放だけを復旧し、通常敵の撃破は補完しない
