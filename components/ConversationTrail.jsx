import { useEffect, useRef } from "react";

export default function ConversationTrail({ trail, loading }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [trail, loading]);

  if (trail.length === 0) return null;

  return (
    <div className="trail" ref={scrollRef}>
      {trail.map((t, i) => (
        <div key={i} className={`trail-item trail-item--${t.who}`}>
          <span className="trail-who">{t.who === "you" ? "you" : "desk"}</span>
          {t.text}
        </div>
      ))}
      {loading && (
        <div className="trail-item trail-item--assistant">
          <span className="trail-who">desk</span>reading the question…
        </div>
      )}
    </div>
  );
}
