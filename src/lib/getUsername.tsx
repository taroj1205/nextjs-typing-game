"use server";

import { clerkClient } from "@clerk/nextjs/server";

export const getUsername = async (userId: string) => {
	const username = String((await clerkClient.users.getUser(userId)).username);

	return username;
};
