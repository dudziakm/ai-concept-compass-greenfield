create index if not exists concepts_template_id_idx
  on public.concepts(template_id);

create index if not exists review_attempts_concept_id_idx
  on public.review_attempts(concept_id);
