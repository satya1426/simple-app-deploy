const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../models/User');
const router = express.Router();

router.get('/', (req, res) => res.redirect('/login'));

// --- Login ---
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.redirect('/login?error=1');
    }

    // Increment login count in DB
    user.loginCount += 1;
    await user.save();

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.joinedAt = user.joinedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    req.session.loginCount = user.loginCount;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/login?error=1');
  }
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

  try {
    const exists = await User.findOne({ username: username.trim() });
    if (exists) return res.redirect('/signup?error=taken');

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.trim(), password: hash, loginCount: 1 });

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.joinedAt = user.joinedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    req.session.loginCount = user.loginCount;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/signup?error=invalid');
  }
});

// --- Logout ---
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
