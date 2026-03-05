import { child, getDatabase, push, ref, set, update } from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";

export const createChat = async (
  loggedInUserId: string,
  chatData: object,
  participantUserId: string,
) => {
  const newChatData = {
    ...chatData,
    createdBy: loggedInUserId,
    updatedBy: loggedInUserId,
    lastMessageTimeStamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  console.log("chatcreatedata", newChatData);
  //   return;
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const chat = await push(child(dbRef, `chats/${loggedInUserId}`), newChatData);
  await set(
    child(dbRef, `chats/${participantUserId}/${chat.key!}`),
    newChatData,
  );
  await set(child(dbRef, `private-chats/${newChatData.privateKey}`), chat.key);
  await sendTextMessage(loggedInUserId, newChatData.lastMessage, chat.key);
};

export const sendTextMessage = async (
  senderId: string,
  message: string,
  chatId: string,
  replyToMessage?: string,
  replyToName?: string,
) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const messageRef = child(dbRef, `messages/${chatId}`);
  const messageBody = {
    sentBy: senderId,
    message,
    sentAt: new Date().toISOString(),
  };
  if (replyToMessage && replyToName) {
    messageBody.replyToMessage = replyToMessage;
    messageBody.replyToName = replyToName;
  }
  await push(messageRef, messageBody);
  const chatRef = child(dbRef, `chats/${senderId}/${chatId}`);
  await update(chatRef, {
    updatedAt: new Date().toISOString(),
    lastMessage: message,
    lastMessageTimestamp: new Date().toISOString(),
  });
};

export const generatePrivateKey = (userId1: string, userId2: string) => {
  return [userId1, userId2].sort().join("_");
};
