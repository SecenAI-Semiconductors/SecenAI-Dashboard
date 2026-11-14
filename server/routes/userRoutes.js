/**
 * userRoutes.js
 *
 * CRUD routes for farmer accounts — admin access only.
 *
 * All routes in this file require:
 *   1. authMiddleware — valid JWT, active account
 *   2. requireRole("admin") — only admins may manage farmer records
 *
 * Note: farmer self-registration goes through POST /api/auth/register.
 *       Admin-initiated farmer creation goes through POST /api/admin/farmers
 *       (which also returns a temporary password).
 *       These legacy CRUD endpoints remain for compatibility with the
 *       existing Farmer Management UI while Phase 2 migration is pending.
 */

const express = require("express");
const router  = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireRole    = require("../middleware/requireRole");

const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// Apply auth guards to every route in this file
router.use(authMiddleware, requireRole("admin"));

router.post("/",     createUser);
router.get("/",      getUsers);
router.get("/:id",   getUser);
router.put("/:id",   updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
