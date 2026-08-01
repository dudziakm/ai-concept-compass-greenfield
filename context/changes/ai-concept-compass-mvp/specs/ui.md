# UI contract — MVP

> Polish product interface; implementation identifiers and API fields remain
> English. This specification traces PRD US-01–US-07 to visible states.

## Routes

| Route                 | Audience      | Outcome                                                  |
| --------------------- | ------------- | -------------------------------------------------------- |
| `/`                   | public        | product promise and path to account actions              |
| `/auth/signup`        | public        | create account; explain email confirmation when required |
| `/auth/signin`        | public        | establish session or show safe error                     |
| `/auth/confirm-email` | public        | next step after signup                                   |
| `/dashboard`          | authenticated | complete learning workflow                               |

## Dashboard state model

- **Loading:** skeleton plus screen-reader live text; no empty-state flash.
- **Empty:** one clear primary action for starter pack and secondary action for a
  custom concept.
- **Ready:** recommended concept, summary metrics, five domain progress rows and
  the full concept collection.
- **Editing:** concept form prefilled for edit or empty for create; cancel returns
  without mutation.
- **Post-edit confirmation:** the dialog closes after a successful update; the
  unchanged list position of the saved card is briefly highlighted and focused,
  while a Polish status message announces the result.
- **Collection order:** concepts remain in a stable creation order. Records
  sharing a creation timestamp use their identifier as a deterministic tie-breaker.
- **Review:** confidence selection precedes answer reveal; result controls appear
  with the answer pattern; outcome submit refreshes dashboard aggregates.
- **Busy:** mutating controls are disabled and carry Polish progress labels.
- **Error:** user-readable message remains visible without discarding the last
  successful dashboard data.

## Core interactions

1. Load pack from the empty state; the same action is safe to repeat.
2. Add or edit title, domain, description, question and answer pattern.
3. After editing, return to the saved card without changing its list position.
4. Select a concept, choose confidence 1–5, reveal the model answer and choose
   `Niepoprawnie`, `Częściowo` or `Poprawnie`.
5. Observe the refreshed recommendation and domain averages.
6. Confirm deletion with copy that explicitly mentions review history.

## Accessibility and responsive contract

- Labels bind to every form control; actions have names that include the target
  concept where ambiguity exists.
- Status and loading messaging use live/screen-reader text; color is not the only
  carrier of the result.
- The saved-card confirmation is tied to the edited card and expires after five
  seconds, so it confirms the result without permanently obscuring the dashboard.
- Keyboard users can reach auth, starter, CRUD, review and delete confirmation.
- The critical flow remains usable at 360 px without horizontal page scrolling.
- Tests prefer role/label/text locators; DOM structure, CSS selectors, XPath and
  fixed timeout sleeps are forbidden by `e2e/AGENTS.md`.

## Evidence status

- Local screenshots of signin, empty mobile state, loaded dashboard and review
  result are retained in `context/evidence/screenshots/builder/`.
- Local keyboard focus order, 360 px mobile CRUD/no-overflow and zero-console-error
  smoke passed on 2026-08-01.
- Final screenshots and console/network smoke still need the public deployment.
- Signup with real e-mail confirmation still needs the public environment.
- Cross-account visual confirmation after database-level deny proof.
