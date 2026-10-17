import db from "../../../../db/db.config.js";
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

let geminiClient = null;
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export const getMessageById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, role, content, token_count, user_id, created_at
     FROM conversations
     WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const getRecentConversationRows = async (limit = 100, userId = null) => {
  const normalizedLimit = Number.parseInt(limit, 10);
  const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 50 : Math.min(normalizedLimit, 200);

  let query = "";
  let params = [];

  if (userId) {
    query = `SELECT id, role, content, token_count, user_id, created_at
             FROM conversations
             WHERE user_id = ?
             ORDER BY id DESC
             LIMIT ${safeLimit}`;
    params = [userId];
  } else {
    query = `SELECT id, role, content, token_count, user_id, created_at
             FROM conversations
             WHERE user_id IS NULL
             ORDER BY id DESC
             LIMIT ${safeLimit}`;
  }

  const [rows] = await db.execute(query, params);
  return rows.reverse();
};

const generateAssistantAnswer = async ({ historyRows, question }) => {
  if (!geminiClient) {
    return {
      text: "Gemini API key is not configured. Please provide a GEMINI_API_KEY in your Backend .env file.",
      totalTokens: 0,
    };
  }

  // Format valid history for Gemini startChat (must alternate or start with user)
  const formattedHistory = [];
  for (const row of historyRows) {
    if (row.content && typeof row.content === "string" && row.content.trim()) {
      formattedHistory.push({
        role: row.role === "assistant" ? "model" : "user",
        parts: [{ text: row.content }],
      });
    }
  }

  try {
    const chat = geminiClient.chats.create({
      model: GEMINI_MODEL,
      config: {
        maxOutputTokens: 2048,
      },
      history: formattedHistory,
    });

    const result = await chat.sendMessage({ message: question });
    const text = result.text || "No response received.";
    const totalTokens = result.usageMetadata?.totalTokenCount || 0;

    return {
      text,
      totalTokens,
    };
  } catch (apiError) {
    console.error("Gemini API call failed:", apiError.message);
    
    // Attempt fallback with gemini-2.5-flash or direct answer
    try {
      const fallbackChat = geminiClient.chats.create({
        model: "gemini-3.5-flash-lite",
        history: formattedHistory.slice(-4),
      });
      const fallbackResult = await fallbackChat.sendMessage({ message: question });
      return {
        text: fallbackResult.text || "No response received.",
        totalTokens: fallbackResult.usageMetadata?.totalTokenCount || 0,
      };
    } catch (fallbackError) {
      console.error("Fallback Gemini model also failed:", fallbackError.message);
      return {
        text: `I'm having trouble connecting to the AI service right now (${apiError.message}). Please try again in a moment.`,
        totalTokens: 0,
      };
    }
  }
};

export async function createConversationService(question, userId = null) {
  try {
    // Validation
    if (!question || !question.trim()) {
      const error = new Error("Question is required");
      error.status = 400;
      throw error;
    }

    // Get recent conversation history for context (last 6 messages)
    const historyRows = await getRecentConversationRows(6, userId);

    // Insert user conversation
    const [userInsertResult] = await db.execute(
      `INSERT INTO conversations (content, role, user_id) VALUES (?, 'user', ?)`,
      [question.trim(), userId || null]
    );

    // Generate assistant answer from Gemini
    const { text, totalTokens } = await generateAssistantAnswer({
      historyRows,
      question: question.trim(),
    });

    // Insert assistant response
    const [assistantInsertResult] = await db.execute(
      `INSERT INTO conversations (role, content, token_count, user_id) VALUES ('assistant', ?, ?, ?)`,
      [text, totalTokens, userId || null]
    );

    const userConversation = await getMessageById(userInsertResult.insertId);
    const assistantConversation = await getMessageById(assistantInsertResult.insertId);

    return {
      userConversation,
      assistantConversation,
    };
  } catch (error) {
    throw error;
  }
}

export async function clearConversationsService(userId = null) {
  if (userId) {
    await db.execute(`DELETE FROM conversations WHERE user_id = ?`, [userId]);
  } else {
    await db.execute(`DELETE FROM conversations WHERE user_id IS NULL`);
  }
  return true;
}
