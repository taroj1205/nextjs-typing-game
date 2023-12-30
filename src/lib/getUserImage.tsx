"use server";

import { clerkClient } from "@clerk/nextjs/server";

export const getUserImage = async (userId: string) => {
	const userImage = String((await clerkClient.users.getUser(userId)).imageUrl);

	console.log(`Got image for user: ${userId}`, userImage);

	return userImage;
};
