const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/dashboard', requireAuth, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Dashboard</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: sans-serif; background: #f0f2f5; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
        header { width: 100%; max-width: 800px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        h1 { font-size: 1.5rem; color: #333; }
        .card { background: white; border-radius: 8px; padding: 24px; width: 100%; max-width: 800px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 16px; }
        .card h2 { font-size: 1rem; color: #555; margin-bottom: 8px; }
        .card p { color: #333; font-size: 1.1rem; }
        form button {
          background: #e74c3c; color: white; border: none; padding: 8px 18px;
          border-radius: 6px; cursor: pointer; font-size: 0.9rem;
        }
        form button:hover { background: #c0392b; }
      </style>
    </head>
    <body>
      <header>
        <h1>Dashboard</h1>
        <form method="POST" action="/logout">
          <button type="submit">Logout</button>
        </form>
      </header>
      <div class="card">
        <h2>Welcome back</h2>
        <p>${req.session.username}</p>
      </div>
      <div class="card">
        <h2>Session Info</h2>
        <p>Session ID: ${req.sessionID}</p>
      </div>
      <div class="card">
        <h2>Status</h2>
        <p>Authenticated</p>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;
