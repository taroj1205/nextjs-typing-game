import Link from "next/link";

export const Navbar = () => {
  return (
		<nav className="bg-blue-800 w-full text-white p-4">
			<div className="container mx-auto flex justify-between items-center">
				<h1 className="text-3xl font-bold">Typing Tutor</h1>
        <div>
          <Link href="/game" className="text-white px-4 hover:text-blue-300">
            Game
          </Link>
					<Link href="/about" className="text-white px-4 hover:text-blue-300">
						About
					</Link>
					<Link href="/contact" className="text-white px-4 hover:text-blue-300">
						Contact
					</Link>
				</div>
			</div>
		</nav>
	);
}