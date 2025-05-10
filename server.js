const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Tell Next.js to use Babel instead of SWC
process.env.NEXT_DISABLE_SWC = '1';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log(`> Ready on http://localhost:${port}`);
  
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}); 