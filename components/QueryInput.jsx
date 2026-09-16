export default function QueryInput({ input, setInput, handleSubmit, loading, trailLength }) {
  return (
    <form className="query" onSubmit={handleSubmit}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          trailLength === 0
            ? "e.g. Does buying NIFTY after a 1% fall work better during high-volatility periods?"
            : "Answer the question above, or add more detail…"
        }
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <button type="submit" disabled={loading || !input.trim()}>
        {trailLength === 0 ? "Structure it" : "Send"}
      </button>
    </form>
  );
}
