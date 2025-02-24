import { observable } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { synced } from "@legendapp/state/sync";

export interface ProfileData {
	name: string;
	email: string;
	phone: string;
	dob: string;
	address: string;
	bio: string;
  plan?: string;
  imageUrl?: string;
}

export const profileData$ = observable<ProfileData>(
	synced({
		initial: {
			name: 'Alex Johnson',
			email: 'alex.johnson@example.com',
			phone: '+1 234 567 8900',
			dob: '2001-01-01',
			address: '123 Main St, City, Country',
			bio: 'Software Developer & Tech Enthusiast',
			plan: 'Premium',
			imageUrl:
				'https://images.pexels.com/photos/3307616/pexels-photo-3307616.jpeg?auto=compress&cs=tinysrgb&w=200',
		},
		persist: {
			name: 'profileStore',
			plugin: ObservablePersistMMKV,
		},
	})
);

  export function updateProfile (profile:ProfileData){
    profileData$.set(profile)
  }

  export const profile = profileData$.get()