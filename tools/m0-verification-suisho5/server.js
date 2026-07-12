// COOP/COEPヘッダー対応の簡易HTTPサーバー（M0検証用: Suisho5版）
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8001; // arashigaoka版サーバー(8000)と衝突しないよう別ポート

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(__dirname, decodeURIComponent(urlPath));
  const ext = path.extname(filePath);

  console.log('GET ' + urlPath);

  fs.stat(filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + urlPath);
      return;
    }

    const headers = {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Content-Length': stat.size, // HEADリクエストでファイルサイズを返すために必須
      'Accept-Ranges': 'bytes',    // Rangeリクエスト（部分取得）に対応
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    };

    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      res.end();
      return;
    }

    // Rangeリクエスト対応（大きなnn.binの分割取得に対応するため）
    const range = req.headers['range'];
    if (range) {
      const match = /bytes=(\d+)-(\d+)?/.exec(range);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : stat.size - 1;
        res.writeHead(206, Object.assign({}, headers, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Content-Length': end - start + 1,
        }));
        fs.createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('====================================');
  console.log('M0技術検証サーバー（Suisho5版）が起動しました');
  console.log('http://localhost:' + PORT + '/index.html');
  console.log('COOP/COEPヘッダー: 有効');
  console.log('====================================');
});
