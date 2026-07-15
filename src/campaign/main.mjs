import { openMatchFrame } from '../novel/match-bridge.mjs';
import {
  callFriend,
  completeStage,
  createCampaignState,
  hirePiece,
  loadCampaignState,
  saveCampaignState,
  validateCampaignMaster,
  CAMPAIGN_SAVE_KEY,
} from './campaign-state.mjs';
import {
  buildBattleSfen,
  createDefaultPlacements,
  extractPlayerArmy,
  parseBoard,
} from './sfen-army.mjs';

const app = document.getElementById('app');
const KIND_LABEL = { OU: '玉', HI: '飛', KA: '角', KI: '金', GI: '銀', KE: '桂', KY: '香', FU: '歩' };
let master;
let state;
let placements = {};
let selectedKind = null;

function replaceTokens(text) {
  return text.replaceAll('{player}', state?.playerName || 'あなた');
}

function save() {
  state = saveCampaignState(localStorage, state);
}

function showTitle() {
  let canContinue = false;
  try { canContinue = Boolean(loadCampaignState(localStorage, master)); } catch { canContinue = false; }
  app.innerHTML = `<section class="title-screen shell"><div class="title-card">
    <p class="eyebrow">SHOGI ROLE-PLAYING GAME</p><h1>${master.title}</h1>
    <p>行列式の神・夜古火姫と、きみを慕う駒たちの短編連戦譚。</p>
    <div class="actions"><button id="new-game" class="primary">はじめから</button>
    <button id="continue" ${canContinue ? '' : 'disabled'}>つづきから</button></div>
  </div></section>`;
  document.getElementById('new-game').onclick = showProfile;
  document.getElementById('continue').onclick = () => {
    try { state = loadCampaignState(localStorage, master); enterCurrentStage(); }
    catch (error) { alert(`セーブを読み込めませんでした: ${error.message}`); }
  };
}

function showProfile() {
  app.innerHTML = `<section class="title-screen shell"><div class="title-card"><h2>玉将の名</h2>
    <form id="profile" class="profile"><label>夜古火姫に呼んでほしい名前
      <input id="player-name" maxlength="12" required value="あるじ"></label>
      <label>対局難易度<select id="difficulty"><option value="easy">やさしい</option>
      <option value="normal" selected>ふつう</option><option value="hard">むずかしい</option></select></label>
      <button class="primary">物語を始める</button></form></div></section>`;
  document.getElementById('profile').onsubmit = (event) => {
    event.preventDefault();
    const playerName = document.getElementById('player-name').value.trim();
    if (!playerName) return;
    state = createCampaignState(master, {
      playerName,
      difficulty: document.getElementById('difficulty').value,
    });
    save();
    enterCurrentStage();
  };
}

function showDialogue(lines, onDone) {
  let index = 0;
  app.innerHTML = `<section class="dialogue-screen"><div class="yakobi-stage"><div class="yakobi" aria-label="夜古火姫の紋章"></div></div>
    <div class="dialogue-box"><div id="speaker" class="speaker"></div><div id="dialogue" class="dialogue-text"></div>
    <button id="next" class="dialogue-next primary">次へ</button></div></section>`;
  const render = () => {
    const line = lines[index];
    document.getElementById('speaker').textContent = line.speaker;
    document.getElementById('dialogue').textContent = replaceTokens(line.text);
    document.getElementById('next').textContent = index === lines.length - 1 ? '進む' : '次へ';
  };
  document.getElementById('next').onclick = () => {
    index += 1;
    if (index >= lines.length) onDone(); else render();
  };
  render();
}

function enterCurrentStage() {
  if (state.completed || state.stage >= master.stages.length) { showEnding(); return; }
  showDialogue(master.stages[state.stage].intro, showPreparation);
}

function countPlaced(kind) {
  return Object.values(placements).filter((value) => value === kind).length;
}

function showPreparation() {
  const stage = master.stages[state.stage];
  placements = createDefaultPlacements(state.army);
  selectedKind = null;
  renderPreparation(stage);
}

function renderPreparation(stage) {
  const enemy = parseBoard(stage.enemy_sfen_board);
  const cells = [];
  for (let y = 1; y <= 9; y += 1) {
    for (let x = 9; x >= 1; x -= 1) {
      const square = `${x}${String.fromCharCode(96 + y)}`;
      const enemyPiece = enemy.get(square);
      const ownKind = placements[square];
      const classes = ['cell', y >= 7 ? 'camp' : '', enemyPiece ? 'enemy' : '', ownKind ? 'player' : ''].filter(Boolean).join(' ');
      cells.push(`<button class="${classes}" data-square="${square}" ${y < 7 ? 'disabled' : ''}>${ownKind ? KIND_LABEL[ownKind] : enemyPiece ? KIND_LABEL[enemyPiece.kind] : ''}</button>`);
    }
  }
  const roster = Object.entries(master.pieces).filter(([kind]) => kind !== 'OU').map(([kind, piece]) => {
    const hand = (state.army[kind] || 0) - countPlaced(kind);
    const canAid = state.friends.includes(kind) && !state.aidUsedAtStage[String(state.stage)];
    return `<article class="piece-card ${selectedKind === kind ? 'selected' : ''}" data-kind="${kind}">
      <div class="piece-head"><span>${piece.name}</span><span>軍勢 ${state.army[kind] || 0}／持駒 ${hand}</span></div>
      <p class="piece-voice">「${piece.voice}」　絆 ${'♥'.repeat(state.bond[kind] || 0)}</p>
      <div class="piece-actions"><button data-select="${kind}" ${hand <= 0 ? 'disabled' : ''}>配置する</button>
      <button data-hire="${kind}" ${state.currency < piece.cost ? 'disabled' : ''}>雇う（${piece.cost}棋貨）</button>
      <button data-aid="${kind}" ${canAid ? '' : 'disabled'}>友を呼ぶ</button></div></article>`;
  }).join('');
  app.innerHTML = `<section class="shell"><div class="topbar"><div><p class="eyebrow">第${state.stage + 1}戦</p><h2>${stage.name}</h2></div>
    <div class="resources">${state.playerName} 玉将　｜　棋貨 ${state.currency}</div></div>
    <p class="instructions">家臣を選び、色のついた自陣三段へ配置してください。盤に置かない駒は持ち駒として開戦します。配置済みの駒を押すと手元へ戻せます。</p>
    <div class="prep-grid"><div><div class="board-wrap"><div class="deploy-board">${cells.join('')}</div></div>
      <div class="actions"><button id="reset-placement">おすすめ配置</button><button id="start-battle" class="primary">この布陣で出陣</button></div></div>
      <div class="roster">${roster}</div></div></section>`;
  document.querySelectorAll('[data-square]').forEach((button) => {
    button.onclick = () => {
      const square = button.dataset.square;
      if (placements[square]) {
        if (placements[square] === 'OU') {
          selectedKind = 'OU';
          return renderPreparation(stage);
        }
        delete placements[square];
      } else if (selectedKind && (selectedKind === 'OU'
        || countPlaced(selectedKind) < (state.army[selectedKind] || 0))) {
        if (selectedKind === 'FU' && Object.entries(placements).some(([key, value]) => value === 'FU' && key[0] === square[0])) {
          return alert('同じ筋に歩を二枚は置けません。');
        }
        if (selectedKind === 'OU') {
          const oldSquare = Object.keys(placements).find((key) => placements[key] === 'OU');
          delete placements[oldSquare];
        }
        placements[square] = selectedKind;
      }
      renderPreparation(stage);
    };
  });
  document.querySelectorAll('[data-select]').forEach((button) => { button.onclick = () => { selectedKind = button.dataset.select; renderPreparation(stage); }; });
  document.querySelectorAll('[data-hire]').forEach((button) => { button.onclick = () => {
    try { state = hirePiece(state, master, button.dataset.hire); save(); renderPreparation(stage); }
    catch (error) { alert(error.message); }
  }; });
  document.querySelectorAll('[data-aid]').forEach((button) => { button.onclick = () => {
    try { state = callFriend(state, button.dataset.aid); save(); renderPreparation(stage); }
    catch (error) { alert(error.message); }
  }; });
  document.getElementById('reset-placement').onclick = () => { placements = createDefaultPlacements(state.army); renderPreparation(stage); };
  document.getElementById('start-battle').onclick = () => startBattle(stage);
}

async function startBattle(stage) {
  let startSfen;
  try { startSfen = buildBattleSfen(stage.enemy_sfen_board, placements, state.army); }
  catch (error) { alert(error.message); return; }
  const before = { ...state.army };
  try {
    const message = await openMatchFrame({
      matchId: `campaign.stage.${state.stage}`,
      enemyId: stage.enemy_id,
      formationId: 'standard',
      difficultyId: state.difficulty,
      itemId: null,
      startSfen,
    });
    if (message.result.outcome !== 'win') {
      showDialogue([{ speaker: '夜古火姫', text: '大丈夫！ 駒たちはきみを責めたりしません。布陣を整えて、もう一度みんなを信じてあげて。' }], showPreparation);
      return;
    }
    const survivors = extractPlayerArmy(message.result.final_sfen);
    const lost = Object.keys(before).filter((kind) => kind !== 'OU' && survivors[kind] < before[kind]);
    state = completeStage(state, master, survivors);
    save();
    const lines = [...stage.victory];
    if (lost.length) lines.splice(1, 0, {
      speaker: '夜古火姫',
      text: `${lost.map((kind) => KIND_LABEL[kind]).join('・')}の仲間は戦線を離れました。でも縁は消えません。次の戦で呼び戻すこともできます。`,
    });
    showDialogue(lines, state.completed ? showEnding : enterCurrentStage);
  } catch (error) {
    console.error(error);
    alert(`対局を開始できませんでした: ${error.message}`);
    renderPreparation(stage);
  }
}

function showEnding() {
  app.innerHTML = `<section class="ending shell"><div class="ending-card"><p class="eyebrow">ENDING</p>
    <h1>盤上の灯は消えない</h1><p>${state.playerName}と家臣たちの結びつきによって、零の帳は退けられた。</p>
    <p>夜古火姫は行列式の火を胸に、次の一局でも皆の関係を見守っている。</p>
    <p class="resources">結んだ縁 ${state.friends.length - 1}　｜　残った棋貨 ${state.currency}</p>
    <div class="actions"><button id="title">タイトルへ</button><button id="restart" class="primary">もう一度物語を始める</button></div></div></section>`;
  document.getElementById('title').onclick = showTitle;
  document.getElementById('restart').onclick = () => {
    if (confirm('現在の本編セーブを消して、はじめから遊びますか？')) {
      localStorage.removeItem(CAMPAIGN_SAVE_KEY); showProfile();
    }
  };
}

fetch('/data/campaign.json').then((response) => {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}).then((data) => { master = validateCampaignMaster(data); showTitle(); }).catch((error) => {
  app.innerHTML = `<section class="shell"><h1>読み込みエラー</h1><p>${error.message}</p></section>`;
});
