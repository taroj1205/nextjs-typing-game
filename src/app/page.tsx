import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import React from "react";

const HomePage = () => {
	return (
    <main className="min-h-[100svh] flex flex-col items-center justify-between">
      <Navbar />
			<div className="hero h-full flex-grow w-full bg-blue-200 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-5xl text-blue-800 font-bold mb-6">
						Learn English While Typing!
					</h2>
					<p className="text-xl mb-8">
						Join our interactive typing game and enhance your English skills in
						a fun and engaging way.
					</p>
					<Link
						href="/game"
						className="bg-blue-800 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors">
						Start Game
					</Link>
				</div>
			</div>

			<footer className="bg-blue-800 w-full text-white text-center p-4">
				<p>
					&copy; {new Date().getFullYear()} Typing Tutor. All rights reserved.
				</p>
			</footer>
		</main>
	);
};

export default HomePage;
