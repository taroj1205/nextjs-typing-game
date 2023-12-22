import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Typing game",
	description: "Typing game to help you learn English",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider afterSignInUrl={"/game"} afterSignUpUrl={"/game"}>
			<html lang="en" className="light">
				<body
					className={`${inter.className} bg-[#f5f5f5] min-h-[100svh] w-full`}>
					<Providers>
						{children}
						<Analytics />
					</Providers>
				</body>
			</html>
		</ClerkProvider>
	);
}
