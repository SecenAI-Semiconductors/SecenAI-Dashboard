/**
 * adminMeRoutes.js
 *
 * PUT /api/admin/me  — admin updates own profile (name, email).
 * JWT + admin role required. NOT for creating other admins.
 */

const express        = require("express");
const router         = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const requireRole    = require("../middleware/requireRole");
const { updateAdminMe } = require("../controllers/adminMeController");

router.use(authMiddleware, requireRole("admin"));

router.put("/", updateAdminMe);

module.exports = router;

