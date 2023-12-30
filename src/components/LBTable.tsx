"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getUsername } from "@/lib/getUsername";
import { Column, Table } from "@yamada-ui/table";

interface LeaderboardData {
	user_id: string;
	username: string;
	fastest: number;
	totalWords: number;
}

export default function LeaderboardTable() {
	const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);

	const columns = useMemo<Column<LeaderboardData>[]>(
		() => [
			{
				header: "Username",
				accessorKey: "username",
			},
			{
				header: "Fastest Time (s)",
				accessorKey: "fastest",
			},
			{
				header: "Total Words",
				accessorKey: "totalWords",
			},
		],
		[]
	);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data, error } = await supabase.from("stats").select("*");

				if (error) {
					console.error("Error fetching leaderboard data:", error);
				} else {
					const newUsernames: Record<string, string> = {};
					const fastestTimePerUser = new Map<string, number>();
					const totalWordsPerUser = new Map<string, number>();

					for (let item of data) {
						if (!newUsernames[item.user_id]) {
							newUsernames[item.user_id] = await getUsername(item.user_id);
						}

						if (
							!fastestTimePerUser.has(item.user_id) ||
							(fastestTimePerUser.has(item.user_id) &&
								item.time_taken < fastestTimePerUser.get(item.user_id)!)
						) {
							fastestTimePerUser.set(item.user_id, item.time_taken);
						}

						if (!totalWordsPerUser.has(item.user_id)) {
							totalWordsPerUser.set(item.user_id, item.words.length);
						} else {
							totalWordsPerUser.set(
								item.user_id,
								totalWordsPerUser.get(item.user_id) + item.words.length
							);
						}
					}

					setLeaderboardData(
						Object.keys(newUsernames).map((userId) => ({
							user_id: userId,
							username: newUsernames[userId],
							fastest: fastestTimePerUser.get(userId) || 0,
							totalWords: totalWordsPerUser.get(userId) || 0,
						}))
					);
				}
			} catch (error) {
				console.error("Error fetching leaderboard data:", error);
			}
		};

		fetchData();
	}, []);

	return (
		<Table
			variant="striped"
			defaultSort={[{ id: "username", desc: false }]}
			highlightOnHover
			columns={columns}
			data={leaderboardData}
			renderFallbackValue={() => <p>No data</p>}
			enableRowSelection={false}
		/>
	);
}
