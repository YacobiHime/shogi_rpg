import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexUrl = new URL('../index.html', import.meta.url);
const firebaseConfigUrl = new URL('../../../firebase.json', import.meta.url);

test('Firebase Hostingのルート書き換え後もUI資産を正しいパスから読み込む', async () => {
  const [indexHtml, firebaseConfigText] = await Promise.all([
    readFile(indexUrl, 'utf8'),
    readFile(firebaseConfigUrl, 'utf8'),
  ]);
  const firebaseConfig = JSON.parse(firebaseConfigText);
  const rootRewrite = firebaseConfig.hosting.rewrites.find(
    ({ source }) => source === '/'
  );
  const baseHref = indexHtml.match(/<base\s+href="([^"]+)">/)?.[1];

  assert.equal(rootRewrite?.destination, '/src/board-ui/index.html');
  assert.equal(baseHref, '/src/board-ui/');

  const documentBase = new URL(baseHref, 'https://example.test/');
  const mainScript = indexHtml.match(/<script\s+type="module"\s+src="([^"]+)"/)?.[1];
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
