import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const boardIndexUrl = new URL('../index.html', import.meta.url);
const novelIndexUrl = new URL('../../novel/index.html', import.meta.url);
const rpgIndexUrl = new URL('../../rpg/index.html', import.meta.url);
const firebaseConfigUrl = new URL('../../../firebase.json', import.meta.url);
const hostingBuildUrl = new URL('../../../tools/build-hosting.mjs', import.meta.url);

test('Firebase Hostingのルートを七村RPGにし、対局UI資産も正しいパスから読む', async () => {
  const [
    boardIndexHtml,
    novelIndexHtml,
    rpgIndexHtml,
    firebaseConfigText,
    hostingBuildText,
  ] = await Promise.all([
    readFile(boardIndexUrl, 'utf8'),
    readFile(novelIndexUrl, 'utf8'),
    readFile(rpgIndexUrl, 'utf8'),
    readFile(firebaseConfigUrl, 'utf8'),
    readFile(hostingBuildUrl, 'utf8'),
  ]);
  const firebaseConfig = JSON.parse(firebaseConfigText);
  const rootRewrite = firebaseConfig.hosting.rewrites.find(
    ({ source }) => source === '/'
  );
  const baseHref = boardIndexHtml.match(/<base\s+href="([^"]+)">/)?.[1];

  assert.equal(rootRewrite?.destination, '/index.html');
  assert.match(novelIndexHtml, /src="\/src\/novel\/tyrano-match-tag\.mjs"/);
  assert.match(rpgIndexHtml, /src="\/src\/rpg\/main\.mjs"/);
  assert.equal(baseHref, '/src/board-ui/');

  const documentBase = new URL(baseHref, 'https://example.test/');
  const mainScript = [...boardIndexHtml.matchAll(
    /<script\s+type="module"\s+src="([^"]+)"/g
  )].map((match) => match[1]).find((src) => src.startsWith('./main.js'));
  assert.equal(new URL(mainScript, documentBase).pathname, '/src/board-ui/main.js');
  assert.ok(new URL(mainScript, documentBase).search);
  assert.match(boardIndexHtml, /vendor\/shogi-match-ui\.js/);
  assert.match(boardIndexHtml, /vendor\/shogi-match-ui\.css/);
  assert.equal(
    new URL('../../data/enemies.json', documentBase).pathname,
    '/data/enemies.json'
  );

  const codeCacheRule = firebaseConfig.hosting.headers.find(
    ({ regex }) => regex === '.*\\.(html|js|mjs|json)$'
  );
  const binaryCacheRule = firebaseConfig.hosting.headers.find(
    ({ regex }) => regex === '.*\\.(wasm|data|bin|db)$'
  );
  const rootCacheRule = firebaseConfig.hosting.headers.find(
    ({ source }) => source === '/'
  );
  assert.match(codeCacheRule?.headers[0].value, /max-age=0/);
  assert.match(binaryCacheRule?.headers[0].value, /max-age=3600/);
  assert.match(rootCacheRule?.headers[0].value, /max-age=0/);
  assert.match(hostingBuildText, /join\(ROOT, 'LICENSE'\)/);
  assert.match(hostingBuildText, /join\(ROOT, 'docs', 'ASSETS_CREDITS\.md'\)/);
  assert.match(hostingBuildText, /join\(ROOT, 'src', 'rpg', 'index\.html'\)/);
  assert.match(hostingBuildText, /join\('assets', 'characters'\)/);
  assert.match(hostingBuildText, /join\('assets', 'shogihome'\)/);
  assert.match(hostingBuildText, /join\(ROOT, 'assets', 'books', 'standard_book\.db'\)/);
  assert.match(hostingBuildText, /APPROVED_VENDOR_FILES/);
  assert.match(hostingBuildText, /shogi-match-ui\.js/);
  assert.match(hostingBuildText, /copyReferencedNnueAssets/);
});
