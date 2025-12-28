"use server";

import {
  getAdminChatSessions,
  acceptChatSession,
  getChatSessionMessages,
  sendAdminMessage,
  closeChatSession,
} from "@/lib/db/services/admin-chat.service";

export async function getAdminChatSessionsAction(
  status: "pending" | "active" | "closed",
) {
  try {
    return await getAdminChatSessions(status);
  } catch (error) {
    console.error("Failed to get admin chat sessions:", error);
    throw error;
  }
}

export async function acceptChatSessionAction(chatId: string) {
  try {
    return await acceptChatSession(chatId);
  } catch (error) {
    console.error("Failed to accept chat session:", error);
    throw error;
  }
}

export async function getChatSessionMessagesAction(chatId: string) {
  try {
    return await getChatSessionMessages(chatId);
  } catch (error) {
    console.error("Failed to get chat messages:", error);
    throw error;
  }
}

export async function sendAdminMessageAction(chatId: string, message: string) {
  try {
    return await sendAdminMessage(chatId, message);
  } catch (error) {
    console.error("Failed to send admin message:", error);
    throw error;
  }
}

export async function closeChatSessionAction(chatId: string) {
  try {
    return await closeChatSession(chatId);
  } catch (error) {
    console.error("Failed to close chat session:", error);
    throw error;
  }
}
