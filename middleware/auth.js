// Protect routes — redirect to login if not authenticated
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

module.exports = { requireAuth };
