const express = require("express");

const router = express.Router();

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 10;
const REQUEST_LIMIT = 25;
const REQUEST_WINDOW_MS = 10 * 60 * 1000;
const requestsByClient = new Map();

function clientCanSendMessage(req) {
  const clientId = req.user?._id?.toString() || req.ip;
  const now = Date.now();
  const recentRequests = (requestsByClient.get(clientId) || []).filter(
    (time) => now - time < REQUEST_WINDOW_MS,
  );

  if (recentRequests.length >= REQUEST_LIMIT) return false;

  recentRequests.push(now);
  requestsByClient.set(clientId, recentRequests);
  return true;
}

function normaliseHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-MAX_HISTORY_MESSAGES)
    .filter(
      (item) =>
        item &&
        ["user", "model"].includes(item.role) &&
        typeof item.text === "string" &&
        item.text.trim(),
    )
    .map((item) => ({
      role: item.role,
      parts: [{ text: item.text.trim().slice(0, MAX_MESSAGE_LENGTH) }],
    }));
}

router.post("/chat", async (req, res) => {
  // GOOGLE_API keeps compatibility with the project's existing .env naming;
  // GEMINI_API is also supported for clarity in new setups.
  const apiKey = process.env.GOOGLE_API || process.env.GEMINI_API;
  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!message) {
    return res.status(400).json({ error: "Please enter a question." });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res
      .status(400)
      .json({ error: "Please keep your message under 2,000 characters." });
  }
  if (!apiKey) {
    return res
      .status(503)
      .json({ error: "The AI assistant has not been configured yet." });
  }
  if (!clientCanSendMessage(req)) {
    return res
      .status(429)
      .json({ error: "Too many messages. Please try again in a few minutes." });
  }

  // This alias tracks Google's currently available fast Flash model and keeps
  // the chat widget responsive for normal student questions.
  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  const contents = [
    ...normaliseHistory(req.body?.history),
    { role: "user", parts: [{ text: message }] },
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You are SkillNest's friendly AI assistant. Help students with learning, projects, ideas, and general questions. Be accurate, clear, and concise. If a question needs a qualified professional (medical, legal, or financial), encourage the user to consult one.",
              },
            ],
          },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
        }),
      },
    );

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!response.ok || !answer) {
      console.error(
        "Gemini API error:",
        data?.error?.message || response.status,
      );
      const apiError = data?.error?.message || "";
      if (/api key not valid|api key.*invalid/i.test(apiError)) {
        return res.status(503).json({
          error:
            "The AI assistant's Google API key is invalid. Add a valid Gemini API key to GOOGLE_API (or GEMINI_API) and restart the server.",
        });
      }
      if (response.status === 403) {
        return res.status(503).json({
          error:
            "Google denied access to the AI assistant. Check that the Gemini API key and its project permissions are active.",
        });
      }
      return res.status(502).json({
        error:
          "I couldn't generate a response right now. Please try again shortly.",
      });
    }

    return res.json({ answer });
  } catch (error) {
    console.error("AI chat request failed:", error.message);
    return res.status(502).json({
      error: "I couldn't reach the AI assistant. Please try again shortly.",
    });
  }
});

module.exports = router;
