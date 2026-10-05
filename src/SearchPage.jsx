import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMedicines } from "./api.js";
import useDebounce from "./useDebounce.js";
import MedicineCard from "./MedicineCard.jsx";

const QUICK_PICKS = ["Advil", "Tylenol", "Benadryl", "Claritin", "Zyrtec", "Motrin"];

const FACTS = [
  { big: "Official", small: "Data comes from FDA drug labels" },
  { big: "Free", small: "No sign-up, no ads, no tracking" },
  { big: "Fast", small: "Results appear as you type" },
];

const FEATURES = [
  {
    tone: "good",
    title: "Uses",
    text: "What the medicine is meant to treat or relieve.",
  },
  {
    tone: "info",
    title: "Dosage",
    text: "How much to take, and how often.",
  },
  {
    tone: "danger",
    title: "Warnings",
    text: "Risks to read about before you take it.",
  },
  {
    tone: "caution",
    title: "Ask a doctor",
    text: "Situations where you should check first.",
  },
];

const STEPS = [
  {
    title: "Type a brand name",
    text: "Start typing and we search automatically after a short pause.",
  },
  {
    title: "Scan the results",
    text: "Each card shows the generic name, maker, type and route at a glance.",
  },
  {
    title: "Open for details",
    text: "Click a card to read the full label, colour-coded by topic.",
  },
];

const TIPS = [
  {
    title: "Check the generic name",
    text: "Two brands can contain the same active ingredient. Taking both can mean a double dose.",
  },
  {
    title: "Read the warnings first",
    text: "The red and amber sections tell you when not to use a medicine or when to ask a doctor.",
  },
  {
    title: "Look at the route",
    text: "Oral, topical and injectable products are not interchangeable, even with the same name.",
  },
];

const FAQ = [
  {
    q: "Why can't I search by generic name?",
    a: "This app searches the brand name field of the FDA database. Try 'Advil' rather than 'ibuprofen'. The generic name is shown on every result.",
  },
  {
    q: "Where does the information come from?",
    a: "From openFDA, the U.S. Food and Drug Administration's public drug label data. It is the same text printed on the package insert.",
  },
  {
    q: "Is this medical advice?",
    a: "No. It is a quick way to read label information. For decisions about your health, talk to a doctor or pharmacist.",
  },
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState(params.get("q") || "");
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({
    status: "idle",
    results: [],
  });

  const debounced = useDebounce(input.trim());

  useEffect(() => {
    setParams(
      debounced ? { q: debounced } : {},
      { replace: true }
    );

    if (!debounced) {
      setState({
        status: "idle",
        results: [],
      });
      return;
    }

    const controller = new AbortController();

    setState((s) => ({
      ...s,
      status: "loading",
    }));

    searchMedicines(debounced, controller.signal)
      .then((results) =>
        setState({
          status: "done",
          results,
        })
      )
      .catch((err) => {
        if (err.name !== "AbortError") {
          setState({
            status: "error",
            results: [],
          });
        }
      });

    return () => controller.abort();
  }, [debounced, retry]);

  const { status, results } = state;

  return (
    <>
      <header className="hero">
        <span className="pill">Free medicine label lookup</span>

        <h1>
          Know what's in your medicine{" "}
          <em>before you take it.</em>
        </h1>

        <p>
          Search by brand name and get the uses, dosage, warnings and
          side effects from the official label, laid out so it's easy
          to read.
        </p>

        <div className="search-box">
          <input
            type="search"
            className="search"
            placeholder="Try Advil, Tylenol, Benadryl…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </div>

        <div className="quick">
          <span>Popular:</span>

          {QUICK_PICKS.map((name) => (
            <button
              key={name}
              onClick={() => setInput(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </header>

      {status === "idle" && (
        <>
          <div className="facts">
            {FACTS.map((f) => (
              <div key={f.big}>
                <strong>{f.big}</strong>
                <span>{f.small}</span>
              </div>
            ))}
          </div>

          <section className="block">
            <h2 className="block-title">
              What you'll see on every medicine
            </h2>

            <p className="block-sub">
              Labels are long and packed with small print. We pull out
              the parts that matter and give each one its own colour.
            </p>

            <div className="features">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className={`feature ${f.tone}`}
                >
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="block">
            <h2 className="block-title">
              How it works
            </h2>

            <div className="steps">
              {STEPS.map((s, i) => (
                <div
                  key={s.title}
                  className="step"
                >
                  <span className="step-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3>{s.title}</h3>

                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="block tips">
            <div>
              <h2 className="block-title">
                Reading a label safely
              </h2>

              <p className="block-sub">
                A few habits that help, whatever you're taking.
              </p>
            </div>

            <ul>
              {TIPS.map((t) => (
                <li key={t.title}>
                  <strong>{t.title}</strong>
                  <span>{t.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="block">
            <h2 className="block-title">
              Common questions
            </h2>

            <div className="faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </>
      )}

      {status === "loading" && (
        <div className="msg">
          <div className="spinner" />
          Searching the FDA database for “{debounced}”…
        </div>
      )}

      {status === "error" && (
        <p className="msg error">
          We couldn't reach the FDA service. Check your connection
          and try again.

          <button
            onClick={() => setRetry((n) => n + 1)}
          >
            Retry
          </button>
        </p>
      )}

      {status === "done" && results.length === 0 && (
        <p className="msg">
          No results found for “{debounced}”.
          <br />
          Check the spelling, or try the brand name instead of the
          generic one.
        </p>
      )}

      {status === "done" && results.length > 0 && (
        <>
          <div className="results-head">
            <h2>
              {results.length}{" "}
              {results.length === 1 ? "result" : "results"}{" "}
              for “{debounced}”
            </h2>

            <p>
              Click any card to see the full label.
            </p>
          </div>

          <div className="grid">
            {results.map((r) => (
              <MedicineCard
                key={r.id}
                item={r}
              />
            ))}
          </div>
        </>
      )}

      <footer className="footer">
        Data from openFDA. For information only, not a substitute
        for advice from a doctor or pharmacist.
      </footer>
    </>
  );
}