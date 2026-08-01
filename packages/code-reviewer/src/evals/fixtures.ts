import type { ReviewDimension, ReviewInput } from "../schemas.js";

export interface EvalCase {
  id: string;
  description: string;
  input: unknown;
  expectedVerdict?: "pass" | "fail";
  expectedDimension?: ReviewDimension;
  expectedErrorCode?: "INVALID_INPUT";
}

export interface LiveMatrixCase {
  id: string;
  description: string;
  input: ReviewInput;
  expectedFlawIds: readonly [string, string, string];
}

export const EVAL_CASES: EvalCase[] = [
  {
    id: "clean",
    description: "Mały refaktor z testem regresyjnym",
    input: {
      title: "refactor: extract confidence score helper",
      body: "Bez zmiany kontraktu. Dodano testy wartości granicznych.",
      diff: `diff --git a/src/lib/score.ts b/src/lib/score.ts
index 1111111..2222222 100644
--- a/src/lib/score.ts
+++ b/src/lib/score.ts
@@ -1,2 +1,4 @@
+export const confidenceScore = (confidence: number) => (confidence - 1) * 25;
 export const outcomeScore = (outcome: number) => outcome * 50;
diff --git a/src/lib/score.test.ts b/src/lib/score.test.ts
index 3333333..4444444 100644
--- a/src/lib/score.test.ts
+++ b/src/lib/score.test.ts
@@ -1,2 +1,4 @@
+expect(confidenceScore(1)).toBe(0);
+expect(confidenceScore(5)).toBe(100);`,
    } satisfies ReviewInput,
    expectedVerdict: "pass",
  },
  {
    id: "missing-tests",
    description: "Nowa logika biznesowa bez testu ryzyka",
    input: {
      title: "feat: add discount calculation",
      body: "Nowa reguła rabatowa.",
      diff: `diff --git a/src/lib/discount.ts b/src/lib/discount.ts
new file mode 100644
--- /dev/null
+++ b/src/lib/discount.ts
@@ -0,0 +1,5 @@
+export function calculateDiscount(total: number) {
+  if (total > 1000) return total * 0.2;
+  return 0;
+}`,
    } satisfies ReviewInput,
    expectedVerdict: "fail",
    expectedDimension: "test-risk-coverage",
  },
  {
    id: "security-gap",
    description: "Sekret service-role trafia do kodu aplikacji",
    input: {
      title: "feat: initialize admin client",
      body: "Ułatwia operacje administracyjne z UI.",
      diff: `diff --git a/src/lib/admin-client.ts b/src/lib/admin-client.ts
new file mode 100644
--- /dev/null
+++ b/src/lib/admin-client.ts
@@ -0,0 +1,3 @@
+const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiJ9.demo-secret";
+export const adminClient = createClient(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);`,
    } satisfies ReviewInput,
    expectedVerdict: "fail",
    expectedDimension: "security-safety",
  },
  {
    id: "excessive-complexity",
    description: "Nieuzasadniona, głęboko zagnieżdżona logika",
    input: {
      title: "feat: choose next concept",
      body: "Wybór rekomendacji dashboardu.",
      diff: `diff --git a/src/lib/next.ts b/src/lib/next.ts
new file mode 100644
--- /dev/null
+++ b/src/lib/next.ts
@@ -0,0 +1,12 @@
+export function choose(items: Item[]) {
+  for (const item of items) {
+    if (item.active) {
+      if (item.due) {
+        if (item.priority > 50) {
+          if (item.owner) return item;
+        }
+      }
+    }
+  }
+  return undefined;
+}`,
    } satisfies ReviewInput,
    expectedVerdict: "fail",
    expectedDimension: "complexity",
  },
  {
    id: "missing-documentation",
    description: "Nowy publiczny endpoint bez opisu kontraktu i błędów",
    input: {
      title: "feat: add public export endpoint",
      body: "Udostępnia eksport pojęć integracjom.",
      diff: `diff --git a/src/pages/api/public/export.ts b/src/pages/api/public/export.ts
new file mode 100644
--- /dev/null
+++ b/src/pages/api/public/export.ts
@@ -0,0 +1,5 @@
+export async function GET({ locals }: APIContext) {
+  const rows = await locals.supabase.from("concepts").select("*");
+  return new Response(JSON.stringify(rows.data));
+}`,
    } satisfies ReviewInput,
    expectedVerdict: "fail",
    expectedDimension: "documentation",
  },
  {
    id: "malformed-input",
    description: "Puste i niezgodne ze schematem wejście",
    input: { title: "", body: "", diff: "" },
    expectedErrorCode: "INVALID_INPUT",
  },
];

export const LIVE_REACT_MIGRATION_CASE: LiveMatrixCase = {
  id: "react16-to-react19-migration",
  description: "Migracja komponentu React 16 do React 19 z trzema celowo seedowanymi błędami kompatybilności",
  input: {
    title: "refactor: migrate legacy profile panel from React 16 to React 19",
    body: "Migracja ma usunąć nieobsługiwane API React 16. Zachowaj focus inputu i kontekst motywu.",
    diff: `diff --git a/src/ProfilePanel.tsx b/src/ProfilePanel.tsx
index 1111111..2222222 100644
--- a/src/ProfilePanel.tsx
+++ b/src/ProfilePanel.tsx
@@ -1,25 +1,57 @@
-import React from "react";
-import ReactDOM from "react-dom";
+import React from "react";
+import ReactDOM from "react-dom";
+import PropTypes from "prop-types";
+
+interface ProfilePanelProps {
+  displayName: string;
+}
+
+interface ProfilePanelState {
+  isEditing: boolean;
+}

-export function ProfilePanel({ displayName }: { displayName: string }) {
-  return <p>{displayName}</p>;
+export class ProfilePanel extends React.Component<ProfilePanelProps, ProfilePanelState> {
+  static childContextTypes = {
+    theme: PropTypes.string,
+  };
+
+  state: ProfilePanelState = {
+    isEditing: false,
+  };
+
+  getChildContext() {
+    return { theme: "dark" };
+  }
+
+  focusEditor = () => {
+    this.refs.editor.focus();
+  };
+
+  render() {
+    const { displayName } = this.props;
+    const { isEditing } = this.state;
+
+    return (
+      <section aria-label="Profile panel">
+        <h2>{displayName}</h2>
+        <input ref="editor" defaultValue={displayName} />
+        <button type="button" onClick={this.focusEditor}>
+          Focus editor
+        </button>
+        <button type="button" onClick={() => this.setState({ isEditing: !isEditing })}>
+          {isEditing ? "Save" : "Edit"}
+        </button>
+      </section>
+    );
+  }
 }

-const root = document.getElementById("root");
-if (root) ReactDOM.render(<ProfilePanel displayName="Ada" />, root);
+const root = document.getElementById("root");
+if (root) {
+  ReactDOM.render(<ProfilePanel displayName="Ada" />, root);
+}`,
  },
  expectedFlawIds: ["reactdom-render", "string-ref-this-refs", "legacy-context"],
};

export function getEvalCase(id: string): EvalCase {
  const evalCase = EVAL_CASES.find((candidate) => candidate.id === id);
  if (!evalCase) throw new Error(`Nieznany przypadek eval: ${id}`);
  return evalCase;
}
