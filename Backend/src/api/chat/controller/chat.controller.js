import {
  createConversationService,
  getRecentConversationRows,
  clearConversationsService,
} from "../service/chat.service.js";

export async function createConversationController(req, res, next) {
  try {
    const { question } = req.body;
    const userId = req.user?.id || req.body.userId || null;

    const result = await createConversationService(question, userId);

    res.status(201).json({
      success: true,
      message: "Conversation posted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversationController(req, res, next) {
  try {
    const userId = req.user?.id || req.query.userId || null;
    const result = await getRecentConversationRows(100, userId);

    res.status(200).json({
      success: true,
      message: "Conversation fetched successfully",
      data: {
        conversations: result,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function clearConversationController(req, res, next) {
  try {
    const userId = req.user?.id || req.body?.userId || null;
    await clearConversationsService(userId);

    res.status(200).json({
      success: true,
      message: "Conversation history cleared successfully",
    });
  } catch (error) {
    next(error);
  }
}