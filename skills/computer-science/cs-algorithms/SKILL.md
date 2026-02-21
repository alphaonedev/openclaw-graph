---
name: cs-algorithms
cluster: computer-science
description: "Algorithms: sorting, searching, BFS/DFS/A*, dynamic programming, greedy, backtracking, Big-O"
tags: ["algorithms","sorting","searching","complexity"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "algorithm sort search dynamic programming complexity big o bfs dfs"
---

# cs-algorithms

## Purpose
This skill equips OpenClaw with tools for implementing and analyzing computer science algorithms, focusing on sorting, searching, graph traversals, dynamic programming, greedy approaches, backtracking, and Big-O complexity analysis. Use it to generate code snippets, optimize algorithms, or explain concepts in responses.

## When to Use
Apply this skill when handling algorithmic problems in coding tasks, such as optimizing search in large datasets, solving graph problems in networks, or analyzing time complexity in performance-critical applications. Use it for educational responses, code reviews, or when users ask about specific algorithms like BFS for pathfinding.

## Key Capabilities
- Sorting: Implement quicksort, mergesort, or bubblesort with configurable pivots or stability checks.
- Searching: Binary search, linear search, with options for recursive or iterative variants.
- Graph Traversals: BFS, DFS, and A* for pathfinding, including handling weighted graphs.
- Dynamic Programming: Memoization and tabulation for problems like knapsack or longest common subsequence.
- Greedy and Backtracking: Solve scheduling or subset sum problems with backtracking constraints.
- Big-O Analysis: Compute and explain time/space complexity, e.g., O(n log n) for mergesort.
- Additional: Handle edge cases like sorted arrays or disconnected graphs.

## Usage Patterns
To use this skill, invoke it via OpenClaw's API or CLI by specifying the algorithm type and inputs. Always pass required parameters like data arrays or graph structures. For example, chain it with other skills by outputting results to variables. Prefix calls with authentication via `$OPENCLAW_API_KEY` in environment variables. In code, import the skill and call methods directly; in CLI, use subcommands for quick execution.

## Common Commands/API
Use the OpenClaw CLI for direct runs or the Python API for integration. Authentication requires setting `$OPENCLAW_API_KEY` as an environment variable.

- CLI Example: `openclaw run cs-algorithms --algorithm sort --input "[1,3,2]" --method quick`
  This sorts the array using quicksort.

- API Example:
  ```python
  import openclaw
  openclaw.set_api_key(os.environ['OPENCLAW_API_KEY'])
  sorted_array = openclaw.algorithms.sort([1,3,2], method='quick')
  ```

- Common Flags:
  - `--algorithm [sort|search|bfs|...]`: Specifies the algorithm to run.
  - `--input [JSON string]`: Provides input data, e.g., arrays or graphs as JSON.
  - `--config { "method": "quick", "depth": 5 }`: JSON config for parameters like recursion depth.
  
- API Endpoints:
  - `openclaw.algorithms.sort(array, method='quick')`: Returns sorted array.
  - `openclaw.algorithms.bfs(graph, start_node)`: Returns traversed nodes.
  - For dynamic programming: `openclaw.algorithms.dp_solve(problem='knapsack', items=[...], capacity=10)`.

Config formats are JSON-based; for graphs, use adjacency lists like `{"A": ["B", "C"]}`.

## Integration Notes
Integrate by adding OpenClaw as a dependency in your project (e.g., `pip install openclaw`). Set up authentication in your environment with `export OPENCLAW_API_KEY=your_key`. For asynchronous use, wrap API calls in async functions, e.g., `await openclaw.algorithms.bfs_async(graph)`. Ensure inputs are validated (e.g., arrays must be lists), and handle outputs as JSON. If combining with other skills, use OpenClaw's output piping, like `openclaw run cs-algorithms --output var1 | openclaw run another-skill --input var1`.

## Error Handling
Common errors include invalid inputs (e.g., non-array for sort) or authentication failures. Check for `InvalidInputError` by wrapping calls in try-except blocks. For CLI, errors return non-zero exit codes with messages like "Error: Array must be a list". In API, catch exceptions:
```python
try:
    result = openclaw.algorithms.sort([1, 'a'], method='quick')  # Type mismatch error
except openclaw.errors.InvalidInputError as e:
    print(f"Handle error: {e} - Ensure all elements are numbers")
```
Always validate inputs before calling, e.g., use `isinstance(array, list)`. For Big-O analysis, handle cases where complexity can't be computed (e.g., infinite loops) by setting timeouts.

## Concrete Usage Examples
1. **Sorting an Array**: To sort a user-provided list, use: `openclaw run cs-algorithms --algorithm sort --input "[5,2,9,1]" --method mergesort"`. This outputs `[1,2,5,9]`. In code: 
   ```python
   import openclaw
   openclaw.set_api_key(os.environ['OPENCLAW_API_KEY'])
   sorted_list = openclaw.algorithms.sort([5,2,9,1], method='mergesort')
   print(sorted_list)  # [1, 2, 5, 9]
   ```
   Analyze complexity: Add `--analyze-complexity` flag for "O(n log n) time".

2. **BFS on a Graph**: For graph traversal, run: `openclaw run cs-algorithms --algorithm bfs --input '{"A": ["B"], "B": ["C"]}' --start "A"`. Output: `["A", "B", "C"]`. In API:
   ```python
   graph = {"A": ["B"], "B": ["C"]}
   traversal = openclaw.algorithms.bfs(graph, "A")
   print(traversal)  # ['A', 'B', 'C']
   ```
   Use for pathfinding in AI responses.

## Graph Relationships
- Related Clusters: computer-science (parent cluster for algorithmic topics).
- Related Skills: data-structures (for array/graph implementations), machine-learning (for A* in optimization).
- Tags Connections: "algorithms" links to optimization skills; "sorting" and "searching" connect to efficiency-focused tools; "complexity" relates to performance-analysis skills.
