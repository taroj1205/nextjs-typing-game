"use client";
import { generate } from "random-words";
import { useState, useEffect, useRef } from "react";

export default function TypingGame() {
	const [currentWordIndex, setCurrentWordIndex] = useState(0);
	const [inputValue, setInputValue] = useState("");
	const [showTranslation, setShowTranslation] = useState(false);
	const [typedWords, setTypedWords] = useState<string[]>([]);
	const [isCorrect, setIsCorrect] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
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

	const fetchWords = async () => {
		const words = generate(5);
		const translations = await Promise.all(
			words.map(async (word) => {
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
			})
		);

		return translations;
	};

	useEffect(() => {
		fetchWords().then((data) => {
			setWords(data);
			setIsLoading(false);
			inputRef.current?.focus();
		});
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
				<h1 className="text-6xl mb-4">Loading...</h1>
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
      const kanjiLengthPerFurigana = Math.floor(kanji.length / furiganaParts.length);
      return furiganaParts.map((furigana, i) => {
        const start = i * kanjiLengthPerFurigana;
        const end = i === furiganaParts.length - 1 ? kanji.length : start + kanjiLengthPerFurigana;
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
			className="flex flex-col items-center justify-center h-[100svh]"
			onClick={() => inputRef.current?.focus()}>
			{!showTranslation ? (
					<p className="text-9xl fixed">
						{Array.from(inputValue).map((char, index) => {
							const isCharCorrect =
								words[currentWordIndex].english.charAt(index) === char;
							return (
								<span
									key={index}
									className={isCharCorrect ? "text-green-500" : "text-red-500"}>
									{char}
								</span>
							);
						})}
						<span className="text-gray-500">
							{words[currentWordIndex].english.substring(inputValue.length)}
						</span>
					</p>
			) : (
				<p className="text-9xl translation">
					{words[currentWordIndex].japanese.kanji
						? renderFurigana(words[currentWordIndex].japanese.furigana)
						: words[currentWordIndex].japanese.kana}
				</p>
			)}
			<input
				ref={inputRef}
				className="inset-0 absolute opacity-0 p-2 bg-transparent text-transparent"
				value={inputValue}
				onChange={handleInputChange}
				onBlur={() => {
					inputRef.current?.focus();
        }}
        autoFocus
			/>
		</main>
	);
}
