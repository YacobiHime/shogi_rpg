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
 * @property {() => Promise<any>} [fallbackFactory]
 *   NNUE取得または主エンジン初期化に失敗した場合に使う内蔵評価版ファクトリ。
 * @property {string} [nnuePath]
 *   評価関数ファイル(nn.bin等)のURL。本番エンジン(水匠5/hao)では必須。
 *   軽量版(arashigaoka)のように評価関数がwasm.data内に同梱されている場合は不要。
 * @property {string} [nnueVirtualPath] 仮想FS上の書き込み先パス（省略時 '/nn.bin'）
 * @property {typeof fetch} [fetchImpl] 評価関数の取得処理（テスト差し替え用）
 * @property {(details: { path: string, error: Error, stage: string }) => void} [onNnueFallback]
 *   評価関数を取得できず、内蔵評価関数へフォールバックした際の通知先。
 */

export class ShogiEngine {
  /** @param {EngineOptions} options */
  constructor(options) {
    this.factory = options.factory;
    this.fallbackFactory = options.fallbackFactory || null;
    this.nnuePath = options.nnuePath || null;
    this.nnueVirtualPath = options.nnueVirtualPath || '/nn.bin';
    this.fetchImpl = options.fetchImpl || fetch;
    this.onNnueFallback = options.onNnueFallback || null;
    this.activeNnuePath = null;
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

    let factory = this.factory;
    if (this.nnuePath) {
      // CLAUDE.md 2. の注意事項:
      // preRunフックでモジュール初期化前に仮想ファイルシステムへ書き込む。
      // 初期化後にFS.writeFile()すると別スレッドから見えず失敗する。
      try {
        // Window.fetchはメソッドとして別オブジェクトへ束縛するとIllegal invocationになる。
        const fetchImpl = this.fetchImpl;
        const response = await fetchImpl(this.nnuePath);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const nnBytes = new Uint8Array(await response.arrayBuffer());
        if (nnBytes.byteLength === 0) {
          throw new Error('評価関数ファイルが空です');
        }
        moduleArgs.preRun.push((mod) => mod.FS.writeFile(this.nnueVirtualPath, nnBytes));
        this.activeNnuePath = this.nnuePath;
      } catch (cause) {
        const error = cause instanceof Error ? cause : new Error(String(cause));
        this.activeNnuePath = null;
        if (this.onNnueFallback) {
          this.onNnueFallback({ path: this.nnuePath, error, stage: 'fetch' });
        }
        if (this.fallbackFactory) factory = this.fallbackFactory;
      }
    }

    try {
      this.instance = await factory(moduleArgs);
    } catch (cause) {
      if (!this.fallbackFactory || factory === this.fallbackFactory) throw cause;
      const error = cause instanceof Error ? cause : new Error(String(cause));
      this.activeNnuePath = null;
      if (this.onNnueFallback) {
        this.onNnueFallback({ path: this.nnuePath, error, stage: 'engine' });
      }
      this.instance = await this.fallbackFactory({ preRun: [] });
    }
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
   * @returns {Promise<{
   *   move: string,
   *   ponder?: string,
   *   candidates: { rank: number, move: string }[]
   * }>}
   */
  async go(goOptions = {}) {
    let cmd = 'go';
    if (goOptions.movetime) cmd += ' movetime ' + goOptions.movetime;
    if (goOptions.nodes) cmd += ' nodes ' + goOptions.nodes;

    return new Promise((resolve) => {
      const candidates = new Map();
      const timeoutId = goOptions.maxTimeMs
        ? setTimeout(() => this.send('stop'), goOptions.maxTimeMs)
        : null;
      const listener = (line) => {
        if (line.startsWith('info ')) {
          const rankMatch = line.match(/\bmultipv\s+(\d+)\b/);
          const moveMatch = line.match(/\bpv\s+(\S+)/);
          if (rankMatch && moveMatch) {
            candidates.set(Number(rankMatch[1]), moveMatch[1]);
          }
        }
        if (line.startsWith('bestmove')) {
          const parts = line.split(' ');
          this._listeners.splice(this._listeners.indexOf(listener), 1);
          if (timeoutId !== null) clearTimeout(timeoutId);
          candidates.set(1, parts[1]);
          resolve({
            move: parts[1],
            ponder: parts[3],
            candidates: [...candidates.entries()]
              .map(([rank, move]) => ({ rank, move }))
              .sort((left, right) => left.rank - right.rank),
          });
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
    if (params.multiPv !== undefined) {
      if (!Number.isInteger(params.multiPv) || params.multiPv < 1) {
        throw new Error('multiPvは1以上の整数にしてください');
      }
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
