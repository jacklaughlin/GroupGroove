const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/group/:groupId', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const memberCheck = await pool.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, req.user.id]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const result = await pool.query(
      `SELECT s.*, u.username,
        COALESCE(AVG(r.score), 0) as avg_rating,
        COUNT(r.id) as rating_count,
        (SELECT r2.score FROM ratings r2 WHERE r2.song_id = s.id AND r2.user_id = $3) as my_rating
       FROM songs s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN ratings r ON r.song_id = s.id
       WHERE s.group_id = $1 AND s.submitted_date = $2
       GROUP BY s.id, u.username
       ORDER BY s.created_at ASC`,
      [groupId, targetDate, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/group/:groupId', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { title, artist, spotify_url, youtube_url, note } = req.body;

  if (!title || !artist) {
    return res.status(400).json({ error: 'Song title and artist are required' });
  }

  try {
    const memberCheck = await pool.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, req.user.id]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const today = new Date().toISOString().split('T')[0];
    const existing = await pool.query(
      'SELECT id FROM songs WHERE group_id = $1 AND user_id = $2 AND submitted_date = $3',
      [groupId, req.user.id, today]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already submitted a song today' });
    }

    const result = await pool.query(
      `INSERT INTO songs (group_id, user_id, title, artist, spotify_url, youtube_url, note, submitted_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [groupId, req.user.id, title, artist, spotify_url || null, youtube_url || null, note || null, today]
    );

    const song = result.rows[0];
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [req.user.id]);
    res.json({ ...song, username: userResult.rows[0].username, avg_rating: 0, rating_count: 0, my_rating: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:songId/rate', authenticateToken, async (req, res) => {
  const { songId } = req.params;
  const { score } = req.body;

  if (!score || score < 1 || score > 10) {
    return res.status(400).json({ error: 'Score must be between 1 and 10' });
  }

  try {
    const songResult = await pool.query('SELECT * FROM songs WHERE id = $1', [songId]);
    if (songResult.rows.length === 0) return res.status(404).json({ error: 'Song not found' });
    const song = songResult.rows[0];

    if (song.user_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot rate your own song' });
    }

    const memberCheck = await pool.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [song.group_id, req.user.id]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    await pool.query(
      `INSERT INTO ratings (song_id, user_id, score)
       VALUES ($1, $2, $3)
       ON CONFLICT (song_id, user_id) DO UPDATE SET score = $3`,
      [songId, req.user.id, score]
    );

    const avgResult = await pool.query(
      'SELECT AVG(score) as avg, COUNT(*) as count FROM ratings WHERE song_id = $1',
      [songId]
    );

    res.json({
      avg_rating: parseFloat(avgResult.rows[0].avg).toFixed(1),
      rating_count: parseInt(avgResult.rows[0].count),
      my_rating: score
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
