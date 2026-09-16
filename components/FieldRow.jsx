export default function FieldRow({ label, value, isMissing, question }) {
  let status = "filled";
  let display = value;
  if (isMissing) {
    status = "missing";
    display = "Not specified";
  } else if (value == null || (Array.isArray(value) && value.length === 0)) {
    status = "empty";
    display = "Not specified";
  } else if (typeof value === "string" && value.startsWith("Assumed: ")) {
    status = "assumed";
    display = value.replace("Assumed: ", "");
  } else if (Array.isArray(value)) {
    display = value.join(", ");
  }

  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      <div className={`field-value field-value--${status}`}>
        {display}
        {status === "assumed" && <span className="tag tag--assumed">assumed</span>}
      </div>
      {isMissing && question && <div className="field-question">{question}</div>}
    </div>
  );
}
