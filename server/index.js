const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const VITE_PORT = 5173;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const songRoutes = require('./routes/songs');

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/songs', songRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

if (isProduction) {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${VITE_PORT}`,
    changeOrigin: true,
    ws: true,
    on: {
      error: (err, req, res) => {
        if (res && res.writeHead) {
          res.writeHead(502);
          res.end('Dev server starting up...');
        }
      }
    }
  }));
}

async function startVite() {
  const vite = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '../client'),
    stdio: 'inherit',
    env: { ...process.env, VITE_PORT: String(VITE_PORT) }
  });
  vite.on('error', err => console.error('Vite error:', err));
  vite.on('exit', code => console.log('Vite exited with code:', code));
  process.on('exit', () => vite.kill());
  process.on('SIGTERM', () => { vite.kill(); process.exit(0); });
  process.on('SIGINT', () => { vite.kill(); process.exit(0); });
}

async function initDb() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GroupGroove running on port ${PORT}`);
    if (!isProduction) {
      startVite();
    }
  });
});
