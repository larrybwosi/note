import { Client, Account, Avatars, Databases } from 'react-native-appwrite';

export const config = {
	platform: 'com.note',
	endpoint: 'https://cloud.appwrite.io/v1',
	userPrefrencesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_PREFERENCE_COLLECTION_ID!,
	projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
	databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
};

export const client = new Client()
	.setEndpoint('https://cloud.appwrite.io/v1')
	.setProject('677905330029530f17c9')
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