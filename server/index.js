const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const songRoutes = require('./routes/songs');

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/songs', songRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

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
  app.listen(PORT, 'localhost', () => {
    console.log(`GroupGroove API running on port ${PORT}`);
  });
});
