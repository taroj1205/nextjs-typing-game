import { SignUp } from "@clerk/nextjs";

export default function Page() {
		return (
			<div className="flex items-center justify-center h-[calc(100svh-40px)] top-0">
				<SignUp />
			</div>
		);

}
