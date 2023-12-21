import { GoogleGenerativeAI } from '@google/generative-ai';

const api = String(process.env.GOOGLE_API_KEY);
const genAI = new GoogleGenerativeAI(api);

export async function POST(request: Request) {
  const data = await request.json();

  const instruction = `
  Analyze the provided data and generate a summary report.

  Below is an example of an analysis.
  [
    {
      "english": "adjective",
      "japanese": {
        "kana": "けいようし",
        "kanji": "形容詞",
        "furigana": "[形容詞|けい|よう|し]"
      }
    },
    {
      "english": "room",
      "japanese": {
        "kana": "ルーム",
        "furigana": null
      }
    },
    {
      "english": "sense",
      "japanese": {
        "kana": "かんかく",
        "kanji": "感覚",
        "furigana": "[感覚|かん|かく]"
      }
    },
    {
      "english": "indicate",
      "japanese": {
        "kana": "しめす",
        "kanji": "示す",
        "furigana": "[示|しめ]す"
      }
    },
    {
      "english": "piece",
      "japanese": {
        "kana": "ピース",
        "furigana": null
      }
    }
  ]
  "misstyped_letters": [
    {
      "0": "h",
      "3": "a"
    },
    null,
    {
      "2": "a"
    }
  ],

  This shows the user's misstyped letters per game. In this case, the user has misstyped the letter "h" instead of the correct letter in the first word (adjective) first letter and third letter in the first and third word as a instead of the correct letter.

  The report should be in the following format:
  **Your most misstyped letters**:
  * a (1)
  * j (1)
  * e (1)

  **Your most misstyped words**:
  * adjective (1) {average accuracy}%
  * sense (1) {average accuracy}%
  `

  if (!data) {
    return new Response(JSON.stringify({ error: 'No prompt provided' }));
  }

  const prompt = `${instruction} ${JSON.stringify(data)}`

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);

  return new Response(JSON.stringify(text));
}