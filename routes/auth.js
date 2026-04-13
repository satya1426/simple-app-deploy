const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const router = express.Router();

// In-memory user store — swap with MongoDB if needed
const users = [];
let nextId = 1;

router.get('/', (req, res) => res.redirect('/login'));

// --- Login ---
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.redirect('/login?error=1');
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect('/dashboard');
});

// --- Signup ---
router.get('/signup', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, '../views/signup.html'));
});

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || username.trim().length < 3 || password.length < 6) {
    return res.redirect('/signup?error=invalid');
  }

  const exists = users.find(u => u.username === username.trim());
  if (exists) {
    return res.redirect('/signup?error=taken');
  }

  const hash = await bcrypt.hash(password, 10);
  const user = { id: nextId++, username: username.trim(), password: hash, joinedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) };
  users.push(user);

  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.joinedAt = user.joinedAt;
  req.session.joinedAt = user.joinedAt;
  res.redirect('/dashboard');
});

// --- Logout ---
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
