"use server";

import {
  getActiveChatSession,
  getUnreadMessageCount,
  markMessagesAsRead,
  createChatRequest,
  getChatMessages,
  sendChatMessage,
  closeChatSession,
  getChatFAQs,
} from "@/lib/db/services/chat.service";

export async function getActiveChatSessionAction() {
  try {
    return await getActiveChatSession();
  } catch (error) {
    console.error("Failed to get active chat session:", error);
    return null;
  }
}

export async function getUnreadMessageCountAction() {
  try {
    return await getUnreadMessageCount();
  } catch (error) {
    console.error("Failed to get unread message count:", error);
    return 0;
  }
}

export async function markMessagesAsReadAction(chatSessionId: string) {
  try {
    await markMessagesAsRead(chatSessionId);
    return { success: true };
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    return { success: false, error: String(error) };
  }
}

export async function createChatRequestAction(concern: string) {
  try {
    return await createChatRequest(concern);
  } catch (error) {
    console.error("Failed to create chat request:", error);
    throw error;
  }
}

export async function getChatMessagesAction(chatSessionId: string) {
  try {
    return await getChatMessages(chatSessionId);
  } catch (error) {
    console.error("Failed to get chat messages:", error);
    throw error;
  }
}

export async function sendChatMessageAction(
  chatSessionId: string,
  message: string,
) {
  try {
    return await sendChatMessage(chatSessionId, message);
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
}

export async function closeChatSessionAction(chatSessionId: string) {
  try {
    await closeChatSession(chatSessionId);
    return { success: true };
  } catch (error) {
    console.error("Failed to close chat session:", error);
    throw error;
  }
}

export async function getChatFAQsAction() {
  try {
    return await getChatFAQs();
  } catch (error) {
    console.error("Failed to get chat FAQs:", error);
    return [];
  }
}
