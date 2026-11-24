/**
 * ChatHistory.js — Mongoose model for per-farmer AI Assistant chat history.
 *
 * Stores the last N messages (capped at MAX_MESSAGES) so the conversation
 * survives page reloads, language switches, and session restarts.
 * One document per farmer (upsert pattern).
 */

const mongoose = require("mongoose");

const MAX_MESSAGES = 50; // 25 exchanges (user + assistant)

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["user", "assistant"],
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatHistorySchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
      validate: {
        validator: (v) => v.length <= MAX_MESSAGES,
        message: `Chat history cannot exceed ${MAX_MESSAGES} messages`,
      },
    },
  },
  {
    timestamps: true,
  }
);

/** Static: cap the messages array to MAX_MESSAGES (trim oldest). */
chatHistorySchema.statics.MAX_MESSAGES = MAX_MESSAGES;

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
