"use client";
import { getUsername } from "@/lib/getUsername";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { Input } from "@yamada-ui/react";
import { useEffect, useRef, useState } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	CartesianGrid,
} from "recharts";

interface Word {
	english: string;
	japanese: { kanji: string; kana: string; furigana: string };
	accuracy: number;
	misstypedLetters: string | null;
}

interface WordTooltipProps {
	word: Word;
}

export interface Stats {
	id: number;
	user_id: string;
	username: string;
	time_taken: number;
	accuracy: number | null;
	misstyped_letters: { [key: string]: string }[] | null;
	words: Word[] | null;
	start_time: string | null;
	end_time: string | null;
	correct_words: string[] | null;
	wrong_words: string[] | null;
	created_at: string;
	date: string;
	deleted_at: string | null;
}

export default function Dashboard() {
	const [stats, setStats] = useState<Stats[]>([]);
	const [loadingStats, setLoadingStats] = useState(true);
	const { isLoaded, userId } = useAuth();
	const username = useRef("");

	useEffect(() => {
		if (!isLoaded) return;
		fetchStats();
	}, [isLoaded]);

	const fetchStats = async () => {
		if (userId) {
			const { data, error } = await supabase
				.from("stats")
				.select("*")
				.eq("user_id", userId);

			if (error) console.error("Error fetching stats: ", error);
			else {
				username.current = String(await getUsername(userId));
				const formattedData = data.map((stat) => {
					console.log("Accuracy for stat", stat.id, ":", stat.accuracy);
					return {
						...stat,
						created_at: new Date(stat.created_at).toLocaleString(undefined, {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
							hour: "2-digit",
							minute: "2-digit",
							hour12: false,
						}),
						date: new Date(stat.created_at).toLocaleDateString(),
						username,
						accuracy: parseFloat(stat.accuracy.toFixed(2)),
						words: stat.words.map((word: Word, index: number) => ({
							...word,
							misstypedLetters: stat.misstyped_letters
								? stat.misstyped_letters[index]
								: null,
						})),
					};
				});
				setStats(formattedData || []);
				setLoadingStats(false);
			}
		}
	};

	const uniqueDates = Array.from(new Set(stats.map((stat) => stat.created_at)));

	const onlyDates = Array.from(new Set(stats.map((stat) => stat.date)));

	// Group stats by date and calculate total words for each date
	const totalWordsPerDay = stats.reduce(
		(acc: { [key: string]: number }, stat) => {
			const date = stat.date;
			const totalWords = stat.words ? stat.words.length : 0;

			if (acc[date]) {
				acc[date] += totalWords;
			} else {
				acc[date] = totalWords;
			}

			return acc;
		},
		{}
	);

	// Convert the totalWordsPerDay object to an array
	const totalWordsPerDayArray = Object.entries(totalWordsPerDay).map(
		([date, totalWords]) => ({
			date,
			totalWords,
		})
	);

	return (
		<>
			<div className="p-4 flex flex-col items-center max-w-screen">
				<div className="flex flex-col items-center">
					<h2 className="text-4xl font-bold mb-4">
						Dashboard{username.current && ` - ${username.current}`}
					</h2>
				</div>
				{stats.length > 0 ? (
					<div className="flex flex-col items-center justify-center max-w-[90svw] space-y-2">
						<StatsSummary stats={stats} />
						<div className="flex flex-col space-y-2 items-center justify-center">
							<LineChart
								width={Math.min(600, window.innerWidth - 40)}
								height={300}
								data={stats}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="created_at" ticks={uniqueDates} />
								<YAxis />
								<Tooltip />
								<Legend />
								<Line
									type="monotone"
									dataKey="time_taken"
									stroke="#8884d8"
									name="Time Taken (s)"
								/>
								<Line
									type="monotone"
									dataKey="accuracy"
									stroke="#82ca9d"
									name="Accuracy (%)"
								/>
							</LineChart>
							<LineChart
								width={Math.min(600, window.innerWidth - 40)}
								height={300}
								data={totalWordsPerDayArray}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" ticks={onlyDates} />
								<YAxis />
								<Tooltip />
								<Legend />
								<Line
									type="monotone"
									dataKey="totalWords"
									stroke="#ff0000"
									name="Total Words"
								/>
							</LineChart>
						</div>
						<WordsHistory stats={stats} />
					</div>
				) : loadingStats ? (
					<Loading />
				) : (
					<div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 text-gray-500">
						<p>No data available</p>
					</div>
				)}
			</div>
		</>
	);
}

const WordsHistory = ({ stats }: { stats: Stats[] }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const order = ["none", "asc", "desc"];
	const [sortOrder, setSortOrder] = useState(order[0]);
	const [accuracySortOrder, setAccuracySortOrder] = useState(order[0]);
	const [showWrong, setShowWrong] = useState(false);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const handleSortClick = () => {
		setAccuracySortOrder(order[0]);
		if (sortOrder === order[0]) {
			setSortOrder(order[1]);
		} else if (sortOrder === order[1]) {
			setSortOrder(order[2]);
		} else {
			setSortOrder(order[0]);
		}
	};

	const handleAccuracySortClick = () => {
		setSortOrder(order[0]);
		if (accuracySortOrder === order[0]) {
			setAccuracySortOrder(order[1]);
		} else if (accuracySortOrder === order[1]) {
			setAccuracySortOrder(order[2]);
		} else {
			setAccuracySortOrder(order[0]);
		}
	};

	let filteredStats = stats.flatMap((stat) =>
		(stat.words || [])
			.map((word, index) => {
				const totalLetters = word.english.length;
				const misstypedLetters =
					stat.misstyped_letters && stat.misstyped_letters[index]
						? Object.values(stat.misstyped_letters[index]).length
						: 0;
				const accuracy =
					((totalLetters - misstypedLetters) / totalLetters) * 100;
				return { ...word, accuracy };
			})
			.filter((word) => {
				return (
					word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(word.japanese.kanji && word.japanese.kanji.includes(searchTerm)) ||
					word.japanese.kana.toLowerCase().includes(searchTerm.toLowerCase())
				);
			})
	);

	if (sortOrder === order[1]) {
		filteredStats = filteredStats.sort((a, b) =>
			a.english.localeCompare(b.english)
		);
	} else if (sortOrder === order[2]) {
		filteredStats = filteredStats.sort((a, b) =>
			b.english.localeCompare(a.english)
		);
	}

	if (accuracySortOrder === order[1]) {
		filteredStats = filteredStats.sort((a, b) => b.accuracy - a.accuracy);
	} else if (accuracySortOrder === order[2]) {
		filteredStats = filteredStats.sort((a, b) => a.accuracy - b.accuracy);
	}

	function renderFurigana(text: string) {
		const parts = text.split(/[\[\]]/);
		return parts.map((part, index) => {
			if (index % 2 === 0) {
				return part;
			} else {
				const readings = part.split("|");
				const kanji = readings[0];
				const furiganaParts = readings.slice(1);
				const kanjiLengthPerFurigana = Math.floor(
					kanji.length / furiganaParts.length
				);
				return furiganaParts.map((furigana, i) => {
					const start = i * kanjiLengthPerFurigana;
					const end =
						i === furiganaParts.length - 1
							? kanji.length
							: start + kanjiLengthPerFurigana;
					const kanjiPart = kanji.slice(start, end);
					return (
						<ruby key={i}>
							{kanjiPart}
							<rt>{furigana}</rt>
						</ruby>
					);
				});
			}
		});
	}

	return (
		<div className="flex items-center flex-col px-4 w-full max-w-[600px]">
			<Input
				placeholder="Search for words..."
				value={searchTerm}
				onChange={handleSearchChange}
			/>
			<table className="table-auto w-full text-center">
				<thead>
					<tr>
						<th className="px-4 py-2 text-lg text-right flex flex-row items-center justify-end">
							Typed Word{" "}
							<button
								className="w-4 h-4 ml-2 p-2 flex items-center justify-center"
								onClick={handleSortClick}>
								{sortOrder === order[1] ? (
									"▲"
								) : sortOrder === order[2] ? (
									"▼"
								) : (
									<div className="flex flex-col text-[0.5rem] leading-3">
										<span>▲</span>
										<span>▼</span>
									</div>
								)}
							</button>
							<input
								type="checkbox"
								checked={showWrong}
								onChange={() => setShowWrong(!showWrong)}
							/>
						</th>
						<th className="px-4 py-2 text-lg text-left">Translation</th>
						<th className="px-4 py-2 text-lg text-center flex flex-row items-center justify-center">
							Accuracy{" "}
							<button
								className="w-4 h-4 ml-2 p-2 flex items-center justify-center"
								onClick={handleAccuracySortClick}>
								{accuracySortOrder === order[1] ? (
									"▲"
								) : accuracySortOrder === order[2] ? (
									"▼"
								) : (
									<div className="flex flex-col text-[0.5rem] leading-3">
										<span>▲</span>
										<span>▼</span>
									</div>
								)}
							</button>
						</th>
					</tr>
				</thead>
				<tbody>
					{filteredStats.length > 0 ? (
						filteredStats.map((word, wordIndex) => (
							<tr key={wordIndex} className="hover:bg-gray-100">
								<td className="border px-4 py-2 text-lg text-right">
									{showWrong ? <WordTooltip word={word} /> : word.english}
								</td>
								<td className="border px-4 py-2 text-lg text-left">
									{word.japanese.kanji
										? renderFurigana(word.japanese.furigana)
										: word.japanese.kana}
								</td>
								<td className="border px-4 py-2 text-lg text-right">
									{word.accuracy.toFixed(0)}%
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={3} className="text-center py-4">
								No results
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};

const WordTooltip = ({ word }: WordTooltipProps) => {
	return (
		word &&
		word.english.split("").map((letter, index) => (
			<span
				key={index}
				style={{
					color:
						word.misstypedLetters && word.misstypedLetters[index]
							? "red"
							: "green",
				}}>
				{letter}
			</span>
		))
	);
};

const StatsSummary = ({ stats }: { stats: Stats[] }) => {
	const totalWords = stats.reduce(
		(total, stat) => total + (stat.words ? stat.words.length : 0),
		0
	);

	const totalAccuracy = stats.reduce(
		(total, stat) => total + (stat.accuracy || 0),
		0
	);
	const averageAccuracy = totalAccuracy / stats.length;

	return (
		<div className="p-4 rounded-md flex flex-col items-center space-y-4">
			<div className="font-semibold text-lg self-start">
				Total words: {totalWords}
			</div>
			<div className="font-semibold text-lg self-start">
				Average accuracy: {averageAccuracy.toFixed(0)}%
			</div>
		</div>
	);
};

const Loading = () => {
	return (
		<div className="flex flex-col items-center justify-center space-y-4">
			{/* Skeleton loader for the graphs */}
			<div className="flex flex-row flex-wrap space-x-2 space-y-2 items-center justify-center">
				{Array(1)
					.fill(null)
					.map((_, i) => (
						<div
							key={i}
							className="w-[600px] max-w-[90svw] h-[300px] bg-gray-200 animate-pulse"></div>
					))}
			</div>

			{/* Skeleton loader for the table */}
			<table className="table-auto animate-pulse">
				<thead>
					<tr>
						<th className="px-4 py-2 text-lg text-right">Typed Word</th>
						<th className="px-4 py-2 text-lg text-left">Translation</th>
					</tr>
				</thead>
				<tbody>
					{/* Add 5 rows of empty strings */}
					{Array(5)
						.fill(null)
						.map((_, i) => (
							<tr key={`empty-${i}`}>
								<td className="border px-4 py-2 text-lg text-right">&nbsp;</td>
								<td className="border px-4 py-2 text-lg text-left">&nbsp;</td>
							</tr>
						))}
				</tbody>
			</table>
		</div>
	);
};
