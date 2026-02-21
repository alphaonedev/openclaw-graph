---
name: cs-concurrency
cluster: computer-science
description: "Concurrency: threads vs async, locks/mutexes/rwlocks, atomics, lock-free, actor model, STM, deadlock"
tags: ["concurrency","threads","async","locks","actors","cs"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "concurrency threads async lock mutex atomic actor deadlock race condition"
---

# cs-concurrency

## Purpose
This skill equips OpenClaw to assist with concurrency concepts in computer science, including threads vs. async programming, synchronization primitives like locks and atomics, and advanced topics like actor models, STM, and deadlock avoidance. Use it to generate code, explain pitfalls, or debug issues.

## When to Use
Apply this skill when developing multi-threaded applications (e.g., in C++ or Python), handling shared resources to prevent race conditions, optimizing for I/O-bound tasks with async/await, or analyzing deadlocks in production code. Use it for real-time systems, web servers, or distributed computing where concurrency is critical.

## Key Capabilities
- Explain differences: Threads (blocking, OS-level) vs. async (non-blocking, event-loop based).
- Demonstrate synchronization: Implement mutexes, RW locks, and atomics for shared data.
- Handle advanced patterns: Generate actor model code (e.g., using Erlang-style actors) or STM for transactional memory.
- Detect issues: Identify potential deadlocks or race conditions in provided code snippets.
- Optimize: Suggest lock-free data structures like concurrent queues.

## Usage Patterns
Invoke OpenClaw via CLI for quick explanations or code generation; use API for integration into scripts. Always specify the subtopic (e.g., "threads" or "locks") for targeted responses. For interactive sessions, prefix commands with "openclaw cs-concurrency". If using programmatically, pass JSON payloads with required parameters like topic and language.

## Common Commands/API
Use CLI commands like:  
`openclaw cs-concurrency explain threads --lang python` (explains threads with a Python example).  
`openclaw cs-concurrency generate lock --type mutex --code c++` (generates a mutex example in C++).  

For API, send POST requests to `/api/cs-concurrency/explain` with JSON body:  
`{ "topic": "atomics", "lang": "rust", "detail": "high" }`  
Headers: `Authorization: Bearer $OPENCLAW_API_KEY` (set via environment variable for authentication).  

Config format for custom sessions:  
JSON file like `{ "defaultLang": "go", "focus": ["deadlock", "async"] }` passed with `--config path/to/file.json`.

## Integration Notes
Integrate by setting $OPENCLAW_API_KEY in your environment for authenticated API calls. For example, in a bash script: `export OPENCLAW_API_KEY=your_api_key_here`. Combine with other tools like debuggers (e.g., gdb for threads) by piping output: `openclaw cs-concurrency explain deadlock | gdb -ex "run"`. Ensure your application handles async contexts if embedding responses in Node.js or Python event loops.

## Error Handling
When using this skill, check for concurrency errors like deadlocks by wrapping code in try-except blocks. For example, in Python:  
```python
import threading
lock = threading.Lock()
try:
    with lock:
        # Critical section
        pass
except threading.LockError:
    print("Lock acquisition failed")
```  
For API calls, handle HTTP errors (e.g., 401 for invalid $OPENCLAW_API_KEY) by checking response status codes. In OpenClaw commands, use `--verbose` flag to debug: `openclaw cs-concurrency explain async --verbose` to log detailed errors.

## Concrete Usage Examples
**Example 1:** To generate a simple threads example in C++:  
Run: `openclaw cs-concurrency generate threads --lang c++`  
Output might include:  
```cpp
#include <thread>
void task() { /* code */ }
int main() {
    std::thread t1(task);
    t1.join();
}
```  
This helps in understanding basic thread creation and joining.

**Example 2:** To explain and fix a race condition with atomics:  
Command: `openclaw cs-concurrency explain race --fix --lang rust`  
Response: Explains the issue and provides:  
```rust
use std::sync::atomic::{AtomicUsize, Ordering};
static COUNTER: AtomicUsize = AtomicUsize::new(0);
COUNTER.fetch_add(1, Ordering::SeqCst);
```  
Use this to safely increment shared counters without locks.

## Graph Relationships
- Related to: cs-algorithms (via concurrency tag for parallel algorithms)
- Connected to: programming-languages (shares tags like "threads" for language-specific implementations)
- Links with: software-engineering (for deadlock in system design)
- Associated via: cs (cluster overlap for computer science topics)
