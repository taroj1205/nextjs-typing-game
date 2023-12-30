"use client";
import { MenuBar } from "@/components/MenuBar";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { SignInButton, SignedOut, useAuth } from "@clerk/nextjs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Text, useLoading } from "@yamada-ui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { generate } from "random-words";
import {
	useState,
	useEffect,
	useRef,
	use,
	useLayoutEffect,
	useCallback,
} from "react";

class Stopwatch {
	private startTime: Date | null = null;
	private endTime: Date | null = null;
	private hasStarted: boolean = false;
	private hasStopped: boolean = false;

	start() {
		if (this.hasStarted) {
			return;
		}

		this.startTime = new Date();
		this.hasStarted = true;
	}

	stop() {
		if (this.hasStopped) {
			return;
		}

		this.endTime = new Date();
		this.hasStopped = true;
	}

	get duration() {
		if (!this.startTime || !this.endTime) {
			return 0;
		}

		return (this.endTime.getTime() - this.startTime.getTime()) / 1000;
	}
}

export default function TypingGame() {
	const [currentWordIndex, setCurrentWordIndex] = useState(0);
	const [inputValue, setInputValue] = useState("");
	const [showTranslation, setShowTranslation] = useState(false);
	const [typedWords, setTypedWords] = useState<string[]>([]);
	const [correctWords, setCorrectWords] = useState<string[]>([]);
	const [wrongWords, setWrongWords] = useState<string[]>([]);
	const [currentWord, setCurrentWord] = useState("");
	const [isCorrect, setIsCorrect] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const charRef = useRef<HTMLParagraphElement>(null);
	const translationRef = useRef<HTMLParagraphElement>(null);
	const [gameHeight, setGameHeight] = useState("100svh");
	const [words, setWords] = useState<
		{
			english: string;
			japanese: { kanji: string; kana: string; furigana: string };
		}[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [startTime, setStartTime] = useState<Date | null>(null);
	const endTime = useRef<Date | null>(null);
	const [totalCorrectChars, setTotalCorrectChars] = useState(0);
	const [totalChars, setTotalChars] = useState(0);
	const { isLoaded, userId } = useAuth();
	const [isSaving, setIsSaving] = useState(0);
	const [missTypedLetters, setMissTypedLetters] = useState<string[]>([]);
	const stopwatch = useRef(new Stopwatch());
	const [showWrong, setShowWrong] = useState(false);

	useEffect(() => {
		if (showTranslation) {
			setTypedWords((prevWords) => [
				...prevWords,
				words[currentWordIndex].english,
			]);
			const timer = setTimeout(() => {
				setInputValue("");
				setIsCorrect(0);
				setShowTranslation(false);
				setCurrentWordIndex((prevIndex) => prevIndex + 1);
			}, 1000); // Change this value to adjust the delay

			return () => clearTimeout(timer); // Clean up the timer
		}
	}, [showTranslation]);

	useEffect(() => {
		inputRef.current?.focus();
	}, [showTranslation]);

	const resizeText = useCallback(() => {
		if (charRef.current) {
			const font = window.getComputedStyle(charRef.current).font;
			console.log(currentWord);
			const text = inputValue.length > 0 ? inputValue : currentWord;
			const textWidth = getActualTextWidth(text, font);
			const containerWidth = window.innerWidth - 20;
			const scaleFactor = containerWidth / textWidth;
			charRef.current.style.transform = `scale(${
				scaleFactor > 1 ? 1 : scaleFactor
			})`;
		}
	}, [inputValue, showTranslation, currentWord]);

	const adjustHeight = useCallback(() => {
		const height = window.innerHeight;
		setGameHeight(`${height - 36}px`);
		requestAnimationFrame(resizeText);
	}, [resizeText]);

	useEffect(() => {
		adjustHeight();

		window.addEventListener("resize", adjustHeight);

		return () => {
			window.removeEventListener("resize", adjustHeight);
		};
	}, [adjustHeight]);

	const getTranslation = async (word: string) => {
		const response = await fetch("https://jotoba.de/api/search/words", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query: word,
				language: "Japanese",
				no_english: false,
			}),
		});
		const data = await response.json();

		if (data.words && data.words.length > 0) {
			const commonWord = data.words.find((word: any) => word.common === true);

			if (commonWord) {
				console.log(commonWord.reading);
				return {
					english: word,
					japanese: commonWord.reading,
				};
			}
		}

		return {
			english: word,
			japanese: {},
		};
	};

	const fetchWords = async () => {
		const words = generate(5);
		const translations = [];
		for (const word of words) {
			let translation;
			do {
				translation = await getTranslation(word);
			} while (!translation.japanese.kanji && !translation.japanese.kana);
			translations.push(translation);
		}
		return translations;
	};

	const {screen} = useLoading();

	useEffect(() => {
		screen.start({message: <Text size="lg">Preparing words...</Text>});
		setIsLoading(true);
		const timeout = new Promise((_, reject) =>
			setTimeout(() => reject(new Error("Try reloading")), 10000)
		);
		Promise.race([fetchWords(), timeout])
			.then((data: any) => {
				const validTranslations = data.filter(Boolean);
				setWords(validTranslations);
				setTimeout(() => {
					setIsLoading(false);
					screen.finish()
					stopwatch.current.start();
				}, 1000);
				inputRef.current?.focus();
				setCurrentWord(validTranslations[0].english);
				resizeText();
			})
			.catch((error) => {
				alert(error.message);
				screen.finish()
			});
	}, []);

	const getActualTextWidth = (text: string, font: string) => {
		const element = document.createElement("span");
		element.style.font = font;
		element.textContent = text;
		document.body.appendChild(element);
		const width = element.offsetWidth;
		document.body.removeChild(element);
		return width;
	};

	useEffect(() => {
		requestAnimationFrame(resizeText);
	}, [resizeText]);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
		const word = words[currentWordIndex].english;
		if (word.startsWith(event.target.value)) {
			setIsCorrect(1);
			if (event.target.value === word) {
				setTotalCorrectChars((prev) => prev + event.target.value.length);
				setShowTranslation(true);
				if (currentWordIndex < words.length - 1) {
					setCurrentWord(words[currentWordIndex + 1].english);
				}

				// Append to correctWords or wrongWords
				if (isCorrect === 1) {
					setCorrectWords((prevWords) => [...prevWords, word]);
				} else {
					setWrongWords((prevWords) => [...prevWords, word]);
				}
			}
		} else {
			setIsCorrect(2);

			// Add the current input value to missTypedLetters
			setMissTypedLetters((prevLetters: any[]) => {
				const newLetters = [...prevLetters];
				const correctWord = words[currentWordIndex].english;
				const inputValue = event.target.value;

				if (!newLetters[currentWordIndex]) {
					newLetters[currentWordIndex] = {};
				}

				if (inputValue.length > correctWord.length) {
					// User has typed more characters than the correct word
					newLetters[currentWordIndex][correctWord.length] = inputValue.slice(
						correctWord.length
					);
				} else if (
					inputValue[inputValue.length - 1] !==
					correctWord[inputValue.length - 1]
				) {
					// The last character the user typed is incorrect
					newLetters[currentWordIndex][inputValue.length - 1] =
						inputValue[inputValue.length - 1];
				}

				return newLetters;
			});
		}
		setTotalChars((prev) => prev + 1);
	};

	if (isLoading) {
		return (null);
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

	if (currentWordIndex >= words.length) {
		stopwatch.current.stop();
		if (endTime.current === null && startTime)
			endTime.current = new Date(
				startTime.getTime() + stopwatch.current.duration * 1000
			);
		const timeTaken = stopwatch.current.duration;
		console.log(missTypedLetters);
		let totalMistypedLetters = 0;
		if (missTypedLetters) {
			totalMistypedLetters = Object.values(missTypedLetters).reduce(
				(total, current) => total + (current ? Object.keys(current).length : 0),
				0
			);
		}

		const accuracy =
			totalChars > 0
				? ((totalChars - totalMistypedLetters) / totalChars) * 100
				: 0;

		const saveData = async () => {
			setIsSaving(1);
			// if logged in, send data to supabase
			if (isLoaded && userId) {
				const { data, error } = await supabase.from("stats").insert([
					{
						user_id: userId,
						time_taken: timeTaken,
						accuracy,
						misstyped_letters: missTypedLetters,
						words,
						start_time: startTime,
						end_time: endTime.current,
						correct_words: correctWords,
						wrong_words: wrongWords,
					},
				]);

				if (error) {
					console.error("Error inserting data: ", error);
					setIsSaving(3);
				} else {
					console.log("Data inserted successfully: ", data);
					setIsSaving(2);
				}
			}
		};

		const accuracyColor: { [key: string]: string } = {
			100: "bg-green-700",
			90: "bg-green-600",
			80: "bg-green-500",
			70: "bg-green-400",
			60: "bg-green-300",
			50: "bg-yellow-300",
			40: "bg-yellow-400",
			30: "bg-yellow-500",
			20: "bg-red-300",
			10: "bg-red-400",
			0: "bg-red-500",
		};

		const wrongLetterTotal = missTypedLetters.reduce(
			(total, current) => total + (current ? Object.keys(current).length : 0),
			0
		);

		return (
			<main className="flex flex-col items-center justify-center h-[100svh] bg-gray-100" style={{height: gameHeight}}>
				<h1 className="text-5xl mb-4 text-blue-500">Finished!</h1>
				<div className="mt-4 flex flex-col space-y-2 bg-white text-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
					<table className="table-auto">
						<thead>
							<tr>
								<th className="px-4 py-2 text-lg text-right flex flex-row items-center justify-end">
									Typed Word{" "}
									<input
										type="checkbox"
										checked={showWrong}
										onChange={() => setShowWrong(!showWrong)}
									/>
								</th>
								<th className="px-4 py-2 text-lg text-left">Translation</th>
							</tr>
						</thead>
						<tbody>
							{typedWords.map((word, index) => (
								<tr key={index}>
									<td className="border px-4 py-2 text-lg text-right">
										{showWrong ? (
											<WordTooltip
												word={word}
												misstypedLetters={missTypedLetters[index]}
											/>
										) : (
											word
										)}
									</td>
									<td className="border px-4 py-2 text-lg text-left">
										{words[index].japanese.kanji
											? renderFurigana(words[index].japanese.furigana)
											: words[index].japanese.kana}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<p className="text-xl font-semibold">
						Time taken: <span>{timeTaken} seconds</span>
					</p>
					<p className="text-xl font-semibold">
						Accuracy:{" "}
						<span className={accuracyColor[Math.round(accuracy / 10) * 10]}>
							{accuracy.toFixed(2)}%
						</span>
					</p>
					<div className="mt-4">
						{Object.entries(missTypedLetters).length > 0 ? (
							<div className="text-xl font-semibold mb-2 flex flex-row items-center">
								Incorrect characters:
								<div className="flex flex-col ml-2">
									<span className="text-center">{wrongLetterTotal}</span>
									<hr className="border-gray-800" />
									<span className="text-center">
										{words.reduce(
											(total, word) => total + word.english.length,
											0
										) + wrongLetterTotal}
									</span>
								</div>
							</div>
						) : (
							<h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
								Congratulations! You got all the words correct!
							</h2>
						)}
					</div>
				</div>
				<div className="flex flex-row space-x-4 items-center justify-center mt-6">
					<button
						className="text-lg bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-lg"
						onClick={() => {
							// reload page
							window.location.reload();
						}}>
						Play Again
					</button>
					{isLoaded && userId ? (
						<>
							<button
								className="text-lg bg-indigo-500 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-lg"
								onClick={saveData}
								disabled={isSaving !== 3 && isSaving !== 0}>
								{isSaving === 1
									? "Saving..."
									: isSaving === 2
									? "Saved!"
									: isSaving === 3
									? "Error try again."
									: "Save"}
							</button>
							<Link
								className="text-lg bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-lg"
								href="/dashboard">
								Go to Dashboard
							</Link>
						</>
					) : (
						<SignInButton>
							<button className="text-lg bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-lg">
								Sign In to Save
							</button>
						</SignInButton>
					)}
				</div>
			</main>
		);
	}

	return (
		<main
			className="auto-resize flex flex-col items-center justify-center w-screen h-[100svh] typing-text bg-gray-100 text-gray-800"
			style={{ height: gameHeight }}
			onClick={() => inputRef.current?.focus()}>
			{!showTranslation ? (
				<>
					<p
						onLoad={() => {
							resizeText();
						}}
						className="flex flex-row items-center justify-center w-screen font-mono px-1"
						ref={charRef}>
						{Array.from(inputValue).map((char, index) => {
							const isCharCorrect =
								words[currentWordIndex].english.charAt(index) === char;
							return (
								<span
									key={index}
									className={isCharCorrect ? "text-green-500" : "text-red-500"}>
									{isCharCorrect ? (
										char
									) : (
										<div className="flex items-center flex-col">
											<span className="z-10">{char}</span>
											<span
												className="ruby z-0 text-gray-500 absolute"
												style={{ fontSize: "25%" }}>
												{words[currentWordIndex].english.charAt(index)}
											</span>
										</div>
									)}
								</span>
							);
						})}
						<span id="not-typed" className="text-gray-500">
							{words[currentWordIndex].english.substring(inputValue.length)}
						</span>
					</p>
					<div className="flex items-center justify-center">
						<input
							ref={inputRef}
							className="z-0 fixed opacity-0 bg-transparent text-transparent"
							value={inputValue}
							onChange={handleInputChange}
							onFocus={(event) => {
								// Change input language to English variants if not already
								event.target.lang = "en-US";
							}}
							lang="en-US"
							autoComplete="off"
							autoCorrect="off"
							spellCheck="false"
							autoFocus
						/>
					</div>
				</>
			) : (
				<p ref={translationRef} id="translation" className="translation">
					{words[currentWordIndex].japanese.kanji
						? renderFurigana(words[currentWordIndex].japanese.furigana)
						: words[currentWordIndex].japanese.kana}
				</p>
			)}
		</main>
	);
}

interface WordTooltipProps {
	word: string;
	misstypedLetters: string;
}

const WordTooltip: React.FC<WordTooltipProps> = ({
	word,
	misstypedLetters,
}) => {
	return (
		word &&
		word.split("").map((letter, index) => (
			<span
				key={index}
				style={{
					color: misstypedLetters && misstypedLetters[index] ? "red" : "green",
				}}>
				{letter}
			</span>
		))
	);
};
