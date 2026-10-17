import db from "../../../../db/db.config.js";
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

export const getRecentConversationRows = async (limit = 5) =>{
    const normalizedLimit = Number.parseInt(limit, 10);
    const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0
    ? 20 : normalizedLimit;
    const [rows] = await db.execute(
        `SELECT id, role, content, created_at
        FROM conversations 
        ORDER BY id DESC 
        LIMIT ${safeLimit}`,
    );
    return rows.reverse();
};

const generateAssistantAnswer = async ({ historyRows, question }) => {
    // Format history for Gemini startChat
    const formattedHistory = historyRows.map(row => ({
        role: row.role === "assistant" ? "model" : "user",
        parts: [{ text: row.content }],
    }));

    // sample history format

    const chat = geminiClient.chats.create({
        model: GEMINI_MODEL,
        config: {
            maxOutputTokens: 1024,
        },
        history: formattedHistory,
    });

    const result = await chat.sendMessage({ message: question });
    return {
    text: result.text,
    totalTokens: result.usageMetadata.totalTokenCount,
    };
};



export async function createConversationService(question) {
    try {
        // Validation
        if (!question.trim()) {
            const error = new Error("Question is required");
            error.status = 400;
            throw error;
        }

        // get recent conversation
        const historyRows = await getRecentConversationRows(5);

        // insert new conversation 
        const [result] = await db.execute(
            `INSER INTO conversations (content, role) VALUES (?, "user")`, 
            [question],
        );

        const { text, totalTokens } = await generateAssistantAnswer({
            historyRows,
            question,
        });

        const createAssistantMessageResult = await db.execute(
            `INSER INTO conversations (role, content, tken_count) VALUES (?, ?, ?)`, 
            ["assistant", text, totalTokens],
        );
        const userConversation = await getMessageById(result.insertId);
        const assistantConversation = await getMessageById(
            createAssistantMessageResult.insertId,
        );

        return {
            userConversation,
            assistantConversation,
        };
    } catch (error){
        throw error;
    }
}
