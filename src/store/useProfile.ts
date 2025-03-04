import { observable } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { use$ } from "@legendapp/state/react";
import { synced } from "@legendapp/state/sync";
import { CurrencyCode } from "src/utils/currency";
import { z } from "zod";

export interface ProfileData {
	name: string;
	email: string;
	phone: string;
	dob: string;
	address: string;
	bio: string;
	plan?: string;
	imageUrl?: string;
	currency?: CurrencyCode;
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
			currency:'USD',
			imageUrl:
				'https://images.pexels.com/photos/3307616/pexels-photo-3307616.jpeg?auto=compress&cs=tinysrgb&w=200',
		},
		persist: {
			name: 'profileStore',
			plugin: ObservablePersistMMKV,
		},
	})
);

  export function useUpdateProfile (profile:ProfileData){
		//Validation
		const profileSchema = z.object({
			name: z.string().min(3),
			email: z.string().email(),
			phone: z.string().min(10),
			dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
			address: z.string().min(10),
			bio: z.string().min(10),
			plan: z.string().optional(),
			imageUrl: z.string().optional(),
			currency: z.string().optional(),
		})
		const validatedProfile = profileSchema.parse(profile)
		profileData$.set(validatedProfile)
  }

  export const profile = use$(profileData$)