/**
 * src/engine/engine.js
 *
 * YaneuraOu.wasm(USIプロトコル)のメインスレッド直接呼び出しラッパー。
 *
 * 実装パターンは tools/m0-verification/index-mainthread.html の initEngine() を
 * そのまま移植したもの。以下の制約は docs/CLAUDE.md「WASM将棋エンジン統合時の必須知識」
 * に従っているので、変更する場合は必ずそちらを読むこと。
 *
 * - Web Workerを一切使わず、メインスレッドから直接エンジンのファクトリ関数を呼び出す
 *   （入れ子Worker構成はcreateObjectURLエラーで動作しないためNG）
 * - 評価関数(nn.bin)はpreRunフックでモジュール初期化前に仮想FSへ書き込む
 * - 開発用HTTPサーバーはContent-Lengthヘッダーを明示的に返す必要がある
 *   （tools/m0-verification-suisho5/server.js に実装例あり）
 */

/**
 * @typedef {Object} EngineOptions
 * @property {() => Promise<any>} factory
 *   エンジンのグローバルファクトリ関数（例: window.YaneuraOu）。
 *   npmパッケージ同梱のyaneuraou.jsを読み込むとグローバルに生える。
 * @property {string} [nnuePath]
 *   評価関数ファイル(nn.bin等)のURL。本番エンジン(水匠5/hao)では必須。
 *   軽量版(arashigaoka)のように評価関数がwasm.data内に同梱されている場合は不要。
 * @property {string} [nnueVirtualPath] 仮想FS上の書き込み先パス（省略時 '/nn.bin'）
 */

export class ShogiEngine {
  /** @param {EngineOptions} options */
  constructor(options) {
    this.factory = options.factory;
    this.nnuePath = options.nnuePath || null;
    this.nnueVirtualPath = options.nnueVirtualPath || '/nn.bin';
    this.instance = null;
    /** @type {((line: string) => void)[]} */
    this._listeners = [];
  }

  /**
   * 出力行のリスナーを登録する。"usiok" "readyok" "bestmove ..." 等の
   * USI出力テキストが1行ずつそのまま渡される。
   * @param {(line: string) => void} listener
   */
  onOutput(listener) {
    this._listeners.push(listener);
  }

  _emit(line) {
    for (const listener of this._listeners) listener(line);
  }

  /**
   * エンジンを初期化し、'usiok' を受け取るまで待つ。
   * @returns {Promise<void>}
   */
  async init() {
    if (this.instance) throw new Error('既に初期化済みです');

    /** @type {{ preRun: ((mod: any) => void)[] }} */
    const moduleArgs = { preRun: [] };

    if (this.nnuePath) {
      // CLAUDE.md 2. の注意事項:
      // preRunフックでモジュール初期化前に仮想ファイルシステムへ書き込む。
      // 初期化後にFS.writeFile()すると別スレッドから見えず失敗する。
      const nnBytes = new Uint8Array(await (await fetch(this.nnuePath)).arrayBuffer());
      moduleArgs.preRun.push((mod) => mod.FS.writeFile(this.nnueVirtualPath, nnBytes));
    }

    this.instance = await this.factory(moduleArgs);
    this.instance.addMessageListener((line) => this._emit(line));

    await this._sendAndWaitFor('usi', (line) => line === 'usiok');
  }

  /**
   * 'isready' を送り 'readyok' を待つ。本番評価関数では1.3〜1.4秒程度かかる
   * （CLAUDE.md 6. 参照）ので、呼び出し側でローディングUIを出すこと。
   */
  async ready() {
    await this._sendAndWaitFor('isready', (line) => line === 'readyok');
  }

  /** @param {string} sfen 'startpos' または 'sfen ...' の形式は付けず局面文字列のみ渡す */
  newGame() {
    this.send('usinewgame');
  }

  /** @param {string} sfenOrStartpos 例: 'startpos' か 'sfen <SFEN> moves ...' */
  setPosition(sfenOrStartpos) {
    if (sfenOrStartpos === 'startpos' || sfenOrStartpos.startsWith('startpos')) {
      this.send('position ' + sfenOrStartpos);
    } else {
      this.send('position sfen ' + sfenOrStartpos);
    }
  }

  /**
   * 思考を開始し、bestmoveを待って返す。
   * nodesを強さの基準とし、maxTimeMsは極端に遅い端末向けの安全上限として使う。
   * @param {{ movetime?: number, nodes?: number, maxTimeMs?: number }} goOptions
   * @returns {Promise<{ move: string, ponder?: string }>}
   */
  async go(goOptions = {}) {
    let cmd = 'go';
    if (goOptions.movetime) cmd += ' movetime ' + goOptions.movetime;
    if (goOptions.nodes) cmd += ' nodes ' + goOptions.nodes;

    return new Promise((resolve) => {
      const timeoutId = goOptions.maxTimeMs
        ? setTimeout(() => this.send('stop'), goOptions.maxTimeMs)
        : null;
      const listener = (line) => {
        if (line.startsWith('bestmove')) {
          const parts = line.split(' ');
          this._listeners.splice(this._listeners.indexOf(listener), 1);
          if (timeoutId !== null) clearTimeout(timeoutId);
          resolve({ move: parts[1], ponder: parts[3] });
        }
      };
      this.onOutput(listener);
      this.send(cmd);
    });
  }

  /**
   * 敵の強さパラメータ(docs/SYSTEM_DESIGN.md 2.3節)をUSIオプションへ反映する。
   * @param {{ multiPv?: number }} params
   */
  applyStrengthOptions(params = {}) {
    if (params.multiPv) {
      this.send('setoption name MultiPV value ' + params.multiPv);
    }
  }

  send(command) {
    if (!this.instance) throw new Error('エンジンが初期化されていません');
    this.instance.postMessage(command);
  }

  quit() {
    if (this.instance) this.send('quit');
  }

  _sendAndWaitFor(command, predicate) {
    return new Promise((resolve) => {
      const listener = (line) => {
        if (predicate(line)) {
          this._listeners.splice(this._listeners.indexOf(listener), 1);
          resolve();
        }
      };
      this.onOutput(listener);
      this.send(command);
    });
  }
}
