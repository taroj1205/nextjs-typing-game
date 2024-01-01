"use server";

import { clerkClient } from "@clerk/nextjs/server";

export const getUsername = async (userId: string) => {
	const user = await clerkClient.users.getUser(userId);
	const username = String(user.username);

	return username;
};
