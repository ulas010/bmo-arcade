import { useEffect, useState } from "react";

const TYPE_SPEED_MS = 22;

export default function DialogBox({ text, hint, highlight }) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    setTyped("");
    const timer = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, TYPE_SPEED_MS);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <section className="dialog">
      <span className="dialog-tag" aria-hidden="true">BMO</span>
      <p className="dialog-text" aria-hidden="true">{typed}</p>
      <p className="visually-hidden" role="status">{text}</p>
      <p className={`dialog-hint${highlight ? " is-visible" : ""}`}>{hint}</p>
    </section>
  );
}
