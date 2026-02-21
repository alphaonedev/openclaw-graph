---
name: cs-formal
cluster: computer-science
description: "Formal methods: type theory HoTT/System F, logic, Hoare triples, TLA+, Coq/Lean verification"
tags: ["formal-methods","types","logic","verification","cs"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "formal methods type theory logic verification coq lean tla hoare"
---

# cs-formal

## Purpose
This skill provides tools for applying formal methods in computer science, including type theory (HoTT and System F), logic systems, Hoare triples, TLA+ for model checking, and verification in Coq or Lean. Use it to prove program correctness and verify specifications.

## When to Use
Apply this skill when verifying software properties, such as concurrency bugs in distributed systems (e.g., with TLA+), proving theorems in dependent types (e.g., HoTT), or checking code invariants via Hoare triples. Use it for safety-critical code, academic proofs, or integrating formal verification into development workflows.

## Key Capabilities
- Parse and verify Hoare triples: e.g., {P} C {Q} for pre/post conditions.
- Generate TLA+ specifications for model checking concurrent systems.
- Interact with Coq/Lean for theorem proving, including inductive types and tactics.
- Evaluate type theory constructs, like System F polymorphic functions.
- Export proofs or models as JSON for integration, using OpenClaw's API.

## Usage Patterns
Invoke this skill via OpenClaw's CLI for interactive sessions or API for scripted workflows. For CLI, prefix commands with `openclaw cs-formal`. Use API endpoints like `/api/cs-formal/verify` with JSON payloads. Always specify the tool (e.g., --tool coq) and input file. For pipelines, chain with other skills by piping output, e.g., verify a TLA+ model then analyze results.

## Common Commands/API
Use OpenClaw's CLI for direct execution:
- `openclaw cs-formal verify --tool coq --file proof.v --tactic induction`: Runs a Coq proof on proof.v using the induction tactic.
- `openclaw cs-formal check-hoare --pre "{x > 0}" --code "x = x + 1" --post "{x > 1}"`: Verifies a Hoare triple.
- `openclaw cs-formal model --tool tla --spec "Init == ... Next == ..."`: Generates and checks a TLA+ model.

For API calls, use POST requests to `https://api.openclaw.ai/cs-formal/verify` with a JSON body like:
```json
{"tool": "lean", "file": "theorem.lean", "options": {"tactic": "simp"}}
```
Set authentication via environment variable: `$OPENCLAW_API_KEY` in headers, e.g., `Authorization: Bearer $OPENCLAW_API_KEY`. Config files should be in YAML format, e.g.:
```yaml
tool: coq
file: proof.v
tactics:
  - intro
  - apply
```

## Integration Notes
Integrate with IDEs like VS Code by adding OpenClaw as a plugin, configuring it in your .openclawrc file with: `cs-formal: { apiKey: $OPENCLAW_API_KEY, defaultTool: "tla" }`. For CI/CD, use scripts like `export OPENCLAW_API_KEY=your_key; openclaw cs-formal verify --tool lean --file path/to/file`. Combine with other skills, e.g., pipe output to a "debugging" skill for error analysis. Ensure dependencies like Coq or TLA+ are installed via `apt install coq` or similar.

## Error Handling
Check for common errors like syntax issues in TLA+ specs (e.g., missing operators) by running `openclaw cs-formal lint --tool tla --file spec.tla`, which returns JSON with error codes (e.g., "TLA001: Undefined constant"). For proof failures in Coq, parse the output for "stuck" states and retry with adjusted tactics, e.g., if a tactic fails, use `openclaw cs-formal retry --tactic alternative`. Handle API errors by checking HTTP status codes (e.g., 401 for auth issues) and fallback to local mode if network fails. Always validate inputs, like ensuring Hoare triple conditions are well-formed strings.

## Concrete Usage Examples
1. **Verify a simple Hoare triple for a loop:** Use `openclaw cs-formal check-hoare --pre "{n >= 0}" --code "WHILE n > 0 INVARIANT n >= 0 DO n := n - 1 END" --post "{n = 0}"` to confirm the invariant holds, then export results for further analysis.
2. **Model check a concurrent system with TLA+:** Run `openclaw cs-formal model --tool tla --spec "CONSTANT N \\n VARIABLE x \\n Init == x = 0 \\n Next == x' = x + 1"` to detect deadlocks, and integrate the output into a testing pipeline.

## Graph Relationships
- Related to: "algorithms" (for logical proofs in algorithm design), "software-engineering" (for verification in code reviews), "data-structures" (for type theory applications in data modeling).
- Clusters: Connected via "computer-science" cluster for shared CS tools.
