"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import { useAuth, useClerk } from "@clerk/nextjs";
import { getUserImage } from "@/lib/getUserImage";
import { useEffect, useMemo, useState } from "react";
import React from "react";
import { useLoading } from "@yamada-ui/react";
import { useRouter } from "next/navigation";

export function NavMenu() {
	const { isLoaded, userId } = useAuth();
	const [userImage, setUserImage] = useState<string>("");

	useEffect(() => {
		if (isLoaded && userId) {
			getUserImage(userId).then((image) => {
				console.log(image);
				setUserImage(image);
			});
		}
	}, [isLoaded, userId]);

	const { page } = useLoading();
	const { signOut } = useClerk();
	const router = useRouter();

	const handleSignOut = async () => {
		try {
			page.start();
			signOut(() => {
				router.push("/");
			});
		} finally {
			page.finish();
		}
	};

	return (
		<NavigationMenu className="mx-auto">
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
						Home
					</NavigationMenuLink>
				</NavigationMenuItem>
				{isLoaded && userId ? (
					<>
						<NavigationMenuItem>
							<NavigationMenuTrigger>Profile</NavigationMenuTrigger>
							<NavigationMenuContent>
								<ul className="grid gap-0 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] mx-auto">
									<li
										className="row-span-4 rounded-lg mb-2 lg:mr-2 lg:mb-0"
										style={{
											backgroundImage: `url(${userImage})`,
											backgroundSize: "cover",
											backgroundPosition: "center",
										}}>
										<NavigationMenuLink
											className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
											href="/profile">
											<div className="mb-2 mt-4 text-lg font-medium">
												User Profile
											</div>
											<p className="text-sm leading-tight text-muted-foreground">
												Manage your profile and account settings.
											</p>
										</NavigationMenuLink>
									</li>
									<ListItem href="/settings" title="Settings" />
									<ListItem
										className="cursor-pointer"
										onClick={() => handleSignOut()}
										title="Sign Out"
									/>
								</ul>
							</NavigationMenuContent>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuTrigger>Stats</NavigationMenuTrigger>
							<NavigationMenuContent>
								<div className="flex p-4 md:w-[400px] lg:w-[500px] mx-auto">
									<div className="mr-4">
										<Link href="/profile">
											<img src={userImage} className="rounded-lg" />
										</Link>
									</div>
									<ul className="flex-grow">
										<ListItem href="/leaderboard" title="Leaderboard" />
										<ListItem href="/dashboard" title="Dashboard" />
									</ul>
								</div>
							</NavigationMenuContent>
						</NavigationMenuItem>
					</>
				) : (
					<>
						<NavigationMenuItem>
							<NavigationMenuLink
								href="/sign-in"
								className={navigationMenuTriggerStyle()}>
								Sign In
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuLink
								href="/leaderboard"
								className={navigationMenuTriggerStyle()}>
								Leaderboard
							</NavigationMenuLink>
						</NavigationMenuItem>
					</>
				)}
			</NavigationMenuList>
		</NavigationMenu>
	);
}

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a">
>(({ className, title, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<a
					ref={ref}
					className={cn(
						"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
						className
					)}
					{...props}>
					<div className="text-sm font-medium leading-none">{title}</div>
				</a>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";
