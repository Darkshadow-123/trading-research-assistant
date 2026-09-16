export default function PastQueriesLog({ pastExperiments, onLoadPast }) {
  return (
    <div className="log">
      <h3>Past queries</h3>
      {pastExperiments.length === 0 ? (
        <div className="empty-log">Nothing saved yet — resolved experiments will show up here.</div>
      ) : (
        pastExperiments.map((r) => (
          <div className="log-item glass-panel" key={r.id} onClick={() => onLoadPast(r)}>
            <span className="log-q">{r.originalQuestion}</span>
            <span className="log-date">
              {new Date(r.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
