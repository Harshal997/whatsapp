import { child, getDatabase, push, ref, set, update } from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";
import { getUserPushTokens } from "./authActions";
import getUser from "./getUser";

export const createChat = async (
  loggedInUser: any,
  chatData: object,
  participantUserId?: string,
) => {
  const newChatData = {
    ...chatData,
    createdBy: loggedInUser.userId,
    updatedBy: loggedInUser.userId,
    lastMessageTimeStamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  console.log("chatcreatedata", newChatData);
  //   return;
  if (newChatData.participants) {
    newChatData.participants[loggedInUser.userId] = true;
  }
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const chat = await push(
    child(dbRef, `chats/${loggedInUser.userId}`),
    newChatData,
  );

  if (newChatData.participants) {
    Object.keys(newChatData.participants).forEach(async (userId: string) => {
      if (userId !== loggedInUser.userId) {
        await set(child(dbRef, `chats/${userId}/${chat.key!}`), newChatData);
      }
    });
  } else if (participantUserId) {
    await set(
      child(dbRef, `chats/${participantUserId}/${chat.key!}`),
      newChatData,
    );
  }
  if (newChatData.privateKey) {
    await set(
      child(dbRef, `private-chats/${newChatData.privateKey}`),
      chat.key,
    );
  }
  await sendTextMessage(
    loggedInUser,
    newChatData.lastMessage,
    chat.key,
    undefined,
    undefined,
    Object.keys(newChatData.participants),
  );
  return chat.key;
};

export const sendTextMessage = async (
  sender: any,
  message: string,
  chatId: string,
  replyToMessage?: string | undefined,
  replyToName?: string | undefined,
  groupUsers: string[] = [],
) => {
  console.log("groupUsers here are", groupUsers);
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const messageRef = child(dbRef, `messages/${chatId}`);
  const messageBody = {
    sentBy: sender.userId,
    message,
    sentAt: new Date().toISOString(),
  };
  if (replyToMessage && replyToName) {
    messageBody.replyToMessage = replyToMessage;
    messageBody.replyToName = replyToName;
  }
  if (message === "supabase-media-upload") {
    messageBody.media = true;
  }
  const messageCreated = await push(messageRef, messageBody);
  console.log("messageCreated", messageCreated.key);
  const isUserIdPresent = groupUsers.find((userId) => userId === sender.userId);
  if (!isUserIdPresent) {
    groupUsers.push(sender.userId);
  }
  for (const userId of groupUsers) {
    console.log("update chat for user", userId);
    const userChatRef = child(dbRef, `chats/${userId}/${chatId}`);
    await update(userChatRef, {
      updatedAt: new Date().toISOString(),
      lastMessage: message === "supabase-media-upload" ? "photo" : message,
      lastMessageTimeStamp: new Date().toISOString(),
    });
    // await sendPushNotificationForUsers(
    //   userId,
    //   sender.userId,
    //   message === "supabase-media-upload"
    //     ? `${sender.userId} sent a media`
    //     : message,
    //   chatId,
    // );
  }
  return { chatId, messageId: messageCreated.key };
};

export const generatePrivateKey = (userId1: string, userId2: string) => {
  return [userId1, userId2].sort().join("_");
};

export const updateChat = async (
  chatId: string,
  userId: string | null = null,
  updateData: object,
) => {
  const participants = Object.keys((updateData as any).participants || {});
  participants.push(userId!);
  console.log("sorted participants", participants);
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  try {
    for (const participantId of participants) {
      const chatRef = child(dbRef, `chats/${participantId}/${chatId}`);
      await update(chatRef, updateData);
    }
  } catch (e) {
    console.log("error updating chat: ", e);
  }
};

export const removeUserFromChat = async (chatId: string, userId: string) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const chatRef = child(dbRef, `chats/${userId}/${chatId}`);
  try {
    await set(chatRef, null);
  } catch (e) {
    console.log("error removing user from chat: ", e);
  }
};

export const removeUserFromParticipants = async (
  chatId: string,
  participantIds: string[],
  chatData: any,
  userId: string,
  loggedInUserId: string,
) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  if (!chatData.participants || !participantIds) return;
  // if (loggedInUserId !== userId) {
  //   participantIds.push(loggedInUserId);
  // }
  participantIds.forEach(async (participantId) => {
    const participantRef = child(dbRef, `chats/${participantId}/${chatId}`);
    const updatedParticipants = { ...chatData.participants };
    delete updatedParticipants[userId];
    await set(participantRef, {
      ...chatData,
      participants: {
        ...updatedParticipants,
      },
    });
  });
  const createMessageRef = child(dbRef, `messages/${chatId}`);
  const deletedUserData = await getUser(userId);
  const currentUser = await getUser(loggedInUserId);
  await push(createMessageRef, {
    system: true,
    message:
      loggedInUserId === userId
        ? `${currentUser.firstName} left the group`
        : `${currentUser.firstName} removed ${deletedUserData.firstName} from the group`,
    sentAt: new Date().toISOString(),
  });
};

export const addParticipantToChat = async (
  chatId: string,
  participants: object[],
  chatData: any,
  loggedInUserId: string,
) => {
  console.log("nayusiydoiashgfdoi", chatData);
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  if (!chatData.participants || !participants) return;
  const currentUser = await getUser(loggedInUserId);
  participants.push(currentUser);
  const newParticipantsIds = participants.reduce((acc: any, p: any) => {
    acc[p.userId] = true;
    return acc;
  }, {});
  const updatedParticipants = {
    ...chatData.participants,
    ...newParticipantsIds,
  };
  participants.forEach(async (participant) => {
    const participantRef = child(
      dbRef,
      `chats/${participant.userId}/${chatId}`,
    );
    await set(participantRef, {
      ...chatData,
      participants: {
        ...updatedParticipants,
      },
    });
  });
  const createMessageRef = child(dbRef, `messages/${chatId}`);
  await push(createMessageRef, {
    system: true,
    message: `${currentUser.firstName} added ${participants
      .filter((p: any) => p.userId !== loggedInUserId)
      .map((p: any) => p.firstName)
      .join(", ")} to the group`,
    sentAt: new Date().toISOString(),
  });
};

export const sendPushNotificationForUsers = async (
  userId: string,
  title: string,
  body: string,
  chatId: string,
) => {
  const tokens = await getUserPushTokens(userId);
  let tokensArray = [];
  if (tokens) {
    // tokensArray = [...Object]
  }
  for (const tokenData of tokens) {
    const token = tokenData.data;
    await fetch("https://exp.host/--/api/v2/push/send", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: token, title, body, data: { chatId } }),
    });
  }
};
