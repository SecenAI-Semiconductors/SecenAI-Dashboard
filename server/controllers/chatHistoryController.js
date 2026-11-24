/**
 * chatHistoryController.js
 *
 * GET  /api/farmer/chat-history  — load the logged-in farmer's AI chat history
 * PUT  /api/farmer/chat-history  — save / replace (capped at 50 messages)
 * DELETE /api/farmer/chat-history — clear all chat history
 */

const ChatHistory = require("../models/ChatHistory");

const MAX_MESSAGES = ChatHistory.MAX_MESSAGES;

/** GET — return the farmer's saved messages (empty array if none). */
exports.getChatHistory = async (req, res) => {
  try {
    const doc = await ChatHistory.findOne({ farmerId: req.user._id }).lean();
    res.json({ messages: doc?.messages || [] });
  } catch (err) {
    console.error("[ChatHistory] GET error:", err.message);
    res.status(500).json({ message: "Failed to load chat history" });
  }
};

/**
 * PUT — save messages (replaces the entire array).
 * Trims to the last MAX_MESSAGES if the client sends more.
 */
exports.saveChatHistory = async (req, res) => {
  try {
    let { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ message: "messages must be an array" });
    }

    // Validate each message shape
    messages = messages
      .filter(
        (m) =>
          m &&
          typeof m.content === "string" &&
          (m.role === "user" || m.role === "assistant")
      )
      .map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: typeof m.timestamp === "number" ? m.timestamp : Date.now(),
      }));

    // Cap at MAX_MESSAGES (keep the newest)
    if (messages.length > MAX_MESSAGES) {
      messages = messages.slice(-MAX_MESSAGES);
    }

    await ChatHistory.findOneAndUpdate(
      { farmerId: req.user._id },
      { $set: { messages } },
      { upsert: true, new: true }
    );

    res.json({ saved: messages.length });
  } catch (err) {
    console.error("[ChatHistory] PUT error:", err.message);
    res.status(500).json({ message: "Failed to save chat history" });
  }
};

/** DELETE — clear all chat history for the farmer. */
exports.clearChatHistory = async (req, res) => {
  try {
    await ChatHistory.findOneAndUpdate(
      { farmerId: req.user._id },
      { $set: { messages: [] } },
      { upsert: true }
    );
    res.json({ cleared: true });
  } catch (err) {
    console.error("[ChatHistory] DELETE error:", err.message);
    res.status(500).json({ message: "Failed to clear chat history" });
  }
};
