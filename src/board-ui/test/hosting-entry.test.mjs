import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const boardIndexUrl = new URL('../index.html', import.meta.url);
const novelIndexUrl = new URL('../../novel/index.html', import.meta.url);
const firebaseConfigUrl = new URL('../../../firebase.json', import.meta.url);

test('Firebase Hostingのルートをノベルにし、対局UI資産も正しいパスから読む', async () => {
  const [boardIndexHtml, novelIndexHtml, firebaseConfigText] = await Promise.all([
    readFile(boardIndexUrl, 'utf8'),
    readFile(novelIndexUrl, 'utf8'),
    readFile(firebaseConfigUrl, 'utf8'),
  ]);
  const firebaseConfig = JSON.parse(firebaseConfigText);
  const rootRewrite = firebaseConfig.hosting.rewrites.find(
    ({ source }) => source === '/'
  );
  const baseHref = boardIndexHtml.match(/<base\s+href="([^"]+)">/)?.[1];

  assert.equal(rootRewrite?.destination, '/index.html');
  assert.match(novelIndexHtml, /src="\/src\/novel\/tyrano-match-tag\.mjs"/);
  assert.equal(baseHref, '/src/board-ui/');

  const documentBase = new URL(baseHref, 'https://example.test/');
  const mainScript = boardIndexHtml.match(
    /<script\s+type="module"\s+src="([^"]+)"/
  )?.[1];
  assert.equal(new URL(mainScript, documentBase).pathname, '/src/board-ui/main.js');
  assert.ok(new URL(mainScript, documentBase).search);
  assert.equal(
    new URL('../../data/enemies.json', documentBase).pathname,
    '/data/enemies.json'
  );

  const codeCacheRule = firebaseConfig.hosting.headers.find(
    ({ regex }) => regex === '.*\\.(html|js|mjs|json)$'
  );
  const rootCacheRule = firebaseConfig.hosting.headers.find(
    ({ source }) => source === '/'
  );
  assert.match(codeCacheRule?.headers[0].value, /max-age=0/);
  assert.match(rootCacheRule?.headers[0].value, /max-age=0/);
});
