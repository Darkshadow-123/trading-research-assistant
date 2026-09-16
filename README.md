# AI Trading Research Assistant

This is a functional mini-prototype of an AI-native trading research platform. The goal of this application is to allow a user to ask market-related questions in natural language, which the system then extracts, structures into a testable experiment, and identifies any missing critical information to prevent assumptions.

## Architecture
The application is built using a modern **Next.js App Router** architecture. It consists of a unified React frontend and a secure serverless backend route for interacting with the AI model. 

The core interaction loop relies on an **Atomic LLM Strategy**:
Instead of bolting a parsing layer on top of a generic conversational chatbot, the system uses a single LLM call to simultaneously comprehend the user's query, structure the known fields, and detect ambiguities. By using structured JSON output, we keep "understand" and "detect missing fields" in one robust step. The conversation history is passed back in standard chat format to easily allow the model to refine the structured experiment over multiple interactions.

## Technologies Used
- **Next.js (App Router)**: Provides the robust React framework and serverless API routes.
- **JavaScript**: Kept the prototype lightweight and accessible.
- **Gemini API (gemini-2.5-flash)**: Used as the core intelligence engine via the official `@google/genai` SDK to reliably extract structured variables.
- **Vanilla CSS (Glassmorphism)**: Developed a modern, translucent "Glassmorphism" UI using pure CSS custom variables. It relies on layered blurs, ambient state-driven glows, and responsive typography rather than bloated component libraries.
- **Modular React Architecture**: The UI is broken down into clean, single-responsibility components (`FieldRow`, `ExperimentTicket`, `ConversationTrail`, etc.) to ensure maintainability.
- **localStorage**: Used for a lightweight, client-side persistence of the user's research log, eliminating the need for a full database setup for this mini-prototype.

## AI Tools Used
- **Google Gemini (Agentic AI Assistant)**: Used to rapidly scaffold the Next.js project, refactor a single-file prototype into a full-stack Next.js app, securely integrate the Gemini API on the backend, and write comprehensive documentation. 
- **Personal Design**: Designed the atomic LLM system prompt for structured extraction without assumptions, the custom vanilla CSS aesthetic, and the overall Next.js architecture logic.
- **AI Refinement**: Used the AI to convert the Anthropic `fetch` call to a structured `@google/genai` SDK backend route, implement `localStorage`, and generate the dynamic Python script for the Bonus feature.

## Key Decisions
1. **Server-Side API Route**: Instead of calling the LLM directly from the client (which exposes the API key), I utilized Next.js API Routes to proxy the Gemini call securely on the backend.
2. **Atomic JSON Extraction**: By forcing the LLM to reply strictly in a JSON schema (with `missing_critical` arrays), the UI can cleanly map the status of each required field without needing complex regex or manual parsing.
3. **No Silent Assumptions**: The LLM prompt strictly forbids inventing values. If a timeframe isn't stated, it gets flagged. This is critical for trading logic where assumptions can be costly.

## Bonus: Backtrader Export Feature
As a bonus, I implemented an **Export to Python Backtrader** feature. Once an experiment is fully resolved (no missing critical information), the user can click a button to generate and download a `.py` file. This file contains a scaffolded Python script for the widely-used `backtrader` framework, pre-filled with the exact instrument, timeframe, and logic parameters defined by the AI structure. This demonstrates the end-to-end vision: from natural language directly into testable quantitative code.

## What I Would Improve With More Time
- **Database & Auth**: Replace `localStorage` with a robust backend (e.g., PostgreSQL / Supabase) and add user authentication to track research logs across devices.
- **Live Market Data**: Integrate with Yahoo Finance or Alpaca APIs to actually fetch historical data and instantly run the backtest in the cloud when the experiment is ready.
- **State Management**: Utilize Redux or React Context if the platform scales to include charting, data visualization, and multiple active agent conversations simultaneously.

---
### Running Locally
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env.local` file in the root directory and add your Gemini API Key: `GEMINI_API_KEY=your_key_here`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.
