create table public.concept_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  domain text not null check (domain in (
    'ai-ml-fundamentals',
    'generative-ai-fundamentals',
    'foundation-model-applications',
    'responsible-ai',
    'security-compliance-governance'
  )),
  description text not null,
  check_question text not null,
  answer_pattern text not null,
  source_url text not null,
  blueprint_version text not null,
  created_at timestamptz not null default now()
);

create table public.concepts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.concept_templates(id) on delete set null,
  title text not null check (char_length(title) between 2 and 120),
  domain text not null check (domain in (
    'ai-ml-fundamentals',
    'generative-ai-fundamentals',
    'foundation-model-applications',
    'responsible-ai',
    'security-compliance-governance'
  )),
  description text not null,
  check_question text not null,
  answer_pattern text not null,
  source_url text,
  blueprint_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, template_id)
);

create index concepts_user_id_idx on public.concepts(user_id);

create table public.review_attempts (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null references public.concepts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  confidence smallint not null check (confidence between 1 and 5),
  outcome text not null check (outcome in ('incorrect', 'partial', 'correct')),
  mastery numeric(5,2) not null check (mastery between 0 and 100),
  calibration_gap numeric(5,2) not null check (calibration_gap between 0 and 100),
  priority numeric(5,2) not null check (priority between 0 and 100),
  next_review_at timestamptz not null,
  reviewed_at timestamptz not null default now()
);

create index review_attempts_user_concept_reviewed_idx
  on public.review_attempts(user_id, concept_id, reviewed_at desc);
create index review_attempts_user_due_idx
  on public.review_attempts(user_id, next_review_at);

alter table public.concept_templates enable row level security;
alter table public.concepts enable row level security;
alter table public.review_attempts enable row level security;

create policy "authenticated users read templates"
  on public.concept_templates for select
  to authenticated
  using (true);

create policy "users read own concepts"
  on public.concepts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users insert own concepts"
  on public.concepts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users update own concepts"
  on public.concepts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users delete own concepts"
  on public.concepts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users read own attempts"
  on public.review_attempts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users insert own attempts for own concepts"
  on public.review_attempts for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.concepts
      where concepts.id = review_attempts.concept_id
        and concepts.user_id = (select auth.uid())
    )
  );

insert into public.concept_templates
  (id, title, domain, description, check_question, answer_pattern, source_url, blueprint_version)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'AI, ML, deep learning i generative AI',
    'ai-ml-fundamentals',
    'Relacje między sztuczną inteligencją, uczeniem maszynowym, deep learningiem, generative AI i systemami agentowymi.',
    'Jak ułożyć te pojęcia od najszerszego do najbardziej wyspecjalizowanego i czym wyróżnia się agentic AI?',
    'AI jest pojęciem najszerszym; ML uczy wzorców z danych, deep learning korzysta z wielowarstwowych sieci, GenAI tworzy nowe treści, a agentic AI planuje działania i używa narzędzi do realizacji celu.',
    'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    'AIF-C01 v1.1'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Trening, inferencja i dane',
    'ai-ml-fundamentals',
    'Trening dopasowuje parametry modelu na danych, a inferencja wykorzystuje gotowy model do nowych predykcji.',
    'Czym różnią się trening i inferencja oraz kiedy znaczenie mają dane ustrukturyzowane, nieustrukturyzowane i etykietowane?',
    'Trening jest etapem uczenia parametrów; inferencja jest zastosowaniem modelu. Rodzaj i jakość danych decydują o możliwej technice uczenia i wiarygodności wyniku.',
    'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    'AIF-C01 v1.1'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Tokeny, okno kontekstu i chunking',
    'generative-ai-fundamentals',
    'Model przetwarza tokeny w ograniczonym oknie kontekstu; chunking dzieli źródła na fragmenty możliwe do wyszukania i przekazania modelowi.',
    'Dlaczego rozmiar i sposób nakładania chunków wpływa na koszt oraz jakość odpowiedzi?',
    'Małe fragmenty zwiększają precyzję, lecz mogą tracić kontekst; duże zachowują kontekst, ale zużywają więcej tokenów i mogą obniżyć trafność wyszukiwania.',
    'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    'AIF-C01 v1.1'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Embeddings, wyszukiwanie wektorowe i RAG',
    'foundation-model-applications',
    'Embedding reprezentuje znaczenie jako wektor, wyszukiwanie wektorowe znajduje podobne fragmenty, a RAG przekazuje je modelowi jako kontekst.',
    'Jak dane źródłowe przechodzą przez pipeline RAG od indeksowania do wygenerowania odpowiedzi?',
    'Dokumenty są dzielone i zamieniane na embeddingi, zapisane w indeksie, wyszukane przez podobieństwo do pytania, a trafne fragmenty dołączone do promptu modelu.',
    'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    'AIF-C01 v1.1'
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Cykl życia foundation modelu',
    'generative-ai-fundamentals',
    'Foundation model przechodzi od pozyskania danych i pretrainingu przez adaptację, ewaluację, wdrożenie i monitoring.',
    'Które etapy cyklu życia foundation modelu należą do twórcy modelu, a które zwykle do zespołu budującego aplikację?',
    'Twórca odpowiada głównie za dane bazowe i pretraining; zespół aplikacji wybiera model, adaptuje go, ewaluuje w kontekście zadania, wdraża i monitoruje.',
    'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    'AIF-C01 v1.1'
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    'Techniki prompt engineering',
    'foundation-model-applications',
    'Instrukcja, kontekst, przykłady i format wyjścia sterują zachowaniem modelu bez zmiany jego parametrów.',
    'Kiedy użyć zero-shot, few-shot i szablonu z wyraźnymi ograniczeniami odpowiedzi?',
    'Zero-shot wystarcza dla prostego znanego zadania, few-shot pomaga odwzorować oczekiwany wzorzec, a ograniczenia i format są potrzebne do przewidywalnego użycia wyniku przez aplikację.',
    'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    'AIF-C01 v1.1'
  ),
  (
    '10000000-0000-4000-8000-000000000007',
    'Pretraining, fine-tuning i RAG',
    'foundation-model-applications',
    'Pretraining buduje ogólne zdolności modelu, fine-tuning zmienia jego zachowanie, a RAG dostarcza aktualny kontekst bez zmiany wag.',
    'Jak wybrać między fine-tuningiem a RAG dla wiedzy, która często się zmienia?',
    'RAG jest zwykle lepszy dla zmiennej i cytowalnej wiedzy; fine-tuning służy częściej dostosowaniu zachowania, stylu lub stabilnego zadania i wymaga ponownego treningu przy zmianach.',
    'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    'AIF-C01 v1.1'
  ),
  (
    '10000000-0000-4000-8000-000000000008',
    'Ewaluacja modeli i aplikacji GenAI',
    'foundation-model-applications',
    'Jakość rozwiązania GenAI wymaga metryk technicznych, oceny człowieka, testów bezpieczeństwa oraz obserwacji kosztu i opóźnienia.',
    'Dlaczego sama metryka podobieństwa tekstowego nie wystarcza do oceny aplikacji GenAI?',
    'Nie mierzy pełnej poprawności, użyteczności, halucynacji ani bezpieczeństwa. Potrzebny jest zestaw dopasowany do zadania, dane referencyjne i ocena człowieka.',
    'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    'AIF-C01 v1.1'
  ),
  (
    '10000000-0000-4000-8000-000000000009',
    'Bias, fairness, transparency i explainability',
    'responsible-ai',
    'Odpowiedzialne AI łączy badanie nierównego wpływu, przejrzystość procesu i możliwość wyjaśnienia wyników interesariuszom.',
    'Jak bias w danych może przełożyć się na niesprawiedliwy wynik i jak go wykrywać?',
    'Dane mogą niedostatecznie reprezentować grupy lub utrwalać historyczne decyzje. Wyniki trzeba mierzyć osobno dla właściwych grup, dokumentować ograniczenia i monitorować po wdrożeniu.',
    'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    'AIF-C01 v1.1'
  ),
  (
    '10000000-0000-4000-8000-000000000010',
    'IAM, prywatność, governance i shared responsibility',
    'security-compliance-governance',
    'Bezpieczne rozwiązanie AI stosuje najmniejsze uprawnienia, ochronę danych, audyt, kontrolę użycia i właściwy podział odpowiedzialności z dostawcą chmury.',
    'Które obowiązki pozostają po stronie klienta podczas korzystania z zarządzanej usługi AI w AWS?',
    'Klient nadal odpowiada między innymi za tożsamości i uprawnienia, klasyfikację i legalność danych, konfigurację, szyfrowanie w swoim zakresie, monitoring użycia oraz bezpieczną aplikację.',
    'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    'AIF-C01 v1.1'
  )
on conflict (id) do update set
  title = excluded.title,
  domain = excluded.domain,
  description = excluded.description,
  check_question = excluded.check_question,
  answer_pattern = excluded.answer_pattern,
  source_url = excluded.source_url,
  blueprint_version = excluded.blueprint_version;
