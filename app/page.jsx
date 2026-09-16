"use client";

import { useState, useEffect } from "react";
import ConversationTrail from "../components/ConversationTrail";
import QueryInput from "../components/QueryInput";
import ExperimentTicket from "../components/ExperimentTicket";
import ActionsRow from "../components/ActionsRow";
import PastQueriesLog from "../components/PastQueriesLog";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Replaces the direct Anthropic call with a call to our Next.js API Route
async function askGemini(messages) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error || "API error");
  return data; // Already JSON parsed by the API route
}

export default function TradingResearchAssistant() {
  const [messages, setMessages] = useState([]);
  const [trail, setTrail] = useState([]); // {who:'you'|'assistant', text}
  const [experiment, setExperiment] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pastExperiments, setPastExperiments] = useState([]);
  const [savedThisRound, setSavedThisRound] = useState(false);

  useEffect(() => {
    // Load from localStorage instead of window.storage
    try {
      const keys = Object.keys(window.localStorage).filter(k => k.startsWith("experiments:"));
      const entries = keys.map((k) => {
        try {
          const r = window.localStorage.getItem(k);
          return r ? JSON.parse(r) : null;
        } catch {
          return null;
        }
      });
      setPastExperiments(entries.filter(Boolean).sort((a, b) => b.savedAt - a.savedAt));
    } catch {
      // no saved log yet — fine
    }
  }, []);

  async function runTurn(userText) {
    if (!userText.trim() || loading) return;
    setError(null);
    setLoading(true);
    setSavedThisRound(false);
    const userMsg = { role: "user", content: userText };
    const nextMessages = [...messages, userMsg];
    setTrail((t) => [...t, { who: "you", text: userText }]);
    setInput("");
    try {
      const parsed = await askGemini(nextMessages);
      const assistantMsg = { role: "assistant", content: JSON.stringify(parsed) };
      setMessages([...nextMessages, assistantMsg]);
      setExperiment(parsed);
      if (parsed.missing_critical && parsed.missing_critical.length > 0) {
        setTrail((t) => [
          ...t,
          { who: "assistant", text: parsed.missing_critical[0].question },
        ]);
      } else {
        setTrail((t) => [...t, { who: "assistant", text: "Experiment structured. Nothing critical left unspecified." }]);
      }
    } catch (err) {
      setError(err.message || "Something went wrong reaching the model.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    runTurn(input);
  }

  function handleProceedWithAssumptions() {
    runTurn(
      "Please proceed and fill in the remaining fields using your best reasonable assumptions, clearly marked as assumed."
    );
  }

  function handleExportBacktrader() {
    if (!experiment) return;
    
    const pyCode = `import backtrader as bt
import datetime

# --- AI Generated Experiment Scaffold ---
# Instrument: ${experiment.instrument || 'N/A'}
# Timeframe: ${experiment.timeframe || 'N/A'}
# Entry: ${experiment.entry_condition || 'N/A'}
# Exit: ${experiment.exit_condition || 'N/A'}
# Holding: ${experiment.holding_period || 'N/A'}
# Objective: ${experiment.objective || 'N/A'}

class AIStrategy(bt.Strategy):
    params = (
        ('some_param', 1),
    )

    def __init__(self):
        # Initialize indicators based on the entry condition:
        # ${experiment.entry_condition || 'N/A'}
        self.dataclose = self.datas[0].close
        pass

    def next(self):
        # Check if we are in the market
        if not self.position:
            # Entry logic here
            # AI Note: Implement -> ${experiment.entry_condition || 'N/A'}
            # self.buy()
            pass
        else:
            # Exit logic here
            # AI Note: Implement -> ${experiment.exit_condition || 'N/A'} or holding -> ${experiment.holding_period || 'N/A'}
            # self.sell()
            pass

if __name__ == '__main__':
    cerebro = bt.Cerebro()
    cerebro.addstrategy(AIStrategy)

    # TODO: Add your data feed for ${experiment.instrument || 'N/A'}
    # data = bt.feeds.YahooFinanceData(dataname='...', fromdate=datetime.datetime(2020, 1, 1), todate=datetime.datetime(2023, 1, 1))
    # cerebro.adddata(data)

    cerebro.broker.setcash(100000.0)
    print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())
    cerebro.run()
    print('Final Portfolio Value: %.2f' % cerebro.broker.getvalue())
`;

    const blob = new Blob([pyCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest_${experiment.instrument?.replace(/\s+/g, '_') || 'experiment'}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleSave() {
    if (!experiment) return;
    const id = uid();
    const record = {
      id,
      savedAt: Date.now(),
      originalQuestion: trail.find((t) => t.who === "you")?.text || "",
      experiment,
    };
    try {
      window.localStorage.setItem(`experiments:${id}`, JSON.stringify(record));
      setPastExperiments((p) => [record, ...p]);
      setSavedThisRound(true);
    } catch {
      setError("Could not save to your research log right now.");
    }
  }

  function loadPast(record) {
    setExperiment(record.experiment);
    setTrail([
      { who: "you", text: record.originalQuestion },
      { who: "assistant", text: record.experiment.summary },
    ]);
    setMessages([]);
    setSavedThisRound(true);
  }

  function startOver() {
    setMessages([]);
    setTrail([]);
    setExperiment(null);
    setInput("");
    setError(null);
    setSavedThisRound(false);
  }

  const hasMissing = experiment && experiment.missing_critical && experiment.missing_critical.length > 0;
  const isResolved = experiment && !hasMissing;

  return (
    <div className="app">
      <div className="shell">
        <div className="masthead glass-panel">
          <h1>Research Query Desk</h1>
          <p>
            Ask a market question in plain language. It gets structured into a testable
            experiment — instrument, entry, exit, holding period, filters, and the question
            you're actually asking. Anything critical that's missing gets asked about, not assumed.
          </p>
        </div>

        <ConversationTrail trail={trail} loading={loading} />

        <QueryInput 
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          loading={loading}
          trailLength={trail.length}
        />

        {trail.length === 0 && (
          <div className="hint">Press Enter to submit. Shift+Enter for a new line.</div>
        )}
        {trail.length > 0 && <div className="hint" />}

        {error && <div className="error">{error}</div>}

        {loading && !experiment && (
          <div className="ticket ticket--loading glass-panel">
            Structuring experiment...
          </div>
        )}

        {!experiment && !loading && (
          <div className="empty-state glass-panel">
            Your structured experiment will appear here.
          </div>
        )}

        {experiment && !loading && (
          <>
            <ExperimentTicket experiment={experiment} hasMissing={hasMissing} />

            <ActionsRow 
              hasMissing={hasMissing}
              isResolved={isResolved}
              savedThisRound={savedThisRound}
              loading={loading}
              onProceedWithAssumptions={handleProceedWithAssumptions}
              onSave={handleSave}
              onExport={handleExportBacktrader}
              onStartOver={startOver}
            />
          </>
        )}

        <PastQueriesLog pastExperiments={pastExperiments} onLoadPast={loadPast} />

        <div className="about">
          This prototype only structures the question and flags missing information — it doesn't
          run a backtest or claim any edge. "Structure it" and clarifying answers call an LLM to
          extract fields and decide what's still ambiguous; nothing is assumed silently. Saved
          queries are stored privately to your browser session, not shared.
        </div>
      </div>
    </div>
  );
}
