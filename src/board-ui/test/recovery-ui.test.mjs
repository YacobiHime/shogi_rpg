import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexUrl = new URL('../index.html', import.meta.url);
const mainUrl = new URL('../main.js', import.meta.url);

test('展示運用に必要な復旧操作が画面に用意されている', async () => {
  const html = await readFile(indexUrl, 'utf8');

  assert.match(html, /id="restart-button"[^>]*>対局条件を選び直す</);
  assert.match(html, /id="result-retry"[^>]*>同じ条件でもう一度</);
  assert.match(html, /id="loading-retry"[^>]*hidden[^>]*>再試行</);
  assert.match(html, /id="connection-status"[^>]*role="status"[^>]*hidden/);
});

test('ヒントと待ったの操作と残り回数表示が用意されている', async () => {
  const html = await readFile(indexUrl, 'utf8');

  assert.match(html, /id="hint-button"[^>]*>ヒント（残り0）</);
  assert.match(html, /id="undo-button"[^>]*>待った（残り0）</);
  assert.match(html, /id="hint-message"[^>]*role="status"/);
});

test('復旧操作とオンライン状態のイベントがエントリポイントに接続されている', async () => {
  const source = await readFile(mainUrl, 'utf8');

  assert.match(source, /restartButton\.addEventListener\('click'/);
  assert.match(source, /window\.location\.assign\(window\.location\.pathname\)/);
  assert.match(source, /resultRetryButton\.addEventListener\('click', reloadPage\)/);
  assert.match(source, /loadingRetryButton\.addEventListener\('click', reloadPage\)/);
  assert.match(source, /window\.addEventListener\('offline', updateConnectionStatus\)/);
  assert.match(source, /navigator\.wakeLock\.request\('screen'\)/);
});
