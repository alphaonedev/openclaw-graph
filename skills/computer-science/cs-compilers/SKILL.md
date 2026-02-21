---
name: cs-compilers
cluster: computer-science
description: "Compilers: lexing, parsing LL/LR/PEG, AST, semantic analysis, code gen LLVM, optimization, tree-sitter"
tags: ["compilers","parsing","ast","llvm","cs"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "compiler parser lexer ast llvm code generation interpreter tree-sitter"
---

# cs-compilers

## Purpose
This skill equips the AI to handle compiler-related tasks, including lexing, parsing (LL/LR/PEG), building ASTs, semantic analysis, code generation with LLVM, optimizations, and integration with Tree-sitter for real-time parsing.

## When to Use
Use this skill when developing compilers, analyzing source code, debugging parsers, generating optimized machine code, or integrating parsing into tools like IDEs. Apply it for tasks involving code transformation, such as transpiling or static analysis in programming languages.

## Key Capabilities
- **Lexing**: Tokenize input using regex; e.g., define patterns like `r'\b(int|float)\b'` for keywords in a lexer.
- **Parsing**: Implement LL(1) with recursive descent or LR(1) via tools like yacc; use PEG with libraries like packrat; integrate Tree-sitter for efficient parsing, e.g., load a language grammar with `tree_sitter.Language.build('path/to/tree-sitter-javascript.wasm')`.
- **AST Handling**: Build and manipulate ASTs; traverse nodes for analysis, e.g., use Tree-sitter's cursor: `cursor = tree.walk(); while cursor.goto_first_child(): process_node(cursor)`.
- **Semantic Analysis**: Perform type checking and scope resolution; e.g., check variable declarations against usage in a symbol table.
- **Code Generation**: Generate LLVM IR; use the LLVM C++ API to create modules, e.g., `LLVMModuleCreateWithName("MyModule")` then add functions.
- **Optimization**: Apply passes like constant propagation or dead code elimination; e.g., run LLVM's opt tool with flags like `-O3` for aggressive optimization.
- **Tree-sitter Integration**: Parse code in real-time; supports languages like C, Python via pre-built grammars.

## Usage Patterns
Invoke this skill via OpenClaw CLI for direct commands or SDK for programmatic access. Always specify the action and parameters as JSON. For CLI, use: `openclaw invoke cs-compilers --action <action> --params '<JSON string>'`. In code, import the SDK and call: `from openclaw import Client; client = Client(api_key=os.environ['OPENCLAW_API_KEY']); response = client.invoke('cs-compilers', {'action': 'parse', 'params': {'language': 'c', 'code': 'int main(){}'}})`. Structure params as a dictionary with keys like "language" and "code". If using external tools, ensure dependencies (e.g., LLVM) are installed and pathed correctly.

## Common Commands/API
- **Parse Code**: CLI: `openclaw invoke cs-compilers --action parse --params '{"language": "python", "code": "def foo(x): return x+1"}'`; returns AST as JSON. API: POST /api/skills/cs-compilers with body { "action": "parse", "params": { "language": "python", "code": "def foo(x): return x+1" } }.
- **Generate LLVM IR**: CLI: `openclaw invoke cs-compilers --action generate-llvm --params '{"language": "c", "code": "int add(int a, int b) { return a+b; }", "optimize": true}'`; uses flags like --optimize for passes. API: POST /api/skills/cs-compilers with body { "action": "generate-llvm", "params": { "language": "c", "code": "int add(int a, int b) { return a+b; }" } }.
- **Lex Input**: CLI: `openclaw invoke cs-compilers --action lex --params '{"input": "int x = 5;", "patterns": ["\\bint\\b"]}'`; outputs tokens array. API: POST /api/skills/cs-compilers with body { "action": "lex", "params": { "input": "int x = 5;", "patterns": ["\\bint\\b"] } }.
- **Config Format**: Use JSON for params, e.g., { "grammar": "path/to/grammar.json", "options": { "debug": true } }. Authentication: Set env var `$OPENCLAW_API_KEY` for all API calls.

## Integration Notes
Integrate by installing OpenClaw SDK via `pip install openclaw` and importing it in your project. For LLVM, ensure clang is installed and link via `llvm-config --cxxflags`. Tree-sitter requires compiling grammars; e.g., clone a repo and build with `make`. Handle dependencies in your environment; e.g., set PATH for LLVM tools. For custom parsers, provide a config JSON like { "parserType": "LR", "grammarRules": [{ "rule": "E -> T + E" }] }. Test integrations in a sandbox to verify responses.

## Error Handling
Always check the response object for an 'error' key; if present, it contains a code and message. For CLI, parse output JSON: if response['error'], exit with code response['error']['code']. In SDK: try: response = client.invoke(...); except OpenClawError as e: log(e.code, e.message). Common errors: 400 for invalid params (e.g., malformed JSON), 401 for auth issues (check $OPENCLAW_API_KEY), 500 for internal failures like parser crashes. Retry transient errors (e.g., 503) with exponential backoff, and validate inputs before invoking, e.g., ensure 'language' is a supported string like 'c' or 'python'.

## Concrete Usage Examples
1. **Parsing a C Function**: To parse and extract an AST for a simple C function, run: `openclaw invoke cs-compilers --action parse --params '{"language": "c", "code": "int main() { return 0; }"}'`. This returns a JSON AST like { "type": "function_definition", "name": "main", "body": [...] }. Use the AST to analyze structure, e.g., count nodes.
2. **Generating Optimized LLVM IR**: To generate and optimize LLVM IR from C code, execute: `openclaw invoke cs-compilers --action generate-llvm --params '{"language": "c", "code": "int add(int a, int b) { return a + b; }", "optimize": true}'`. Output might be: "define i32 @add(i32 %a, i32 %b) { %1 = add i32 %a, %b; ret i32 %1 }". Pipe this to LLVM tools for further compilation.

## Graph Relationships
- Related to: programming-languages (shares parsing and AST techniques for language design)
- Related to: software-engineering (connects via code optimization and integration with build tools)
- Related to: algorithms (overlaps on efficient parsing algorithms like LL and LR)
