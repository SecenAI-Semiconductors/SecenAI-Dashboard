const express = require("express");
const { postChat } = require("../controllers/aiAssistantController");

const router = express.Router();

// POST /api/ai-assistant/chat
router.post("/chat", postChat);

module.exports = router;
