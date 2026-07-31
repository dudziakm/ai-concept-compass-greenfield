import { useState } from "react";
import type { ConceptWithProgress, ReviewOutcome } from "@/types";

interface Props {
  concept: ConceptWithProgress;
  busy: boolean;
  onSubmit: (confidence: number, outcome: ReviewOutcome) => Promise<void>;
}

const OUTCOMES: { value: ReviewOutcome; label: string; className: string }[] = [
  { value: "incorrect", label: "Błędnie", className: "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100" },
  { value: "partial", label: "Częściowo", className: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100" },
  {
    value: "correct",
    label: "Poprawnie",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  },
];

export function ReviewPanel({ concept, busy, onSubmit }: Props) {
  const [confidence, setConfidence] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <section
      aria-labelledby="review-title"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-cyan-700 uppercase">Powtórka</p>
          <h2 id="review-title" className="mt-2 text-2xl font-black text-slate-950">
            {concept.title}
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
          Priorytet {Math.round(concept.currentPriority)}
        </span>
      </div>

      <p className="mt-6 text-lg leading-8 text-slate-700">{concept.check_question}</p>

      <fieldset className="mt-7">
        <legend className="text-sm font-bold text-slate-700">Jak pewnie potrafisz odpowiedzieć?</legend>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={confidence === value}
              onClick={() => {
                setConfidence(value);
              }}
              className={`rounded-xl border py-3 font-black transition ${confidence === value ? "border-cyan-700 bg-cyan-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-400"}`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Zupełnie niepewnie</span>
          <span>Bardzo pewnie</span>
        </div>
      </fieldset>

      {!revealed ? (
        <button
          type="button"
          disabled={confidence === null}
          onClick={() => {
            setRevealed(true);
          }}
          className="mt-7 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pokaż wzorzec odpowiedzi
        </button>
      ) : (
        <div className="mt-7">
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
            <p className="text-xs font-black tracking-[0.14em] text-cyan-800 uppercase">Wzorzec odpowiedzi</p>
            <p className="mt-2 leading-7 text-slate-800">{concept.answer_pattern}</p>
          </div>
          <p className="mt-5 text-sm font-bold text-slate-700">Jak oceniasz swoją odpowiedź?</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {OUTCOMES.map((outcome) => (
              <button
                key={outcome.value}
                type="button"
                disabled={busy || confidence === null}
                onClick={() => confidence !== null && onSubmit(confidence, outcome.value)}
                className={`rounded-xl border px-4 py-3 font-bold transition disabled:opacity-50 ${outcome.className}`}
              >
                {busy ? "Zapisuję…" : outcome.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
