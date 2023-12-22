"use client";
import { useEffect, useMemo, useState } from "react";
import {
	Table,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	TableHeader,
} from "@nextui-org/react";
import { getUsername } from "@/lib/getUsername";
import { supabase } from "@/lib/supabase";

type SortKey = "username" | "fastest" | "totalWords";

interface LeaderboardData {
	user_id: string;
	username: string;
	fastest: number;
	totalWords: number;
}

interface SortDescriptor {
	column: string;
	direction: "ascending" | "descending";
}

export default function Leaderboard() {
	const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
	const [sortKey, setSortKey] = useState<SortKey>("username");
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "username",
		direction: "ascending",
	});

	const columnMapping: Record<string, SortKey> = {
		"$.0": "username",
		"$.1": "fastest",
		"$.2": "totalWords",
	};

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

	const sortedData = useMemo(() => {
		return [...leaderboardData].sort((a, b) => {
			let comparison = 0;

			switch (sortDescriptor.column) {
				case "username":
					comparison = a.username.localeCompare(b.username);
					break;
				case "fastest":
				case "totalWords":
					comparison = a[sortDescriptor.column] - b[sortDescriptor.column];
					break;
				default:
					break;
			}

			return sortDescriptor.direction === "ascending"
				? comparison
				: -comparison;
		});
	}, [leaderboardData, sortDescriptor]);

	return (
		<div className="p-4 min-h-[100svh] flex flex-col items-center space-y-2">
			<h2 className="text-4xl font-bold mb-4">Leaderboard</h2>
			<div className="max-w-[90svw]">
				<Table
					aria-label="Leaderboard Table"
					sortDescriptor={sortDescriptor}
					onSortChange={(descriptor) => {
						const column =
              columnMapping[descriptor.column as keyof typeof columnMapping];
            console.log(column);
						setSortKey(column as SortKey);
						setSortDescriptor((prevSortDescriptor: SortDescriptor) => {
							if (prevSortDescriptor.column === column) {
								return {
									column: column,
									direction:
										prevSortDescriptor.direction === "ascending"
											? "descending"
											: "ascending",
								};
							} else {
								return {
									column: column,
									direction: prevSortDescriptor.direction === "ascending" ? "descending" : "ascending",
								};
							}
						});
					}}>
					<TableHeader>
						<TableColumn
							allowsSorting
							id="username"
							aria-label="Username Column">
							Username
						</TableColumn>
						<TableColumn
							allowsSorting
							id="fastest"
							aria-label="Fastest Time Column">
							Fastest Time
						</TableColumn>
						<TableColumn
							allowsSorting
							id="totalWords"
							aria-label="Total Words Column">
							Total Words
						</TableColumn>
					</TableHeader>
					<TableBody>
						{sortedData.map((item) => (
							<TableRow key={item.user_id}>
								<TableCell>{item.username}</TableCell>
								<TableCell>{item.fastest}</TableCell>
								<TableCell>{item.totalWords}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
