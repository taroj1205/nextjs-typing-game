import Link from "next/link";

export default function Settings() {
	return (
		<div className="flex flex-col space-y-4 items-center justify-center min-h-[100svh] text-center">
			<h2 className="text-5xl">Settings coming soon</h2>
			<Link
				href="/"
				className="text-3xl text-blue-400 underline hover:text-blue-600 transition-colors duration-200">
				Back to home
			</Link>
		</div>
	);
}
