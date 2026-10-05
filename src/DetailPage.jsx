import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMedicine } from "./api.js";
import { first, joined } from "./MedicineCard.jsx";


const SECTIONS = [
  ["purpose", "Purpose", "info", "💊", "What it's for"],
  ["indications_and_usage", "Uses", "good", "✓", "Conditions it treats"],
  ["dosage_and_administration", "Dosage", "info", "◷", "How much and how often"],
  ["warnings", "Warnings", "danger", "⚠", "Read before taking"],
  ["do_not_use", "Do not use", "stop", "✕", "When to avoid it"],
  ["ask_doctor", "Ask a doctor", "caution", "?", "Check first if this applies to you"],
  ["adverse_reactions", "Side effects", "side", "!", "What you might feel"],
  ["storage_and_handling", "Storage", "neutral", "⌂", "How to keep it"],
];

const OPENFDA_LABELS = {
  manufacturer_name: "Manufacturer",
  product_type: "Product type",
  route: "Route",
  substance_name: "Substance",
  pharm_class_epc: "Pharmacologic class",
  application_number: "Application number",
};

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", item: null });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", item: null });
    getMedicine(id, controller.signal)
      .then((item) => setState({ status: item ? "done" : "notfound", item }))
      .catch((err) => {
        if (err.name !== "AbortError") setState({ status: "error", item: null });
      });
    return () => controller.abort();
  }, [id]);

  
  const goBack = (e) => {
    if (window.history.state?.idx > 0) {
      e.preventDefault();
      navigate(-1);
    }
  };

  const { status, item } = state;
  const o = item?.openfda || {};
  const name = first(o.brand_name) || "Unnamed medicine";

  return (
    <>
      <Link to="/" onClick={goBack} className="back">
        ← Back to results
      </Link>

      {status === "loading" && (
        <div className="msg">
          <div className="spinner" />
          Loading…
        </div>
      )}
      {status === "error" && (
        <p className="msg error">
          <span className="big">⚠️</span>
          Could not load this medicine. Try refreshing.
        </p>
      )}
      {status === "notfound" && (
        <p className="msg">
          <span className="big">🔎</span>
          Medicine not found.
        </p>
      )}

      {status === "done" && (
        <>
          <div className="detail-head">
            <div className="avatar">{name[0].toUpperCase()}</div>
            <div>
              <h1>{name}</h1>
              {joined(o.generic_name) && <p>{joined(o.generic_name)}</p>}
            </div>
          </div>

          <dl className="details">
            {Object.entries(OPENFDA_LABELS)
              .filter(([key]) => joined(o[key]))
              .map(([key, label]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{joined(o[key])}</dd>
                </div>
              ))}
          </dl>

          {SECTIONS.filter(([key]) => first(item[key])).map(([key, label, tone, icon, hint]) => (
  <section key={key} className={`section ${tone}`}>
    <h2>
      <span className="icon">{icon}</span> {label}
      <small className="hint">{hint}</small>
    </h2>
    <p>{first(item[key])}</p>
  </section>
))}
        </>
      )}
    </>
  );
}