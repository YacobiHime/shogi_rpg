// YaneuraOu Web Worker for M0 Verification
// arashigaoka/YaneuraOu.wasm v0.1.2

// Import YaneuraOu WASM module
importScripts('yaneuraou.js');

let yaneuraouInstance = null;
let messageListeners = [];
let currentMultiPV = 1;

// Worker message handler
self.onmessage = async function(e) {
  const data = e.data;

  if (data.type === 'command') {
    if (!yaneuraouInstance) {
      self.postMessage({ type: 'error', message: 'YaneuraOu not initialized' });
      return;
    }

    // USIコマンドをログに出力
    self.postMessage({ type: 'log', message: '> ' + data.command });

    // USIコマンドを送信
    yaneuraouInstance.postMessage(data.command);
  }
};

// Initialize YaneuraOu
async function initYaneuraOu() {
  try {
    // YaneuraOuインスタンスを作成
    yaneuraouInstance = await YaneuraOu();

    // メッセージリスナーを設定
    yaneuraouInstance.addMessageListener((line) => {
      handleEngineOutput(line);
    });

    self.postMessage({ type: 'initialized' });
  } catch (e) {
    self.postMessage({ type: 'error', message: 'Initialization failed: ' + e.message });
    console.error(e);
  }
}

// エンジンからの出力を処理
function handleEngineOutput(line) {
  // USIプロトコルの解析

  // readyok
  if (line === 'readyok') {
    self.postMessage({ type: 'readyok' });
  }
  // usiou
  else if (line === 'usiok') {
    self.postMessage({ type: 'usiok' });
  }
  // bestmove
  else if (line.startsWith('bestmove')) {
    const parts = line.split(' ');
    const move = parts[1] || 'resign';
    self.postMessage({ type: 'bestmove', move: move, full: line });
  }
  // info (思考情報)
  else if (line.startsWith('info')) {
    // MultiPVの情報を含む場合
    if (line.includes('multipv')) {
      const multipvMatch = line.match(/multipv (\d+)/);
      const scoreMatch = line.match(/score cp (-?\d+)/);
      const depthMatch = line.match(/depth (\d+)/);
      const nodesMatch = line.match(/nodes (\d+)/);
      const pvMatch = line.match(/pv (.+)/);

      if (multipvMatch) {
        const pv = parseInt(multipvMatch[1]);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
        const depth = depthMatch ? parseInt(depthMatch[1]) : null;
        const nodes = nodesMatch ? parseInt(nodesMatch[1]) : null;
        const pvMoves = pvMatch ? pvMatch[1].split(' ').slice(0, 5).join(' ') : '';

        self.postMessage({
          type: 'info',
          message: line,
          pv: pv,
          score: score,
          depth: depth,
          nodes: nodes,
          pvMoves: pvMoves
        });
      } else {
        self.postMessage({ type: 'info', message: line });
      }
    } else {
      self.postMessage({ type: 'info', message: line });
    }
  }
  // その他の出力
  else {
    self.postMessage({ type: 'log', message: line });
  }
}

// 初期化開始
initYaneuraOu();
