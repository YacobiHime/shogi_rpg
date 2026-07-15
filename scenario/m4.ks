; M4 ティラノスクリプト・対局UI結線の最小シナリオ

*start

[start_keyconfig]
[position layer="message0" left="120" top="440" width="1040" height="220" page="fore" visible="true"]
@layopt layer="message0" visible=true

稽古相手との対局を開始します。

[shogi_match match_id="m4-training-1" enemy="training_partner" formation="standard" difficulty="normal"]

[if exp="f.match_result && f.match_result.result && f.match_result.result.outcome == 'win'"]
勝利しました。物語を次へ進めます。[p]
[elsif exp="f.match_result && f.match_result.result && f.match_result.result.outcome == 'draw'"]
引き分けでした。もう一度挑戦できます。[p]
[elsif exp="f.match_result && f.match_result.result"]
敗北しました。準備を整えて再挑戦しましょう。[p]
[else]
対局結果を受け取れませんでした。[p]
[endif]

[s]
