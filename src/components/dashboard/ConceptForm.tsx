import { useState } from "react";
import { DOMAIN_LABELS } from "@/lib/domain-labels";
import { CONCEPT_DOMAINS, type Concept, type ConceptDomain } from "@/types";

interface Props {
  concept?: Concept;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (input: {
    title: string;
    domain: ConceptDomain;
    description: string;
    checkQuestion: string;
    answerPattern: string;
  }) => Promise<void>;
}

export function ConceptForm({ concept, busy, onCancel, onSubmit }: Props) {
  const [title, setTitle] = useState(concept?.title ?? "");
  const [domain, setDomain] = useState<ConceptDomain>(concept?.domain ?? CONCEPT_DOMAINS[0]);
  const [description, setDescription] = useState(concept?.description ?? "");
  const [checkQuestion, setCheckQuestion] = useState(concept?.check_question ?? "");
  const [answerPattern, setAnswerPattern] = useState(concept?.answer_pattern ?? "");

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ title, domain, description, checkQuestion, answerPattern });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label={concept ? "Edytuj pojęcie" : "Dodaj pojęcie"}>
      <label className="block text-sm font-semibold text-slate-700">
        Nazwa pojęcia
        <input
          required
          minLength={2}
          maxLength={120}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
        />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Domena
        <select
          value={domain}
          onChange={(event) => {
            setDomain(event.target.value as ConceptDomain);
          }}
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-600"
        >
          {CONCEPT_DOMAINS.map((item) => (
            <option key={item} value={item}>
              {DOMAIN_LABELS[item]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Krótkie wyjaśnienie
        <textarea
          required
          minLength={10}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-600"
        />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Pytanie kontrolne
        <textarea
          required
          minLength={5}
          value={checkQuestion}
          onChange={(event) => {
            setCheckQuestion(event.target.value);
          }}
          rows={2}
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-600"
        />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Wzorzec odpowiedzi
        <textarea
          required
          minLength={5}
          value={answerPattern}
          onChange={(event) => {
            setAnswerPattern(event.target.value);
          }}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-600"
        />
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-100"
        >
          Anuluj
        </button>
        <button
          disabled={busy}
          className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {busy ? "Zapisuję…" : concept ? "Zapisz zmiany" : "Dodaj pojęcie"}
        </button>
      </div>
    </form>
  );
}
