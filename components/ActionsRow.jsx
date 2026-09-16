export default function ActionsRow({
  hasMissing,
  isResolved,
  savedThisRound,
  loading,
  onProceedWithAssumptions,
  onSave,
  onExport,
  onStartOver
}) {
  return (
    <div className="actions">
      {hasMissing && (
        <button className="btn-secondary" onClick={onProceedWithAssumptions} disabled={loading}>
          Proceed with best-guess assumptions
        </button>
      )}
      {isResolved && !savedThisRound && (
        <button className="btn-secondary" onClick={onSave}>
          Save to research log
        </button>
      )}
      {isResolved && (
        <button className="btn-secondary" onClick={onExport} title="Bonus Feature: Export scaffold script">
          Export to Python Backtrader
        </button>
      )}
      {isResolved && savedThisRound && (
        <span className="saved-note">Saved.</span>
      )}
      <button className="btn-ghost" onClick={onStartOver}>
        Start a new question
      </button>
    </div>
  );
}
