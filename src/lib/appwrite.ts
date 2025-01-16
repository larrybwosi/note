import { Client, Account, ID, Avatars, Databases } from 'react-native-appwrite';

export const config = {
  platform: 'com.note',
  endpoint: 'https://appwrite.io/v1',
  projectId: '677905330029530f17c9',
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
};

export const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

export async function logout() {
  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const response = await account.get();

    if (!response.$id) return
      const userAvatar = avatar.getInitials(response.name);

      return {
        ...response,
        avatar: userAvatar.toString(),
      };

  } catch (error) {
    console.error(error);
    return null;
  }
}