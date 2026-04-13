const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/dashboard', requireAuth, (req, res) => {
  const joinedAt = req.session.joinedAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const username = req.session.username;
  const initial = username.charAt(0).toUpperCase();

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dashboard — AuthApp</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #f4f6fb; color: #333; }

    /* Sidebar */
    .sidebar {
      position: fixed; top: 0; left: 0; height: 100vh; width: 220px;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      display: flex; flex-direction: column; padding: 28px 0; z-index: 100;
    }
    .sidebar-logo { color: white; font-size: 1.2rem; font-weight: 700; padding: 0 24px 28px; border-bottom: 1px solid rgba(255,255,255,0.15); }
    .sidebar-logo span { font-size: 1.4rem; margin-right: 8px; }
    .nav { flex: 1; padding-top: 20px; }
    .nav a {
      display: flex; align-items: center; gap: 10px; padding: 12px 24px;
      color: rgba(255,255,255,0.75); text-decoration: none; font-size: 0.92rem;
      transition: background 0.2s, color 0.2s;
    }
    .nav a:hover, .nav a.active { background: rgba(255,255,255,0.15); color: white; }
    .nav a .icon { font-size: 1.1rem; width: 20px; text-align: center; }
    .sidebar-footer { padding: 20px 24px; border-top: 1px solid rgba(255,255,255,0.15); }
    .sidebar-footer form button {
      width: 100%; padding: 9px; background: rgba(255,255,255,0.15); color: white;
      border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer;
      font-size: 0.88rem; transition: background 0.2s;
    }
    .sidebar-footer form button:hover { background: rgba(255,255,255,0.25); }

    /* Main */
    .main { margin-left: 220px; padding: 32px; min-height: 100vh; }

    /* Topbar */
    .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .topbar h1 { font-size: 1.5rem; color: #222; }
    .topbar .greeting { font-size: 0.9rem; color: #888; margin-top: 2px; }
    .avatar {
      width: 42px; height: 42px; border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.1rem;
    }

    /* Stats */
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 28px; }
    .stat-card {
      background: white; border-radius: 12px; padding: 22px 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 16px;
    }
    .stat-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
    }
    .stat-icon.blue { background: #eef2ff; }
    .stat-icon.green { background: #e8faf0; }
    .stat-icon.purple { background: #f5eeff; }
    .stat-icon.orange { background: #fff4e6; }
    .stat-info p { font-size: 0.78rem; color: #888; margin-bottom: 2px; }
    .stat-info h3 { font-size: 1.4rem; font-weight: 700; color: #222; }

    /* Grid */
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media(max-width: 900px) { .grid { grid-template-columns: 1fr; } }

    .card {
      background: white; border-radius: 12px; padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .card-title { font-size: 0.95rem; font-weight: 700; color: #333; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }

    /* Profile */
    .profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .profile-avatar {
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; font-weight: 700;
    }
    .profile-name { font-size: 1.1rem; font-weight: 700; color: #222; }
    .profile-role { font-size: 0.82rem; color: #888; margin-top: 2px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge.green { background: #e8faf0; color: #27ae60; }
    .profile-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 0.88rem; }
    .profile-row:last-child { border-bottom: none; }
    .profile-row span:first-child { color: #888; }
    .profile-row span:last-child { color: #333; font-weight: 500; }

    /* Activity */
    .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
    .activity-item:last-child { border-bottom: none; }
    .activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
    .activity-dot.green { background: #2ecc71; }
    .activity-dot.blue { background: #667eea; }
    .activity-dot.orange { background: #e67e22; }
    .activity-text { font-size: 0.87rem; color: #444; }
    .activity-time { font-size: 0.75rem; color: #aaa; margin-top: 2px; }

    /* Session */
    .session-info { font-size: 0.85rem; }
    .session-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #f0f0f0; }
    .session-row:last-child { border-bottom: none; }
    .session-row span:first-child { color: #888; }
    .session-row span:last-child { color: #333; font-weight: 500; word-break: break-all; max-width: 60%; text-align: right; }

    @media(max-width: 640px) {
      .sidebar { display: none; }
      .main { margin-left: 0; padding: 20px; }
    }
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-logo"><span>🔐</span>AuthApp</div>
    <nav class="nav">
      <a href="/dashboard" class="active"><span class="icon">🏠</span> Dashboard</a>
      <a href="#"><span class="icon">👤</span> Profile</a>
      <a href="#"><span class="icon">⚙️</span> Settings</a>
      <a href="#"><span class="icon">🔔</span> Notifications</a>
    </nav>
    <div class="sidebar-footer">
      <form method="POST" action="/logout">
        <button type="submit">🚪 Sign Out</button>
      </form>
    </div>
  </aside>

  <main class="main">
    <div class="topbar">
      <div>
        <h1 id="greeting-text">Hello, ${username}</h1>
        <div class="greeting">Here's what's happening with your account today.</div>
      </div>
      <div class="avatar">${initial}</div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-icon blue">📊</div>
        <div class="stat-info"><p>Total Logins</p><h3 id="login-count">1</h3></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✅</div>
        <div class="stat-info"><p>Status</p><h3>Active</h3></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">🔒</div>
        <div class="stat-info"><p>Security</p><h3>Secured</h3></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">📅</div>
        <div class="stat-info"><p>Member Since</p><h3 style="font-size:0.95rem">${joinedAt}</h3></div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">👤 Profile</div>
        <div class="profile-header">
          <div class="profile-avatar">${initial}</div>
          <div>
            <div class="profile-name">${username}</div>
            <div class="profile-role">Member</div>
          </div>
        </div>
        <div class="profile-row"><span>Username</span><span>${username}</span></div>
        <div class="profile-row"><span>Role</span><span><span class="badge green">Member</span></span></div>
        <div class="profile-row"><span>Account Status</span><span><span class="badge green">Active</span></span></div>
        <div class="profile-row"><span>Joined</span><span>${joinedAt}</span></div>
      </div>

      <div class="card">
        <div class="card-title">🕐 Recent Activity</div>
        <div class="activity-item">
          <div class="activity-dot green"></div>
          <div>
            <div class="activity-text">Logged in successfully</div>
            <div class="activity-time" id="now-time"></div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot blue"></div>
          <div>
            <div class="activity-text">Account created</div>
            <div class="activity-time">${joinedAt}</div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot orange"></div>
          <div>
            <div class="activity-text">Profile viewed</div>
            <div class="activity-time" id="now-time2"></div>
          </div>
        </div>
      </div>

      <div class="card" style="grid-column: 1 / -1;">
        <div class="card-title">🔑 Session Details</div>
        <div class="session-info">
          <div class="session-row"><span>Session ID</span><span>${req.sessionID}</span></div>
          <div class="session-row"><span>IP Address</span><span>${req.ip || 'N/A'}</span></div>
          <div class="session-row"><span>Browser</span><span id="browser-info">Detecting...</span></div>
          <div class="session-row"><span>Session Expires</span><span>1 hour from login</span></div>
        </div>
      </div>
    </div>
  </main>

  <script>
    // Greeting based on time
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    document.getElementById('greeting-text').textContent = greet + ', ${username}';

    // Current time
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('now-time').textContent = 'Today at ' + now;
    document.getElementById('now-time2').textContent = 'Today at ' + now;

    // Login count from DB via session
    document.getElementById('login-count').textContent = ${req.session.loginCount || 1};

    // Browser info
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    document.getElementById('browser-info').textContent = browser;
  </script>
</body>
</html>`);
});

module.exports = router;
