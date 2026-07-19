import { loadMatchSetupOptions } from '../board-ui/match-setup.mjs';
import { openMatchFrame } from '../novel/match-bridge.mjs';
import { decodeSaveCode, encodeSaveCode, formatSaveCode } from '../save/save-code.mjs';
import { loadSaveState, saveSaveState } from '../save/save-storage.mjs';
import {
  applyEncounterVictory,
  buildSaveContext,
  buyShopItem,
  claimQuest,
  courseNodeIsAvailable,
  createProfile,
  getCourseProgress,
  openChest,
  playerDisplayName,
  questIsReady,
  reconcileChapterProgress,
  validateBooksMaster,
  validateWorldMaster,
} from './world-state.mjs';

const app = document.querySelector('#app');
let catalogs;
let world;
let saveContext;
let progression;
let state;
let activeView = 'village';

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${path}を読み込めませんでした`);
  return response.json();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}

function save(next) {
  state = saveSaveState(localStorage, next);
  return state;
}

function replacePlayer(text) {
  return escapeHtml(String(text).replaceAll('{player}', playerDisplayName(state)));
}

function itemName(id) {
  return catalogs.items.find((item) => item.item_id === id)?.name || id;
}

function rewardText(reward = {}) {
  const parts = [];
  if (reward.experience) parts.push(`経験値 ${reward.experience}`);
  if (reward.currency) parts.push(`${world.currency_name} ${reward.currency}`);
  for (const [id, count] of Object.entries(reward.items || {})) parts.push(`${itemName(id)}×${count}`);
  for (const id of reward.books || []) {
    parts.push(`定跡書「${catalogs.books.find((book) => book.book_id === id)?.title || id}」`);
  }
  return parts.join(' ／ ') || '記録更新';
}

function dialogueHtml(lines) {
  return `<div class="dialogue">${lines.map((line) => {
    const thought = line.speaker === 'thought';
    const speaker = thought ? '心の声' : line.speaker;
    return `<div class="line ${thought ? 'thought' : ''}"><span class="speaker">${escapeHtml(speaker)}</span><span>${replacePlayer(line.text)}</span></div>`;
  }).join('')}</div>`;
}

function modal(title, body, actions = [{ label: '閉じる' }]) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `<section class="modal" role="dialog" aria-modal="true"><h2>${escapeHtml(title)}</h2>${body}<div class="modal-actions">${actions.map((action, index) => `<button data-modal-action="${index}" class="${action.primary ? 'primary' : ''}">${escapeHtml(action.label)}</button>`).join('')}</div></section>`;
  document.body.append(overlay);
  return new Promise((resolve) => {
    overlay.addEventListener('click', (event) => {
      const button = event.target.closest('[data-modal-action]');
      if (!button) return;
      const index = Number(button.dataset.modalAction);
      overlay.remove();
      resolve(actions[index]?.value ?? index);
    });
  });
}

function renderProfile(warning = '') {
  app.innerHTML = `<section class="profile-screen"><form class="profile-card" id="profile-form">
    <p class="eyebrow">SHOGI ROLE-PLAYING GAME</p>
    <h1>${escapeHtml(world.title)}</h1>
    <p>夜古火姫と七つの村を巡り、将棋を学びながら伝説の名人を目指します。</p>
    ${warning ? `<p class="danger">${escapeHtml(warning)}</p>` : ''}
    <label>旅人の名前<input name="player_name" maxlength="12" value="${state.player_name === 'あなた' ? '' : escapeHtml(state.player_name)}" required placeholder="1〜12文字"></label>
    <div class="choice-row"><label><input type="radio" name="name_suffix" value="kun" checked> くん</label><label><input type="radio" name="name_suffix" value="chan"> ちゃん</label></div>
    <label>対局の難易度<select name="difficulty">${catalogs.difficulties.map((difficulty) => `<option value="${difficulty.difficulty_id}" ${difficulty.difficulty_id === state.difficulty ? 'selected' : ''}>${escapeHtml(difficulty.name)}</option>`).join('')}</select></label>
    <button class="primary" type="submit">七つの村へ旅立つ</button>
  </form></section>`;
  document.querySelector('#profile-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      let next = createProfile(state, {
        playerName: form.get('player_name'),
        nameSuffix: form.get('name_suffix'),
        difficulty: form.get('difficulty'),
      });
      next = { ...next, unlocked_books: [...world.chapters[0].guide_books] };
      save(next);
      render();
    } catch (error) {
      renderProfile(error.message);
    }
  });
}

function renderHeader() {
  const nextLevel = world.level_curve[state.player_level]?.total_experience;
  const experience = nextLevel ? `${state.experience}/${nextLevel}` : `${state.experience}/MAX`;
  return `<header class="topbar"><div class="brand"><p>SHOGI RPG</p><h1>${escapeHtml(world.title)}</h1></div>
    <div class="stats"><span class="stat">${escapeHtml(playerDisplayName(state))}</span><span class="stat">Lv.${state.player_level}</span><span class="stat">経験値 ${experience}</span><span class="stat">${world.currency_name} ${state.currency}</span></div></header>
    <nav class="nav" aria-label="メインメニュー">
      <button data-view="village" class="${activeView === 'village' ? 'active' : ''}">村と対局</button>
      <button data-view="books" class="${activeView === 'books' ? 'active' : ''}">定跡集</button>
      <button data-view="inventory" class="${activeView === 'inventory' ? 'active' : ''}">持ち物・設定</button>
      <button data-view="recovery" class="${activeView === 'recovery' ? 'active' : ''}">復活の呪文</button>
    </nav>`;
}

function renderVillageMap() {
  return `<div class="village-map">${world.chapters.map((chapter) => {
    const unlocked = chapter.number <= state.chapter;
    const current = chapter.chapter_id === state.current_location;
    const complete = state.defeated_enemies.includes(chapter.boss_id);
    return `<button data-chapter="${chapter.chapter_id}" ${unlocked ? '' : 'disabled'} class="${current ? 'current' : ''}">第${chapter.number}章<br>${escapeHtml(chapter.name)}<small>${complete ? '踏破済み' : unlocked ? '探索可能' : '未解禁'}</small></button>`;
  }).join('')}</div>`;
}

function courseNodeDetails(node, chapter) {
  if (node.type === 'start') {
    return { label: node.label, description: 'ここから冒険を始めます。', icon: '出', boss: false };
  }
  if (node.type === 'chest') {
    const chest = chapter.chests.find((entry) => entry.chest_id === node.chest_id);
    return {
      label: chest.label,
      description: rewardText(chest.reward),
      icon: '宝',
      boss: false,
    };
  }
  const encounter = chapter.encounters.find((entry) => entry.enemy_id === node.enemy_id);
  return {
    label: encounter.label,
    description: encounter.description,
    icon: encounter.boss ? '王' : '戦',
    boss: Boolean(encounter.boss),
  };
}

function renderCourseMap(chapter) {
  const progress = getCourseProgress(state, chapter);
  const nodesById = new Map(chapter.course.nodes.map((node) => [node.node_id, node]));
  const nextNode = progress.nextNodeId ? nodesById.get(progress.nextNodeId) : null;
  const nextDetails = nextNode ? courseNodeDetails(nextNode, chapter) : null;
  const lines = chapter.course.links.map((link) => {
    const from = nodesById.get(link.from);
    const to = nodesById.get(link.to);
    const fromState = progress.nodeStates[from.node_id];
    const toState = progress.nodeStates[to.node_id];
    const classes = ['course-link', link.kind];
    if (fromState.cleared) classes.push('open');
    if (toState.cleared) classes.push('complete');
    return `<line class="${classes.join(' ')}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" vector-effect="non-scaling-stroke" />`;
  }).join('');
  const nodes = chapter.course.nodes.map((node) => {
    const details = courseNodeDetails(node, chapter);
    const nodeState = progress.nodeStates[node.node_id];
    const classes = ['course-node', node.type];
    if (details.boss) classes.push('boss');
    if (nodeState.cleared) classes.push('cleared');
    else if (nodeState.unlocked) classes.push('unlocked');
    else classes.push('locked');
    if (node.node_id === progress.nextNodeId) classes.push('next');
    const style = `--course-x:${node.x}%;--course-y:${node.y}%`;
    if (node.type === 'start') {
      return `<div class="${classes.join(' ')}" style="${style}"><span class="course-node-icon">${details.icon}</span><span class="course-node-copy"><strong>${escapeHtml(details.label)}</strong><small>出発地点</small></span></div>`;
    }
    const openedChest = node.type === 'chest' && nodeState.cleared;
    const statusText = nodeState.cleared
      ? node.type === 'chest' ? '回収済み' : '勝利済み・再戦可能'
      : nodeState.unlocked
        ? node.type === 'chest' ? '寄り道して開ける' : details.boss ? 'ボスへの道が開いた！' : '対局可能'
        : '手前の敵に勝つと解禁';
    const action = node.type === 'encounter'
      ? `data-encounter="${node.enemy_id}"`
      : `data-chest="${node.chest_id}"`;
    return `<button class="${classes.join(' ')}" style="${style}" ${action} ${!nodeState.unlocked || openedChest ? 'disabled' : ''} title="${escapeHtml(details.description)}"><span class="course-node-icon">${details.icon}</span><span class="course-node-copy"><strong>${escapeHtml(details.label)}</strong><small>${escapeHtml(statusText)}</small></span></button>`;
  }).join('');
  const markerNode = nodesById.get(progress.markerNodeId);
  const marker = `<div class="course-party" style="--course-x:${markerNode.x}%;--course-y:${markerNode.y}%" aria-label="${escapeHtml(playerDisplayName(state))}と夜古火姫の本道の進行位置"><span class="party-avatar player" title="${escapeHtml(playerDisplayName(state))}">旅</span><span class="party-avatar yakobi" title="夜古火姫">火</span><span class="party-label">進行位置</span></div>`;
  return `<section class="course-panel" aria-label="${escapeHtml(chapter.name)}の冒険コース">
    <div class="course-heading"><div><p class="eyebrow">ADVENTURE COURSE</p><h3>ボスまでの道のり</h3></div><p>${nextDetails ? `次の目的地：${escapeHtml(nextDetails.label)}` : 'この村を踏破しました。何度でも再戦できます。'}</p></div>
    <p class="course-scroll-hint">左右に動かすとコースの先を見られます。</p>
    <div class="course-scroll"><div class="course-map"><svg class="course-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${nodes}${marker}</div></div>
    <div class="course-legend"><span><i class="legend-dot battle"></i>本道（勝利必須）</span><span><i class="legend-dot chest"></i>宝箱（任意）</span><span><i class="legend-dot locked"></i>未解禁</span></div>
  </section>`;
}

function renderVillage() {
  const chapter = world.chapters.find((entry) => entry.chapter_id === state.current_location)
    || world.chapters[state.chapter - 1];
  const quests = (chapter.quests || []).map((quest) => {
    const completed = state.quest_states[quest.quest_id] === 'completed';
    const ready = questIsReady(state, quest);
    return `<article class="card"><h4>${escapeHtml(quest.title)}</h4><p>${escapeHtml(quest.description)}</p><p class="reward">報酬：${escapeHtml(rewardText(quest.reward))}</p><div class="actions"><button data-quest="${quest.quest_id}" ${!ready || completed ? 'disabled' : ''}>${completed ? '達成済み' : ready ? '報告する' : '進行中'}</button></div></article>`;
  }).join('');
  const shop = (chapter.shop || []).map((offer) => {
    const item = catalogs.items.find((entry) => entry.item_id === offer.item_id);
    return `<article class="card"><h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(itemDescription(item))}</p><p>所持 ${state.item_counts[item.item_id] || 0}</p><div class="actions"><button data-buy="${offer.item_id}" ${state.currency < offer.price ? 'disabled' : ''}>${offer.price}${world.currency_name}で買う</button></div></article>`;
  }).join('');
  return `${renderVillageMap()}<section class="hero"><p class="eyebrow">第${chapter.number}章</p><h2>${escapeHtml(chapter.name)}</h2><p class="subtitle">${escapeHtml(chapter.subtitle)}</p></section>
    ${dialogueHtml(chapter.intro)}
    ${renderCourseMap(chapter)}
    <div class="section-head"><div><h3>村の施設</h3><p>頼まれごとと棋具店は、コースの下からいつでも利用できます。</p></div></div>
    <div class="facility-grid"><section class="facility"><h3>頼まれごと</h3><div class="grid">${quests}</div></section><section class="facility"><h3>棋具店</h3><div class="grid">${shop}</div></section></div>`;
}

function itemDescription(item) {
  const descriptions = {
    hint: '対局中、AIが候補手を示します。',
    undo: '直前の自分の手番まで局面を戻します。',
    enemy_debuff_nodes: item.consumable ? '次の対局で1個使い、敵の読みの量を抑えます。' : '装備中、敵の読みの量を抑えます。',
    enemy_debuff_rank: '次の対局で1個使い、敵が最善手から外れる幅を広げます。',
  };
  return descriptions[item.type] || '旅に役立つ棋具です。';
}

function bookCard(book) {
  const unlocked = state.unlocked_books.includes(book.book_id);
  return `<article class="card ${unlocked ? '' : 'locked'}"><span class="badge">第${book.chapter}章</span><h4>${unlocked ? escapeHtml(book.title) : '未入手の定跡書'}</h4><p>${unlocked ? escapeHtml(book.summary) : '村の対局や宝箱から入手できます。'}</p>${unlocked ? `<div class="actions"><button data-book="${book.book_id}">読む</button></div>` : ''}</article>`;
}

function renderBooks() {
  return `<section class="hero"><p class="eyebrow">LIBRARY</p><h2>定跡集</h2><p class="subtitle">勝つための丸暗記ではなく、指し手の目的を振り返る場所です。</p></section><div class="section-head"><h3>集めた定跡書 ${state.unlocked_books.length} / ${catalogs.books.length}</h3></div><div class="grid">${catalogs.books.map(bookCard).join('')}</div>`;
}

function renderInventory() {
  const equipCandidates = catalogs.items.filter((item) => state.unlocked_items.includes(item.item_id)
    && ['enemy_debuff_nodes', 'enemy_debuff_rank'].includes(item.type)
    && (!item.consumable || (state.item_counts[item.item_id] || 0) > 0));
  return `<section class="hero"><p class="eyebrow">INVENTORY</p><h2>持ち物と対局設定</h2><p class="subtitle">難易度はいつでも変更でき、報酬には影響しません。</p></section>
    <div class="section-head"><h3>消費棋具</h3></div><div class="inventory">${catalogs.items.filter((item) => item.consumable).map((item) => `<span>${escapeHtml(item.name)} × ${state.item_counts[item.item_id] || 0}</span>`).join('')}</div>
    <div class="section-head"><h3>設定</h3></div><section class="panel" style="padding:1rem;border-radius:12px"><label>難易度 <select id="difficulty-setting">${catalogs.difficulties.map((entry) => `<option value="${entry.difficulty_id}" ${entry.difficulty_id === state.difficulty ? 'selected' : ''}>${escapeHtml(entry.name)}</option>`).join('')}</select></label>
    <label style="display:block;margin-top:1rem">装備棋具 <select id="item-setting"><option value="">装備しない</option>${equipCandidates.map((item) => `<option value="${item.item_id}" ${state.equipped_item === item.item_id ? 'selected' : ''}>${escapeHtml(item.name)}${item.consumable ? `（所持${state.item_counts[item.item_id] || 0}）` : ''}</option>`).join('')}</select></label><p>消費棋具は次の対局開始時に1個使います。</p><div class="actions" style="margin-top:1rem"><button class="primary" data-save-settings>設定を保存</button></div></section>`;
}

function renderRecovery() {
  const code = formatSaveCode(encodeSaveCode(state));
  return `<section class="hero"><p class="eyebrow">RECOVERY</p><h2>復活の呪文</h2><p class="subtitle">別の端末へ、名前と七村の旅の記録を移せます。</p></section>
    <section class="panel" style="margin-top:1rem;padding:1rem;border-radius:12px"><label>現在の復活の呪文<textarea id="save-code-output" readonly style="width:100%;min-height:7rem;margin-top:.5rem;background:#17120e;color:#f7eedb">${escapeHtml(code)}</textarea></label><button data-copy-code>コピー</button>
    <label style="display:block;margin-top:1.5rem">復元する呪文<textarea id="save-code-input" style="width:100%;min-height:7rem;margin-top:.5rem;background:#17120e;color:#f7eedb"></textarea></label><button class="primary" data-restore-code>復元する</button></section>`;
}

function renderEnding() {
  app.innerHTML = `<section class="ending"><div class="ending-card"><p class="eyebrow">ENDING</p><h1>七つの学びを、一局へ</h1>${dialogueHtml(world.chapters[6].completion)}<p>${escapeHtml(playerDisplayName(state))}の旅は終わっても、将棋には同じ一局が二つとありません。</p><p>夜古火姫は、次の一局にも笑顔でついてきます。</p><button class="primary" data-continue>村へ戻って指し続ける</button></div></section>`;
  document.querySelector('[data-continue]').addEventListener('click', render);
}

function render() {
  if (!state.profile_created) return renderProfile();
  if (state.defeated_enemies.includes(world.chapters.at(-1).boss_id)
    && sessionStorage.getItem('shogi_rpg_ending_seen') !== '1') {
    sessionStorage.setItem('shogi_rpg_ending_seen', '1');
    return renderEnding();
  }
  const view = activeView === 'books' ? renderBooks()
    : activeView === 'inventory' ? renderInventory()
      : activeView === 'recovery' ? renderRecovery() : renderVillage();
  app.innerHTML = `<div class="shell">${renderHeader()}${view}<footer class="footer">対局、ルール判定、セーブはすべてブラウザ内で動作します。</footer></div>`;
  bindEvents();
  if (activeView === 'village') {
    requestAnimationFrame(() => {
      const scroller = app.querySelector('.course-scroll');
      const target = app.querySelector('.course-node.next') || app.querySelector('.course-party');
      if (!scroller || !target) return;
      const targetCenter = target.offsetLeft + target.offsetWidth / 2;
      scroller.scrollLeft = Math.max(0, targetCenter - scroller.clientWidth / 2);
    });
  }
}

function showBook(bookId) {
  const book = catalogs.books.find((entry) => entry.book_id === bookId);
  if (!book || !state.unlocked_books.includes(bookId)) return;
  modal(book.title, `<p>${escapeHtml(book.summary)}</p><ol class="book-steps">${book.steps.map((step) => `<li><strong>${escapeHtml(step.title)}</strong>（${escapeHtml(step.move)}${step.reply ? ` → ${escapeHtml(step.reply)}` : ''}）<br>${escapeHtml(step.text)}</li>`).join('')}</ol>`);
}

async function startEncounter(enemyId) {
  const chapter = world.chapters.find((entry) => entry.encounters.some((item) => item.enemy_id === enemyId));
  if (!chapter || chapter.number > state.chapter || chapter.chapter_id !== state.current_location) {
    await modal('まだこの村へ進めません', '<p>解禁済みの村を選び、表示中のコースから対局してください。</p>');
    return;
  }
  const encounter = chapter.encounters.find((entry) => entry.enemy_id === enemyId);
  const courseNode = chapter.course.nodes.find((node) => node.enemy_id === enemyId);
  if (!courseNodeIsAvailable(state, chapter, courseNode.node_id)) {
    await modal('まだ先へ進めません', '<p>本道の手前にいる相手へ勝つと、この道が開きます。</p>');
    return;
  }
  const firstVictory = !state.defeated_enemies.includes(enemyId);
  const actions = [{ label: '戻る', value: false }];
  if (encounter.guide_id && state.unlocked_books.includes(encounter.guide_id)) {
    actions.push({ label: '作戦を見る', value: 'guide' });
  }
  actions.push({ label: '対局開始', value: true, primary: true });
  const reward = firstVictory
    ? `初回報酬：${rewardText(encounter.reward)}`
    : `再戦報酬：${world.repeat_victory_currency}${world.currency_name}`;
  const accepted = await modal(encounter.label, `<p>${escapeHtml(encounter.description)}</p><p>${escapeHtml(encounter.intro)}</p><p class="reward">${escapeHtml(reward)}</p><p>難易度：${escapeHtml(catalogs.difficulties.find((entry) => entry.difficulty_id === state.difficulty).name)}</p>`, actions);
  if (accepted === 'guide') {
    showBook(encounter.guide_id);
    return;
  }
  if (!accepted) return;
  const config = {
    matchId: `rpg.${enemyId}.${Date.now()}`,
    enemyId,
    formationId: 'standard',
    difficultyId: state.difficulty,
    itemId: state.equipped_item,
  };
  try {
    const message = await openMatchFrame(config);
    state = loadSaveState(localStorage, saveContext).state;
    if (message.result.outcome === 'win') {
      const previousLevel = state.player_level;
      const result = applyEncounterVictory(
        state,
        chapter,
        encounter,
        progression,
        { firstVictory },
      );
      save(result.state);
      const levelUp = state.player_level > previousLevel ? `<p class="done">レベル${state.player_level}になりました！</p>` : '';
      const completion = result.chapterCompleted ? dialogueHtml(chapter.completion) : '';
      await modal('勝利', `<p>${escapeHtml(encounter.victory)}</p><p class="reward">${result.firstVictory ? escapeHtml(rewardText(encounter.reward)) : `再戦報酬：${world.repeat_victory_currency}${world.currency_name}`}</p>${levelUp}${completion}`);
    } else {
      await modal(message.result.outcome === 'draw' ? '引き分け' : '敗北', `<p>${escapeHtml(encounter.loss)}</p><p>進行を失うことはありません。準備を整えて何度でも再挑戦できます。</p>`);
    }
    render();
  } catch (error) {
    await modal('対局を開始できませんでした', `<p>${escapeHtml(error.message)}</p>`);
  }
}

function bindEvents() {
  app.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
    activeView = button.dataset.view;
    render();
  }));
  app.querySelectorAll('[data-chapter]').forEach((button) => button.addEventListener('click', async () => {
    const chapter = world.chapters.find((entry) => entry.chapter_id === button.dataset.chapter);
    if (!chapter || chapter.number > state.chapter) {
      await modal('まだこの村へ進めません', '<p>手前の村のボスに勝つと道が開きます。</p>');
      return;
    }
    save({ ...state, current_location: chapter.chapter_id });
    activeView = 'village';
    render();
  }));
  app.querySelectorAll('[data-book]').forEach((button) => button.addEventListener('click', () => showBook(button.dataset.book)));
  app.querySelectorAll('[data-encounter]').forEach((button) => button.addEventListener('click', () => startEncounter(button.dataset.encounter)));
  app.querySelectorAll('[data-chest]').forEach((button) => button.addEventListener('click', async () => {
    const chapter = world.chapters.find((entry) => entry.chapter_id === state.current_location);
    if (!chapter || chapter.number > state.chapter) {
      await modal('まだこの村へ進めません', '<p>手前の村のボスに勝つと道が開きます。</p>');
      return;
    }
    const chest = chapter.chests.find((entry) => entry.chest_id === button.dataset.chest);
    if (!chest) {
      await modal('宝箱を見つけられません', '<p>表示中のコースから宝箱を選んでください。</p>');
      return;
    }
    const courseNode = chapter.course.nodes.find((node) => node.chest_id === chest.chest_id);
    if (!courseNodeIsAvailable(state, chapter, courseNode.node_id)) {
      await modal('まだ宝箱へ行けません', '<p>分かれ道の手前にいる相手へ勝つと、この道が開きます。</p>');
      return;
    }
    save(openChest(state, chest, progression));
    await modal('宝箱を開けた', `<p>${escapeHtml(rewardText(chest.reward))}を手に入れました。</p>`);
    render();
  }));
  app.querySelectorAll('[data-quest]').forEach((button) => button.addEventListener('click', async () => {
    const chapter = world.chapters.find((entry) => entry.chapter_id === state.current_location);
    const quest = chapter.quests.find((entry) => entry.quest_id === button.dataset.quest);
    save(claimQuest(state, quest, progression));
    await modal('頼まれごと達成', `<p>${escapeHtml(rewardText(quest.reward))}を受け取りました。</p>`);
    render();
  }));
  app.querySelectorAll('[data-buy]').forEach((button) => button.addEventListener('click', async () => {
    const chapter = world.chapters.find((entry) => entry.chapter_id === state.current_location);
    const offer = chapter.shop.find((entry) => entry.item_id === button.dataset.buy);
    const item = catalogs.items.find((entry) => entry.item_id === offer.item_id);
    save(buyShopItem(state, offer, item));
    await modal('購入しました', `<p>${escapeHtml(item.name)}を1個受け取りました。</p>`);
    render();
  }));
  app.querySelector('[data-save-settings]')?.addEventListener('click', async () => {
    save({ ...state, difficulty: app.querySelector('#difficulty-setting').value, equipped_item: app.querySelector('#item-setting').value || null });
    await modal('設定を保存しました', '<p>次の対局から反映されます。</p>');
    render();
  });
  app.querySelector('[data-copy-code]')?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(app.querySelector('#save-code-output').value);
    await modal('コピーしました', '<p>復活の呪文を安全な場所へ保管してください。</p>');
  });
  app.querySelector('[data-restore-code]')?.addEventListener('click', async () => {
    try {
      save(decodeSaveCode(app.querySelector('#save-code-input').value, saveContext));
      await modal('復元しました', '<p>七つの村の記録を読み込みました。</p>');
      activeView = 'village';
      render();
    } catch (error) {
      await modal('復元できませんでした', `<p>${escapeHtml(error.message)}</p>`);
    }
  });
}

async function main() {
  try {
    const [rawWorld, books, setup] = await Promise.all([
      fetchJson('/data/world.json'),
      fetchJson('/data/books.json'),
      loadMatchSetupOptions({
        enemiesUrl: '/data/enemies.json',
        formationsUrl: '/data/formations.json',
        formationCalloutsUrl: '/data/formation_callouts.json',
        difficultyUrl: '/data/difficulty.json',
        itemsUrl: '/data/items.json',
        levelUnlocksUrl: '/data/level_unlocks.json',
      }),
    ]);
    world = rawWorld;
    catalogs = { books, ...setup };
    validateBooksMaster(books);
    const validation = validateWorldMaster(world, catalogs);
    saveContext = buildSaveContext(catalogs, validation);
    progression = { world, items: setup.items, levelUnlocks: setup.levelUnlocks };
    const loaded = loadSaveState(localStorage, saveContext);
    state = reconcileChapterProgress(loaded.state, world);
    if (state !== loaded.state) save(state);
    if (state.profile_created) {
      const availableGuides = world.chapters
        .filter((chapter) => chapter.number <= state.chapter)
        .flatMap((chapter) => chapter.guide_books || []);
      const unlockedBooks = [...new Set([...state.unlocked_books, ...availableGuides])];
      if (unlockedBooks.length !== state.unlocked_books.length) {
        save({ ...state, unlocked_books: unlockedBooks });
      }
    }
    if (loaded.warning && !state.profile_created) return renderProfile(loaded.warning);
    render();
  } catch (error) {
    app.innerHTML = `<div class="fatal"><section><h1>旅を始められませんでした</h1><p>${escapeHtml(error.message)}</p></section></div>`;
    console.error(error);
  }
}

main();
