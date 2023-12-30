import LeaderboardTable from "@/components/LBTable";

export default function Leaderboard() {

	return (
		<div className="max-w-2xl mx-auto">
			<div className="p-4 min-h-[100svh] flex flex-col items-center space-y-2">
				<h2 className="text-4xl font-bold mb-4">Leaderboard</h2>
				<LeaderboardTable />
			</div>
		</div>
	);
}
