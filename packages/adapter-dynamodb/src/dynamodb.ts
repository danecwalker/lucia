import { Adapter, InitializeAdapter, SessionSchema } from "lucia";
import { DynamoDBClient, GetItemCommand, PutItemCommand, GetItemCommandOutput, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
export const dynamodbAdapter = (
  client: DynamoDBClient,
  tableName: string,
  prefixes?: {
    user?: string;
    session?: string;
    key?: string;
  }
): InitializeAdapter<Adapter> => { 
  if (!prefixes) {
    prefixes = {};
  }
  const userPrefix = prefixes.user || "USER#";
  const sessionPrefix = prefixes.session || "SESS#";
  const keyPrefix = prefixes.key || "KEY#";

  return (LuciaError) => {
    return {
      // Session
      getSession: async (sessionId) => {
        const getCommand = new GetItemCommand({
          TableName: tableName,
          Key: {
            PK: { S: sessionPrefix + sessionId },
            SK: { S: sessionPrefix + sessionId },
          },
        })

        const result = await client.send(getCommand);
        return transformSession(result);
      },
      getSessionsByUserId: async (userId) => {
        return [];
      },
      setSession: async (session) => {
        return;
      },
      deleteSession: async (sessionId) => {
        return;
      },
      deleteSessionsByUserId: async (userId) => {
        return;
      },
      updateSession(sessionId, partialSession) {
        return;
      },

      // User
      getUser: async (userId) => {
        return null;
      },
      setUser: async (user) => {
        return;
      },
      deleteUser: async (userId) => {
        return;
      },
      updateUser(userId, partialUser) {
        return;
      },

      // Key
      getKey: async (key) => {
        return null;
      },
      getKeysByUserId: async (userId) => {
        return [];
      },
      setKey: async (key) => {
        return;
      },
      deleteKey: async (key) => {
        return;
      },
      deleteKeysByUserId: async (userId) => {
        return;
      },
      updateKey(key, partialKey) {
        return;
      },

      getSessionAndUser: async (sessionId) => {
        return null;
      },
    };
  }
}

const transformSession = (item: GetItemCommandOutput): SessionSchema | null => {
  // Check if item.Item is undefined
  if (!item.Item) {
    return null;
  }

  return {
    id: item.Item!.PK.S!.replace("SESS#", ""),
    active_expires: item.Item!.active_expires.N!,
    idle_expires: item.Item!.idle_expires.N!,
    user_id: item.Item!.SK.S!.replace("USER#", ""),
  }
}
