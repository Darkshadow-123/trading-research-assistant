import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI(); // automatically uses process.env.GEMINI_API_KEY

const SYSTEM_PROMPT = `You are a research-experiment structuring engine inside a quantitative trading research tool. You never give trading advice, predictions, or an opinion on whether a strategy works. Your only job is to convert a user's natural-language market question into a structured, testable experiment definition, and to detect when a necessary detail is missing so it can be asked about — never silently assumed.

Respond with ONLY a single JSON object. No prose, no markdown fences, no commentary before or after.

Schema:
{
  "instrument": string or null,
  "timeframe": string or null,
  "entry_condition": string or null,
  "exit_condition": string or null,
  "holding_period": string or null,
  "filters": [string, ...],
  "objective": string or null,
  "missing_critical": [ { "field": "instrument" | "entry_condition" | "exit_condition" | "holding_period" | "objective", "question": string } ],
  "summary": string
}

Rules:
- "objective" is the user's question phrased as a testable statement, e.g. "Does this entry condition have a positive edge over the holding period?"
- "filters" holds extra variables or regimes the user mentioned (e.g. "high volatility regime", "only Mondays") that aren't the entry condition itself.
- Only put a field in "missing_critical" if it is genuinely unspecified AND needed to make the experiment testable. instrument, entry_condition and objective are almost always required. exit_condition and holding_period are required to eventually run a backtest, but it's fine to leave them null with a clarifying question rather than guessing.
- Never invent a value for something the user didn't say or clearly imply. If a field is missing but not critical (e.g. timeframe when daily is the obvious default for the asset class), leave it null and do NOT add it to missing_critical.
- If the user's latest message answers a question you previously asked, merge it into the right field and drop it from missing_critical.
- If the user explicitly asks you to proceed with reasonable assumptions, you may fill remaining fields, but prefix each assumed value with "Assumed: " so it stays visibly distinct, and remove it from missing_critical.
- Keep every field value short: a phrase or one short sentence.
- Output strictly valid JSON and nothing else.`;

export async function POST(request) {
  try {
    const { messages } = await request.json();

    // Convert message roles if needed (Anthropic -> Gemini format)
    // Gemini expects 'user' or 'model'
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    let response;
    let retries = 3;
    let delay = 1000;
    
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: "application/json",
          }
        });
        break; // Success, exit retry loop
      } catch (err) {
        if (err.status === 503 && retries > 1) {
          console.log(`Gemini API 503 Error. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2; // Exponential backoff
        } else {
          throw err; // Throw if not a 503 or out of retries
        }
      }
    }

    const parsed = JSON.parse(response.text);
    return Response.json(parsed);
  } catch (err) {
    console.error("Gemini API Error:", err);
    return Response.json(
      { error: err.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
