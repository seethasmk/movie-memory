import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Ask OpenAI for one fun fact (fails after 8s)
export async function generateFact(movie: string): Promise<string> {
  const res = await openai.chat.completions.create(
    {
      model: "gpt-4o-mini",
      max_tokens: 100,
      messages: [
        { role: "system", content: "You share short, accurate fun facts about movies." },
        { role: "user", content: `Give one fun fact about the movie "${movie}" in under 40 words.` },
      ],
    },
    { timeout: 8000, maxRetries: 0 }
  );

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from OpenAI");
  return text;
}