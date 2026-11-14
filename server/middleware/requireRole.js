/**
 * requireRole.js
 *
 * Role-based access guard.  Must be used AFTER authMiddleware (which
 * populates req.user).
 *
 * Usage:
 *   router.get("/admin/...", authMiddleware, requireRole("admin"), handler);
 *   router.get("/farmer/..", authMiddleware, requireRole("farmer"), handler);
 *   router.get("/both/...",  authMiddleware, requireRole("admin", "farmer"), handler);
 */

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      // authMiddleware should always run first; this is a safety net
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
}

module.exports = requireRole;

