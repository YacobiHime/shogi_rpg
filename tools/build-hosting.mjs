import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const BOARD_UI = join(ROOT, 'src', 'board-ui');
const BOARD_FILE_EXTENSIONS = new Set(['.html', '.js', '.mjs', '.data']);
const EXCLUDED_BOARD_FILES = new Set(['server.js']);
const APPROVED_VENDOR_FILES = new Set([
  'shogi.esm.js',
  'yaneuraou.data',
  'yaneuraou.halfkp.noeval.js',
  'yaneuraou.halfkp.noeval.wasm',
  'yaneuraou.halfkp.noeval.worker.js',
  'yaneuraou.js',
  'yaneuraou.wasm',
  'yaneuraou.worker.js',
]);

function copyFile(source, destination) {
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

function copyTree(sourceRelativePath, includeFile, destinationRelativePath = sourceRelativePath) {
  const source = join(ROOT, sourceRelativePath);
  if (!existsSync(source)) {
    throw new Error(`本番配布に必要なディレクトリがありません: ${sourceRelativePath}`);
  }

  function visit(currentSource, currentDestination) {
    for (const entry of readdirSync(currentSource, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const entrySource = join(currentSource, entry.name);
      const entryDestination = join(currentDestination, entry.name);
      if (entry.isDirectory()) {
        visit(entrySource, entryDestination);
      } else if (entry.isFile() && includeFile(entrySource)) {
        copyFile(entrySource, entryDestination);
      }
    }
  }

  visit(source, join(DIST, destinationRelativePath));
}

function copyBoardUi() {
  const destination = join(DIST, 'src', 'board-ui');
  mkdirSync(destination, { recursive: true });

  for (const entry of readdirSync(BOARD_UI, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (EXCLUDED_BOARD_FILES.has(entry.name)) continue;
    if (!BOARD_FILE_EXTENSIONS.has(extname(entry.name))) continue;
    copyFile(join(BOARD_UI, entry.name), join(destination, entry.name));
  }

  const vendorSource = join(BOARD_UI, 'vendor');
  const vendorDestination = join(DIST, 'src', 'board-ui', 'vendor');
  const unexpected = readdirSync(vendorSource, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.'))
    .filter((entry) => !entry.isFile() || !APPROVED_VENDOR_FILES.has(entry.name))
    .map((entry) => entry.name);
  if (unexpected.length > 0) {
    throw new Error(`未承認のvendor資産があります: ${unexpected.join(', ')}`);
  }
  for (const fileName of APPROVED_VENDOR_FILES) {
    const source = join(vendorSource, fileName);
    if (!existsSync(source)) throw new Error(`本番配布に必要なvendor資産がありません: ${fileName}`);
    copyFile(source, join(vendorDestination, fileName));
  }
}

function copyReferencedNnueAssets() {
  const enemies = JSON.parse(readFileSync(join(ROOT, 'data', 'enemies.json'), 'utf8'));
  const referenced = [...new Set(enemies
    .map((enemy) => enemy.nnue_file)
    .filter((fileName) => fileName !== null))];
  for (const fileName of referenced) {
    if (typeof fileName !== 'string' || basename(fileName) !== fileName || extname(fileName) !== '.bin') {
      throw new Error(`敵データのNNUEファイル名が不正です: ${String(fileName)}`);
    }
    const source = join(ROOT, 'assets', 'nnue', fileName);
    if (!existsSync(source)) {
      throw new Error(`敵データが参照するNNUEファイルをassets/nnueへ配置してください: ${fileName}`);
    }
    copyFile(source, join(DIST, 'assets', 'nnue', fileName));
  }
}

function validateNnueAssets() {
  const enemiesPath = join(ROOT, 'data', 'enemies.json');
  const enemies = JSON.parse(readFileSync(enemiesPath, 'utf8'));
  const missing = enemies
    .map((enemy) => enemy.nnue_file)
    .filter((fileName) => fileName !== null)
    .filter((fileName) => !existsSync(join(DIST, 'assets', 'nnue', fileName)));

  if (missing.length > 0) {
    throw new Error(
      `敵データが参照するNNUEファイルをassets/nnueへ配置してください: ${[...new Set(missing)].join(', ')}`,
    );
  }
}

function countFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).reduce((count, entry) => {
    if (entry.isDirectory()) return count + countFiles(join(directory, entry.name));
    return count + 1;
  }, 0);
}

function build() {
  const relativeDist = relative(ROOT, DIST);
  if (relativeDist !== 'dist') {
    throw new Error(`安全でない出力先です: ${DIST}`);
  }

  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  copyTree('data', (file) => extname(file) === '.json');
  copyTree('scenario', () => true, join('data', 'scenario'));
  copyTree('system', () => true, join('data', 'system'));
  copyTree('tyrano', () => true);
  copyTree(join('src', 'engine'), (file) => extname(file) === '.js');
  copyTree(join('src', 'novel'), (file) => ['.html', '.mjs'].includes(extname(file)));
  copyTree(join('src', 'rpg'), (file) => ['.html', '.mjs', '.css'].includes(extname(file)));
  copyTree(join('src', 'save'), (file) => extname(file) === '.mjs');
  copyReferencedNnueAssets();
  copyFile(
    join(ROOT, 'assets', 'books', 'standard_book.db'),
    join(DIST, 'assets', 'books', 'standard_book.db'),
  );
  copyTree(join('assets', 'characters'), (file) => ['.png', '.webp'].includes(extname(file)));
  copyBoardUi();
  copyFile(join(ROOT, 'LICENSE'), join(DIST, 'LICENSE'));
  copyFile(
    join(ROOT, 'docs', 'ASSETS_CREDITS.md'),
    join(DIST, 'ASSETS_CREDITS.md'),
  );
  copyFile(join(ROOT, 'src', 'rpg', 'index.html'), join(DIST, 'index.html'));
  validateNnueAssets();

  console.log(`Firebase Hosting用ファイルをdistへ出力しました（${countFiles(DIST)}ファイル）`);
  console.log('エントリ: /index.html（七つの将棋村）');
}

build();
