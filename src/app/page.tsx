"use client";
import { generate } from "random-words";
import { useState, useEffect, useRef, use, useLayoutEffect } from "react";

export default function TypingGame() {
	const [currentWordIndex, setCurrentWordIndex] = useState(0);
	const [inputValue, setInputValue] = useState("");
	const [showTranslation, setShowTranslation] = useState(false);
	const [typedWords, setTypedWords] = useState<string[]>([]);
	const [isCorrect, setIsCorrect] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const charRef = useRef<HTMLParagraphElement>(null);
	const [gameHeight, setGameHeight] = useState("100svh");
	const [words, setWords] = useState<
		{
			english: string;
			japanese: { kanji: string; kana: string; furigana: string };
		}[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);

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

	const adjustHeight = () => {
		const height = window.innerHeight;
		setGameHeight(`${height}px`);
		requestAnimationFrame(resizeText);
	};

	useEffect(() => {
		adjustHeight();

		window.addEventListener("resize", adjustHeight);

		return () => {
			window.removeEventListener("resize", adjustHeight);
		};
	}, []);

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
			console.log(data.words[0].reading);
			return {
				english: word,
				japanese: data.words[0].reading,
			};
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

	useEffect(() => {
		setIsLoading(true);
		fetchWords().then((data) => {
			const validTranslations = data.filter(Boolean);
			setWords(validTranslations);
			setTimeout(() => {
				setIsLoading(false);
			}, 1000);
			inputRef.current?.focus();
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

	const resizeText = () => {
		if (charRef.current) {
			const font = window.getComputedStyle(charRef.current).font;
			const textWidth = getActualTextWidth(inputValue, font);
			const containerWidth = window.innerWidth - 20;
			const scaleFactor = containerWidth / textWidth;
			charRef.current.style.transform = `scale(${
				scaleFactor > 1 ? 1 : scaleFactor
			})`;
		}
	};

	useLayoutEffect(() => {
		requestAnimationFrame(resizeText);
	}, [inputValue]);

	useLayoutEffect(() => {
		requestAnimationFrame(resizeText);
	}, [isLoading])

	useLayoutEffect(() => {
		requestAnimationFrame(resizeText);
	}, [showTranslation]);

	useLayoutEffect(() => {
		requestAnimationFrame(resizeText);
	}, []);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
		if (words[currentWordIndex].english.startsWith(event.target.value)) {
			setIsCorrect(1);
			if (event.target.value === words[currentWordIndex].english) {
				console.log(words[currentWordIndex].japanese);
				setShowTranslation(true);
			}
		} else {
			setIsCorrect(2);
		}
	};

	if (isLoading) {
		return (
			<main className="flex flex-col items-center justify-center h-[100svh]">
				<h1 className="text-6xl mb-4">Typing Game</h1>
				<h2 className="text-4xl mb-4">Loading...</h2>
			</main>
		);
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
		return (
			<main className="flex flex-col items-center justify-center h-[100svh]">
				<h1 className="text-6xl mb-4">Finished!</h1>
				<div className="mt-4">
					<ul>
						{typedWords.map((word, index) => (
							<li
								key={index}
								className={
									words[index].japanese.furigana ? "text-4xl" : "mt-2 text-4xl"
								}>
								{word}:{" "}
								{words[index].japanese.kanji
									? renderFurigana(words[index].japanese.furigana)
									: words[index].japanese.kana}
							</li>
						))}
					</ul>
				</div>
			</main>
		);
	}

	return (
		<main
			className="flex flex-col items-center justify-center h-[100svh] w-screen typing-text"
			style={{ height: gameHeight }}
			onClick={() => inputRef.current?.focus()}>
			{!showTranslation ? (
				<p
					className="fixed flex flex-row items-center justify-center w-screen font-mono px-1"
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
					<span className="text-gray-500">
						{words[currentWordIndex].english.substring(inputValue.length)}
					</span>
				</p>
			) : (
				<p className="translation">
					{words[currentWordIndex].japanese.kanji
						? renderFurigana(words[currentWordIndex].japanese.furigana)
						: words[currentWordIndex].japanese.kana}
				</p>
			)}
			<input
				ref={inputRef}
				className="inset-0 z-0 absolute opacity-0 p-2 bg-transparent text-transparent"
				value={inputValue}
				onChange={handleInputChange}
				onBlur={() => {
					inputRef.current?.focus();
				}}
				type="password"
				autoComplete="off"
				autoFocus
			/>
		</main>
	);
}
