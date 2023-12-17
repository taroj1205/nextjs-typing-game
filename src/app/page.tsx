'use client'
import { useState, useEffect, useRef } from 'react';

const words = [
  { english: 'hello', japanese: 'こんにちは' },
  { english: 'goodbye', japanese: 'さようなら' },
  // Add more words here...
];

export default function TypingGame() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showTranslation) {
      setTypedWords((prevWords) => [...prevWords, words[currentWordIndex].english]);
      const timer = setTimeout(() => {
        setInputValue('');
        setShowTranslation(false);
        setCurrentWordIndex((prevIndex) => prevIndex + 1);
      }, 1000); // Change this value to adjust the delay

      return () => clearTimeout(timer); // Clean up the timer
    }
  }, [showTranslation]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [showTranslation]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    if (event.target.value === words[currentWordIndex].english) {
      setShowTranslation(true);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl mb-4">Typing Game</h1>
      {!showTranslation ? (
        <>
          <p className="text-4xl mb-4">Type the following word:</p>
          <p className="text-6xl mb-4">
            <span className="text-white">{inputValue}</span>
            <span className="text-gray-500">{words[currentWordIndex].english.substring(inputValue.length)}</span>
          </p>
          <input 
            ref={inputRef}
            className="text-6xl border p-2 bg-transparent text-transparent"
            value={inputValue} 
            onChange={handleInputChange} 
          />
        </>
      ) : (
        <p className="text-6xl mb-4">Translation: {words[currentWordIndex].japanese}</p>
      )}
      {currentWordIndex >= words.length && (
        <div className="mt-4">
          <h2 className="text-4xl mb-2">Words you typed:</h2>
          <ul>
            {typedWords.map((word, index) => (
              <li key={index} className="text-2xl">{word}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}