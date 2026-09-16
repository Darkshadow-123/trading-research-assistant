import FieldRow from "./FieldRow";

const FIELD_ORDER = [
  ["instrument", "Instrument"],
  ["timeframe", "Timeframe"],
  ["entry_condition", "Entry condition"],
  ["filters", "Filters / variables"],
  ["exit_condition", "Exit condition"],
  ["holding_period", "Holding period"],
  ["objective", "Question being tested"],
];

export default function ExperimentTicket({ experiment, hasMissing }) {
  if (!experiment) return null;
  
  return (
    <div className={`ticket glass-panel ticket--${hasMissing ? "open" : "resolved"}`}>
      <div className="ticket-header">
        <h2>Experiment</h2>
        <span className={`ticket-status ticket-status--${hasMissing ? "open" : "closed"}`}>
          {hasMissing ? "needs input" : "ready"}
        </span>
      </div>
      <p className="summary-line">{experiment.summary}</p>
      {FIELD_ORDER.map(([key, label]) => {
        const missingEntry = (experiment.missing_critical || []).find((m) => m.field === key);
        return (
          <FieldRow
            key={key}
            label={label}
            value={experiment[key]}
            isMissing={!!missingEntry}
            question={missingEntry?.question}
          />
        );
      })}
    </div>
  );
}
