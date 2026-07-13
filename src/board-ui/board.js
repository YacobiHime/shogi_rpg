/**
 * src/board-ui/board.js
 *
 * 盤面表示・駒移動UI（マイルストーン1: 最小構成）。
 *
 * ルール判定(合法手・成り・持ち駒・王手/詰み)は shogi.js (na2hiro/Shogi.js, MIT)
 * に委譲する。盤面の見た目(SVG描画)はこのファイルで自作する。
 *
 * 注意: shogi.js は開発時に `npm install shogi.js` した上で、ビルド済みモジュールを
 * このファイルと同じ vendor/ ディレクトリにコピーして使う想定（README参照）。
 * 実装するにあたっては、使用するバージョンのAPI仕様を
 * https://github.com/na2hiro/Kifu-for-JS/tree/master/packages/shogi.js の
 * TypeDocドキュメント・testディレクトリで必ず確認すること
 * （move/drop/getMovesFromの引数順、座標系(x:筋 1-9, y:段 1-9)等）。
 */

// TODO(実装時に確認): vendorへコピーしたパスに合わせて調整する
import { Shogi, Kind, Color } from './vendor/shogi.esm.js';

const BOARD_SIZE = 9;
const CELL = 56; // px相当のSVG座標単位
const MARGIN = 40;
const SVG_NS = 'http://www.w3.org/2000/svg';

// 駒種 -> 表示用の一文字表記（画像素材が揃うまでの暫定表示）
const KIND_LABEL = {
  [Kind.FU]: '歩', [Kind.KY]: '香', [Kind.KE]: '桂', [Kind.GI]: '銀',
  [Kind.KI]: '金', [Kind.KA]: '角', [Kind.HI]: '飛', [Kind.OU]: '玉',
  [Kind.TO]: 'と', [Kind.NKY]: '成香', [Kind.NKE]: '成桂', [Kind.NGI]: '成銀',
  [Kind.UM]: '馬', [Kind.RY]: '龍',
};

export class BoardView {
  /**
   * @param {HTMLElement} container
   * @param {{ onMove?: (usiMove: string) => void }} [callbacks]
   */
  constructor(container, callbacks = {}) {
    this.container = container;
    this.onMove = callbacks.onMove || (() => {});
    this.shogi = new Shogi(); // 平手初期局面で開始（コンストラクタ引数はshogi.js仕様に従い要確認）
    this.selected = null; // { x, y } または { hand: { color, kind } }
    this.humanColor = Color.Black; // M1では人間=先手固定
    this._buildSvg();
    this.render();
  }

  _buildSvg() {
    const width = MARGIN * 2 + CELL * BOARD_SIZE;
    const height = MARGIN * 2 + CELL * BOARD_SIZE + 80; // 上下の持ち駒表示分
    this.svg = document.createElementNS(SVG_NS, 'svg');
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('width', '100%');
    this.svg.style.background = 'var(--board-bg, #f2c98a)';
    this.container.appendChild(this.svg);
  }

  /** 現局面をSVGへ再描画する */
  render() {
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
    this._drawGrid();
    this._drawPieces();
    this._drawHands();
  }

  _drawGrid() {
    for (let i = 0; i <= BOARD_SIZE; i++) {
      const line1 = this._line(
        MARGIN + i * CELL, MARGIN + 40,
        MARGIN + i * CELL, MARGIN + 40 + CELL * BOARD_SIZE
      );
      const line2 = this._line(
        MARGIN, MARGIN + 40 + i * CELL,
        MARGIN + CELL * BOARD_SIZE, MARGIN + 40 + i * CELL
      );
      this.svg.appendChild(line1);
      this.svg.appendChild(line2);
    }
  }

  _line(x1, y1, x2, y2) {
    const el = document.createElementNS(SVG_NS, 'line');
    el.setAttribute('x1', x1); el.setAttribute('y1', y1);
    el.setAttribute('x2', x2); el.setAttribute('y2', y2);
    el.setAttribute('stroke', '#333');
    el.setAttribute('stroke-width', '1');
    return el;
  }

  /** 盤上マス(x:1-9筋, y:1-9段)の中心座標(SVG座標)を返す */
  _cellCenter(x, y) {
    // x=9が左端(1筋)になるよう反転して描画する
    const col = BOARD_SIZE - x;
    const row = y - 1;
    return {
      cx: MARGIN + col * CELL + CELL / 2,
      cy: MARGIN + 40 + row * CELL + CELL / 2,
    };
  }

  _drawPieces() {
    for (let x = 1; x <= BOARD_SIZE; x++) {
      for (let y = 1; y <= BOARD_SIZE; y++) {
        const piece = this.shogi.board[x][y]; // TODO: 実際のプロパティ名を確認(board[x][y]想定)
        if (!piece) continue;
        this._drawPieceAt(x, y, piece);
      }
    }
  }

  _drawPieceAt(x, y, piece) {
    const { cx, cy } = this._cellCenter(x, y);
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('transform', `translate(${cx},${cy})${piece.color === Color.White ? ' rotate(180)' : ''}`);
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => this._handleCellClick(x, y));

    const rect = document.createElementNS(SVG_NS, 'polygon');
    rect.setAttribute('points', '0,-24 18,16 -18,16');
    rect.setAttribute('fill', '#f5deb3');
    rect.setAttribute('stroke', '#000');
    g.appendChild(rect);

    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', '0'); text.setAttribute('y', '8');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '18');
    text.textContent = KIND_LABEL[piece.kind] || '?';
    g.appendChild(text);

    this.svg.appendChild(g);
  }

  _drawHands() {
    // 持ち駒表示（暫定: テキストのみ、打つ操作は駒名クリック→着手先クリックの2段階）
    [Color.Black, Color.White].forEach((color, i) => {
      const hand = this.shogi.hands[color] || []; // TODO: 実際のプロパティ名を確認
      const y = i === 0 ? MARGIN + 40 + CELL * BOARD_SIZE + 20 : 20;
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', MARGIN);
      text.setAttribute('y', y);
      text.setAttribute('font-size', '16');
      const label = hand.map((p) => KIND_LABEL[p.kind]).join(' ') || '（持ち駒なし）';
      text.textContent = `${color === Color.Black ? '先手' : '後手'}持ち駒: ${label}`;
      text.style.cursor = hand.length ? 'pointer' : 'default';
      text.addEventListener('click', () => {
        if (!hand.length) return;
        this.selected = { hand: { color, kind: hand[0].kind } };
      });
      this.svg.appendChild(text);
    });
  }

  _handleCellClick(x, y) {
    if (this.shogi.turn !== this.humanColor) return; // 自分の手番以外は無視

    if (this.selected && this.selected.hand) {
      this._tryDrop(this.selected.hand.color, this.selected.hand.kind, x, y);
      this.selected = null;
      return;
    }

    if (!this.selected) {
      const piece = this.shogi.board[x][y];
      if (piece && piece.color === this.humanColor) {
        this.selected = { x, y };
      }
      return;
    }

    this._tryMove(this.selected.x, this.selected.y, x, y);
    this.selected = null;
  }

  async _tryMove(fromX, fromY, toX, toY) {
    const moves = this.shogi.getMovesFrom(fromX, fromY); // TODO: 実際のAPI名を確認
    const candidate = moves.find((m) => m.to.x === toX && m.to.y === toY);
    if (!candidate) return; // 合法手でない

    let promote = false;
    if (candidate.promote !== undefined && this._canChoosePromote(fromX, fromY, toX, toY)) {
      promote = window.confirm('成りますか？');
    }

    this.shogi.move(fromX, fromY, toX, toY, promote); // TODO: 引数順を要確認
    this.render();
    this.onMove(this._toUsiMove(fromX, fromY, toX, toY, promote));
  }

  async _tryDrop(color, kind, x, y) {
    if (color !== this.humanColor) return;
    try {
      this.shogi.drop(x, y, kind); // TODO: 引数順を要確認
      this.render();
      this.onMove(this._toUsiDrop(kind, x, y));
    } catch (e) {
      console.warn('打てないマスです', e);
    }
  }

  _canChoosePromote(fromX, fromY, toX, toY) {
    // 成れるかどうかの簡易判定は shogi.js 側の候補手情報(promote可否)に委ねるべきだが、
    // M1最小構成では「相手陣に入る/出る動きなら確認ダイアログを出す」程度の簡略実装とする。
    const enemyZone = (y) => (this.humanColor === Color.Black ? y <= 3 : y >= 7);
    return enemyZone(fromY) || enemyZone(toY);
  }

  _toUsiMove(fromX, fromY, toX, toY, promote) {
    const file = (x) => String(x);
    const rank = (y) => String.fromCharCode('a'.charCodeAt(0) + y - 1);
    return `${file(fromX)}${rank(fromY)}${file(toX)}${rank(toY)}${promote ? '+' : ''}`;
  }

  _toUsiDrop(kind, x, y) {
    const KIND_USI = { [Kind.FU]: 'P', [Kind.KY]: 'L', [Kind.KE]: 'N', [Kind.GI]: 'S', [Kind.KI]: 'G', [Kind.KA]: 'B', [Kind.HI]: 'R' };
    const rank = (y) => String.fromCharCode('a'.charCodeAt(0) + y - 1);
    return `${KIND_USI[kind]}*${x}${rank(y)}`;
  }

  /** エンジンから返されたUSI形式の指し手をこちらの盤面にも反映する（敵の指し手適用用） */
  applyUsiMove(usiMove) {
    // TODO: ドロップ("P*5e"等)・成り("+")を含めたUSI文字列パースの実装
    // M1実装時に、shogi.js側のUSI変換ヘルパーがあれば優先的に使うこと
    throw new Error('applyUsiMove: 未実装 (M1実装時に対応)');
  }

  toSfen() {
    return this.shogi.toSFENString(1); // TODO: 引数(手数)の扱いを要確認
  }
}
