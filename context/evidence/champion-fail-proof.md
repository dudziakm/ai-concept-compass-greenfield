# Controlled rejected-PR fixture

This file exists only to prove that the AI review gate rejects a risky change.
The pull request must be closed without merging.

Proposed runtime change:

```ts
export function calculateDiscount(total: number): number {
  if (total > 1_000) return total * 0.2;
  return 0;
}
```

The new business rule has no boundary, negative-value, or regression tests.
