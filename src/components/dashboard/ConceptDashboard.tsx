import { useEffect, useState } from "react";
import { BookOpenCheck, Brain, CircleAlert, Pencil, Plus, Sparkles, Target, Trash2 } from "lucide-react";
import { ConceptForm } from "@/components/dashboard/ConceptForm";
import { ReviewPanel } from "@/components/dashboard/ReviewPanel";
import { DOMAIN_LABELS } from "@/lib/domain-labels";
import type { Concept, ConceptDomain, DashboardData, ReviewOutcome } from "@/types";

interface ErrorPayload {
  error?: { message?: string };
}

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload: unknown = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const message = (payload as ErrorPayload | null)?.error?.message ?? "Wystąpił nieoczekiwany błąd";
    throw new Error(message);
  }
  return payload as T;
}

async function fetchDashboard() {
  return requestJson<DashboardData>("/api/dashboard");
}

export default function ConceptDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingConcept, setEditingConcept] = useState<Concept | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Nie udało się wczytać dashboardu");
      });
    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    const data = await fetchDashboard();
    setDashboard(data);
  }

  async function runAction(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Nie udało się wykonać operacji");
    } finally {
      setBusy(false);
    }
  }

  async function loadStarterPack() {
    await runAction(async () => {
      await requestJson("/api/starter-pack", { method: "POST" });
      await refresh();
    });
  }

  async function saveConcept(input: {
    title: string;
    domain: ConceptDomain;
    description: string;
    checkQuestion: string;
    answerPattern: string;
  }) {
    await runAction(async () => {
      const path = editingConcept ? `/api/concepts/${editingConcept.id}` : "/api/concepts";
      await requestJson(path, {
        method: editingConcept ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      setEditingConcept(undefined);
      await refresh();
    });
  }

  async function deleteConcept(concept: Concept) {
    if (!window.confirm(`Usunąć „${concept.title}” wraz z historią powtórek?`)) return;
    await runAction(async () => {
      await requestJson(`/api/concepts/${concept.id}`, { method: "DELETE" });
      if (selectedId === concept.id) setSelectedId(null);
      await refresh();
    });
  }

  async function submitReview(conceptId: string, confidence: number, outcome: ReviewOutcome) {
    await runAction(async () => {
      await requestJson(`/api/concepts/${conceptId}/reviews`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confidence, outcome }),
      });
      setSelectedId(null);
      await refresh();
    });
  }

  if (!dashboard && !error) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10" aria-live="polite">
        <div className="animate-pulse space-y-5">
          <div className="h-10 w-72 rounded bg-slate-200" />
          <div className="h-52 rounded-3xl bg-slate-200" />
        </div>
        <span className="sr-only">Wczytuję Twoją naukę…</span>
      </main>
    );
  }

  const activeConcept =
    dashboard?.concepts.find((concept) => concept.id === selectedId) ?? dashboard?.recommendation ?? null;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-black tracking-[0.14em] text-cyan-700 uppercase">Twój kompas</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Co warto powtórzyć teraz?</h1>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setEditingConcept(null);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" /> Dodaj pojęcie
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900"
        >
          <CircleAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-bold">Nie udało się</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {dashboard?.totalConcepts === 0 ? (
        <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-14">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-cyan-100 text-cyan-800">
            <Sparkles className="size-8" />
          </div>
          <h2 className="mt-5 text-2xl font-black">Zacznij od sprawdzonego pakietu</h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
            Dodaj 10 autorskich pojęć opartych na oficjalnym blueprintcie AWS AIF-C01 v1.1. Operacja jest idempotentna.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={loadStarterPack}
            className="mt-7 rounded-xl bg-cyan-600 px-6 py-3.5 font-bold text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {busy ? "Ładuję pakiet…" : "Załaduj pakiet startowy"}
          </button>
        </section>
      ) : dashboard ? (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Podsumowanie nauki">
            <Metric
              icon={<Brain className="size-5" />}
              label="Średnie mastery"
              value={`${Math.round(dashboard.averageMastery)}%`}
            />
            <Metric icon={<Target className="size-5" />} label="Do powtórki" value={String(dashboard.dueCount)} />
            <Metric
              icon={<BookOpenCheck className="size-5" />}
              label="Pojęcia"
              value={String(dashboard.totalConcepts)}
            />
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
            {activeConcept && (
              <ReviewPanel
                key={`${activeConcept.id}-${activeConcept.latestAttempt?.id ?? "new"}`}
                concept={activeConcept}
                busy={busy}
                onSubmit={(confidence, outcome) => submitReview(activeConcept.id, confidence, outcome)}
              />
            )}

            <section
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              aria-labelledby="domain-title"
            >
              <h2 id="domain-title" className="text-lg font-black">
                Postęp domen AWS
              </h2>
              <div className="mt-5 space-y-5">
                {dashboard.domainProgress.map((domain) => (
                  <div key={domain.domain}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-slate-700">{domain.label}</span>
                      <span className="font-bold">{Math.round(domain.mastery)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-cyan-500" style={{ width: `${domain.mastery}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section
            className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-labelledby="concept-list-title"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="concept-list-title" className="text-xl font-black">
                Wszystkie pojęcia
              </h2>
              <span className="text-sm text-slate-500">Wybierz temat do powtórki</span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {dashboard.concepts.map((concept) => (
                <article
                  key={concept.id}
                  className={`rounded-2xl border p-4 transition ${activeConcept?.id === concept.id ? "border-cyan-400 bg-cyan-50/60" : "border-slate-200"}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(concept.id);
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-slate-950">{concept.title}</h3>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                        {Math.round(concept.currentPriority)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-cyan-800">{DOMAIN_LABELS[concept.domain]}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{concept.description}</p>
                  </button>
                  <div className="mt-3 flex justify-end gap-1 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setEditingConcept(concept);
                      }}
                      aria-label={`Edytuj ${concept.title}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => deleteConcept(concept)}
                      aria-label={`Usuń ${concept.title}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {editingConcept !== undefined && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="concept-form-title"
        >
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 id="concept-form-title" className="text-2xl font-black">
              {editingConcept ? "Edytuj pojęcie" : "Dodaj własne pojęcie"}
            </h2>
            <p className="mt-2 mb-6 text-sm text-slate-600">Pola pomagają przygotować krótką, samodzielną powtórkę.</p>
            <ConceptForm
              key={editingConcept?.id ?? "new"}
              concept={editingConcept ?? undefined}
              busy={busy}
              onCancel={() => {
                setEditingConcept(undefined);
              }}
              onSubmit={saveConcept}
            />
          </div>
        </div>
      )}
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      aria-label={`${label}: ${value}`}
      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="grid size-11 place-items-center rounded-xl bg-cyan-100 text-cyan-800">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}
