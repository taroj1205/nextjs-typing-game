// leaderboard.tsx
"use client";
import { useEffect, useState } from "react";
import { getUsername } from "@/lib/getUsername";
import { supabase } from "@/lib/supabase";
import { Stats } from "../dashboard/page";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

type SortKey = "username" | "fastest" | "totalWords";

export default function Leaderboard() {
	const [leaderboardData, setLeaderboardData] = useState<Stats[]>([]);
	const [usernames, setUsernames] = useState<Record<string, string>>({});
	const [fastestPerUser, setFastestPerUser] = useState<Record<string, number>>(
		{}
	);
	const [totalWordsPerUser, setTotalWordsPerUser] = useState<
		Record<string, number>
	>({});
	const [sortKey, setSortKey] = useState<SortKey>("username");

	const [page, setPage] = useState(1);
	const rowsPerPage = 10;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data, error } = await supabase.from("stats").select("*");

				if (error) {
					console.error("Error fetching leaderboard data:", error);
				} else {
					const newUsernames: Record<string, string> = { ...usernames };
					const newFastestPerUser: Record<string, number> = {
						...fastestPerUser,
					};
					const newTotalWordsPerUser: Record<string, number> = {
						...totalWordsPerUser,
					};

					for (let item of data) {
						if (!newUsernames[item.user_id]) {
							newUsernames[item.user_id] = await getUsername(item.user_id);
						}

						if (
							!newFastestPerUser[item.user_id] ||
							item.time_taken < newFastestPerUser[item.user_id]
						) {
							newFastestPerUser[item.user_id] = item.time_taken;
						}

						if (!newTotalWordsPerUser[item.user_id]) {
							newTotalWordsPerUser[item.user_id] = item.words.length;
						} else {
							newTotalWordsPerUser[item.user_id] += item.words.length;
						}
					}

					setUsernames(newUsernames);
					setFastestPerUser(newFastestPerUser);
					setTotalWordsPerUser(newTotalWordsPerUser);
					setLeaderboardData(data);
				}
			} catch (error) {
				console.error("Error fetching leaderboard data:", error);
			}
		};

		fetchData();
	}, []);

	const uniqueLeaderboardData = leaderboardData.reduce(
		(acc: Stats[], curr: Stats) => {
			const existingUser = acc.find((item) => item.user_id === curr.user_id);

			if (!existingUser) {
				// If the user doesn't exist in the accumulator, add it
				acc.push(curr);
			} else {
				// If the user exists, check if the current item has a faster time or more words
				if (
					curr.time_taken < existingUser.time_taken ||
					(curr.words && curr.words.length > (existingUser.words?.length ?? 0))
				) {
					// Replace the existing user with the current item
					const index = acc.indexOf(existingUser);
					acc[index] = curr;
				}
			}

			return acc;
		},
		[]
	);

	const sortedLeaderboardData = [...uniqueLeaderboardData]
		.sort((a, b) => {
			switch (sortKey) {
				case "username":
					return usernames[a.user_id].localeCompare(usernames[b.user_id]);
				case "fastest":
					return fastestPerUser[a.user_id] - fastestPerUser[b.user_id];
				case "totalWords":
					return totalWordsPerUser[b.user_id] - totalWordsPerUser[a.user_id];
				default:
					return 0;
			}
		})
		.slice((page - 1) * rowsPerPage, page * rowsPerPage);

	// Define the columns for the table
	const columns: GridColDef[] = [
		{ field: "username", headerName: "Username", width: 200 },
		{ field: "fastest", headerName: "Fastest time (s)", type: "number", width: 170 },
		{
			field: "totalWords",
			headerName: "Total Words",
			type: "number",
			width: 150,
		},
	];

	// Inside the Leaderboard component
	const rows = sortedLeaderboardData.map((data, index) => ({
		id: index,
		username: usernames[data.user_id],
		fastest: fastestPerUser[data.user_id],
		totalWords: totalWordsPerUser[data.user_id],
	}));
  
	return (
		<div className="p-4 min-h-[100svh] flex flex-col items-center space-y-2">
			<h2 className="text-4xl font-bold mb-4">Leaderboard</h2>
      <div className="max-w-[90svw]"><DataGrid
				rows={rows}
				columns={columns}
				initialState={{
					pagination: {
						paginationModel: { page: page - 1, pageSize: rowsPerPage },
					},
        }}
        rowSelection={false}
				pageSizeOptions={[5, 10]}
			/></div>
		</div>
	);
}
