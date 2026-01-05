import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";
import { ENV } from "./env.js";

let chatClient = null;
let streamClient = null;

const getCredentials = () => {
  const apiKey = ENV.STREAM_API_KEY;
  const apiSecret = ENV.STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("STREAM_API_KEY or STREAM_API_SECRET is missing");
  }

  return { apiKey, apiSecret };
};

export const getChatClient = () => {
  if (!chatClient) {
    const { apiKey, apiSecret } = getCredentials();
    chatClient = StreamChat.getInstance(apiKey, apiSecret);
  }
  return chatClient;
};

export const getStreamClient = () => {
  if (!streamClient) {
    const { apiKey, apiSecret } = getCredentials();
    streamClient = new StreamClient(apiKey, apiSecret);
  }
  return streamClient;
};

export const upsertStreamUser = async (userData) => {
  try {
    await getChatClient().upsertUser(userData);
    console.log("Stream user upserted successfully:", userData);
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await getChatClient().deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting the Stream user:", error);
  }
};
