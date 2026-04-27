const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.id, g.name, g.invite_code, g.created_at,
        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count
       FROM groups g
       JOIN group_members gm ON gm.group_id = g.id
       WHERE gm.user_id = $1
       ORDER BY g.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Group name required' });

  try {
    let code = generateInviteCode();
    let tries = 0;
    while (tries < 5) {
      const existing = await pool.query('SELECT id FROM groups WHERE invite_code = $1', [code]);
      if (existing.rows.length === 0) break;
      code = generateInviteCode();
      tries++;
    }

    const groupResult = await pool.query(
      'INSERT INTO groups (name, invite_code, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, code, req.user.id]
    );
    const group = groupResult.rows[0];

    await pool.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
      [group.id, req.user.id]
    );

    res.json({ ...group, member_count: 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/join', authenticateToken, async (req, res) => {
  const { invite_code } = req.body;
  if (!invite_code) return res.status(400).json({ error: 'Invite code required' });

  try {
    const groupResult = await pool.query('SELECT * FROM groups WHERE invite_code = $1', [invite_code.toUpperCase()]);
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }
    const group = groupResult.rows[0];

    const memberCount = await pool.query(
      'SELECT COUNT(*) FROM group_members WHERE group_id = $1',
      [group.id]
    );
    if (parseInt(memberCount.rows[0].count) >= 8) {
      return res.status(400).json({ error: 'Group is full (max 8 members)' });
    }

    const alreadyMember = await pool.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [group.id, req.user.id]
    );
    if (alreadyMember.rows.length > 0) {
      return res.status(400).json({ error: 'You are already in this group' });
    }

    await pool.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
      [group.id, req.user.id]
    );

    const count = await pool.query('SELECT COUNT(*) FROM group_members WHERE group_id = $1', [group.id]);
    res.json({ ...group, member_count: parseInt(count.rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const memberCheck = await pool.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const groupResult = await pool.query('SELECT * FROM groups WHERE id = $1', [req.params.id]);
    if (groupResult.rows.length === 0) return res.status(404).json({ error: 'Group not found' });

    const membersResult = await pool.query(
      `SELECT u.id, u.username FROM users u
       JOIN group_members gm ON gm.user_id = u.id
       WHERE gm.group_id = $1`,
      [req.params.id]
    );

    res.json({ ...groupResult.rows[0], members: membersResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
