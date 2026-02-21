---
name: cs-math
cluster: computer-science
description: "CS math: discrete math, combinatorics, probability, linear algebra, calculus for ML, information theory"
tags: ["math","discrete","probability","linear-algebra","cs"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "mathematics discrete probability linear algebra combinatorics statistics"
---

# cs-math

## Purpose
This skill enables OpenClaw to perform computations in computer science mathematics, covering discrete math (e.g., sets, graphs), combinatorics (e.g., permutations), probability (e.g., distributions), linear algebra (e.g., matrix operations), and calculus for ML (e.g., gradients), using optimized algorithms.

## When to Use
Use this skill for tasks involving mathematical computations in code, such as calculating probabilities in algorithms, solving linear systems for ML models, or analyzing combinatorics in data structures. Apply it when precise, programmatic math is needed, like in optimization problems or statistical analysis, rather than general queries.

## Key Capabilities
- Compute discrete math operations: permutations, combinations, graph traversals (e.g., via adjacency matrices).
- Handle probability: calculate expected values, binomial probabilities, or simulate distributions.
- Perform linear algebra: matrix multiplication, determinants, inverses, and eigenvalue calculations.
- Support calculus for ML: compute gradients, partial derivatives for loss functions.
- Integrate with data: process arrays or vectors from inputs, returning results as JSON.

## Usage Patterns
Invoke the skill via OpenClaw's CLI or API by specifying an operation and parameters. Always pass inputs as a JSON object for consistency. For example, in Python code: import openclaw; result = openclaw.invoke_skill('cs-math', {'operation': 'permutation', 'n': 5, 'r': 3}). Handle outputs as dictionaries, e.g., check for a 'result' key. Use try-except blocks for API calls to catch failures. If reusing parameters, store them in a config file like JSON: {"default_n": 5}, and load it before invoking.

## Common Commands/API
Use the OpenClaw CLI: openclaw cs-math --operation calculate --params '{"type": "permutation", "n": 5, "r": 3}' --output json
For API, send a POST to /api/skills/cs-math/execute with headers {'Authorization': 'Bearer $OPENCLAW_API_KEY'} and body: {"operation": "matrix_multiply", "A": [[1,2],[3,4]], "B": [[5,6],[7,8]]}
Config format: Parameters must be JSON objects, e.g., {"operation": "probability", "distribution": "binomial", "n": 10, "p": 0.5}. Common flags: --verbose for debug output, --timeout 30 for setting API timeouts in seconds. Code snippet for Python:
import openclaw
params = {"operation": "gradient", "function": "x**2 + y**2", "at": [1,1]}
result = openclaw.invoke('cs-math', params)
print(result['value'])  # Outputs the gradient vector

## Integration Notes
Integrate by setting the environment variable for authentication: export OPENCLAW_API_KEY=your_api_key_value. In code, import the OpenClaw library and call skills like: openclaw.set_api_key(os.environ['OPENCLAW_API_KEY']); openclaw.invoke('cs-math', params). For web apps, use the SDK to handle retries: openclaw.configure(retries=3). Ensure inputs are validated against schema, e.g., use JSON Schema for params. If embedding in larger workflows, chain with other skills via OpenClaw's event system, like triggering 'algorithms' skill after a math computation.

## Error Handling
Always check the response for an 'error' key, e.g., if result.get('error'), raise a custom exception. Common errors: InvalidInputError for non-numeric params (e.g., negative 'n' in permutations), handle with: try: openclaw.invoke('cs-math', {'operation': 'permutation', 'n': -1}) except ValueError as e: log_error(e). For API timeouts, use --timeout flag and catch HTTP errors: if response.status_code == 504, retry up to 3 times. Validate inputs beforehand, e.g., ensure matrices are square for inverses using: if not all(len(row) == len(matrix) for row in matrix): raise Error. Log detailed errors with --verbose flag for debugging.

## Concrete Usage Examples
1. Calculate permutations for arranging 5 items taken 3 at a time: Use code: import openclaw; params = {"operation": "permutation", "n": 5, "r": 3}; result = openclaw.invoke('cs-math', params); print(result['result'])  # Outputs: 10
2. Perform matrix multiplication for two 2x2 matrices: Use code: import openclaw; A = [[1,2],[3,4]]; B = [[5,6],[7,8]]; params = {"operation": "matrix_multiply", "A": A, "B": B}; result = openclaw.invoke('cs-math', params); print(result['result'])  # Outputs: [[19,22],[43,50]]

## Graph Relationships
- Belongs to cluster: computer-science
- Related tags: math, discrete, probability, linear-algebra, combinatorics, statistics
- Connected skills: algorithms (for applying math to sorting/complexity), data-science (for statistical integrations), ml-foundations (for calculus in training models)
