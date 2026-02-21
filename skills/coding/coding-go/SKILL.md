---
name: coding-go
cluster: coding
description: "Go 1.23+: goroutines, channels, interfaces, error handling, modules, testing, generics"
tags: ["go","golang","coding"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "golang go goroutine channel interface module error generics"
---

# coding-go

## Purpose
This skill equips the AI to handle Go programming tasks using features from Go 1.23+, focusing on advanced concurrency, modular code, and robust error management. Use it to generate, debug, and optimize Go code in real-time interactions.

## When to Use
Apply this skill for concurrent programming needs, like building scalable servers with goroutines and channels. Use it when developing modular applications with interfaces and generics, or for testing and error-prone codebases in Go 1.23+. Avoid it for basic scripting; opt for other languages if Go's ecosystem isn't required.

## Key Capabilities
- **Goroutines**: Spawn lightweight threads for concurrency; e.g., use `go func() { fmt.Println("Task") }()` to run asynchronously.
- **Channels**: Facilitate safe communication between goroutines; declare with `ch := make(chan int)` and send/receive via `ch <- 5` or `<-ch`.
- **Interfaces**: Define contracts for polymorphism; e.g., `type Writer interface { Write([]byte) error }`.
- **Error Handling**: Check errors explicitly, as in `if err != nil { return err }`, with support for wrapped errors via `errors.Is()`.
- **Modules**: Manage dependencies with `go mod`; initialize via `go mod init example.com/project`.
- **Testing**: Write unit tests using the `testing` package; e.g., `func TestAdd(t *testing.T) { if add(1,2) != 3 { t.Error("Failed") } }`.
- **Generics**: Use type parameters in functions; e.g., `func Map[T any](slice []T, f func(T) T) []T { ... }`.

## Usage Patterns
To implement concurrency, always pair goroutines with channels to avoid race conditions; for example, create a channel first, then launch goroutines that send data to it. For modular code, structure packages with interfaces to decouple dependencies—import modules via `go get` and use `import "example.com/pkg"`. When handling errors, wrap them for context using `fmt.Errorf("wrap: %w", err)` and propagate up the call stack. For generics, define type constraints like `[T comparable]` to ensure type safety in functions. Test code by running `go test -v` in the package directory after writing tests in `_test.go` files.

## Common Commands/API
Use the Go CLI for building and running code:
- `go run main.go`: Compile and execute a file; add `-race` flag for detecting race conditions, e.g., `go run -race main.go`.
- `go build -o output.bin`: Compile to an executable; include `-trimpath` for security, e.g., `go build -trimpath -o app`.
- `go mod tidy`: Clean up dependencies in go.mod; run after adding imports.
- `go test -cover`: Run tests with coverage; e.g., `go test -coverprofile=coverage.out ./pkg`.
API patterns include standard library functions like `sync.WaitGroup` for goroutine synchronization (e.g., `var wg sync.WaitGroup; wg.Add(1); go func() { defer wg.Done(); ... }(); wg.Wait()`). For external tools, set environment variables like `$GO111MODULE=on` to enable modules.

## Integration Notes
Integrate this skill by ensuring the AI has access to a Go 1.23+ environment; install via `brew install go` on macOS or download from golang.org. For authenticated tools like GitHub integration with Go modules, use env vars such as `$GITHUB_TOKEN` for `go get` commands. Configure the AI's workspace with a go.mod file: create one using `go mod init myproject`, then reference it in prompts. If using IDE extensions, specify paths like `$GOPATH/src` and ensure the AI prefixes commands with the correct working directory, e.g., `cd /path/to/project && go run main.go`.

## Error Handling
Always check errors after operations that can fail, such as file I/O or API calls; use `if err := os.Open("file.txt"); err != nil { log.Fatal(err) }`. For wrapped errors, employ `errors.Unwrap()` to inspect chains. In concurrent code, handle panics with `recover()` inside goroutines: e.g., `go func() { defer func() { if r := recover(); r != nil { log.Error(r) } }(); riskyFunction() }()`. Use `go vet` to catch common issues: run `go vet ./...` in the project root.

## Concrete Usage Examples
1. **Concurrent Data Processing**: To process a list concurrently, use goroutines and channels: `ch := make(chan int); go func() { for i := 0; i < 10; i++ { ch <- i*2 } }(); result := <-ch; fmt.Println(result)`.
2. **Generic Function for Sorting**: Implement a generic sort helper: `func Sort[T []int](slice T) { sort.Slice(slice, func(i, j int) bool { return slice[i] < slice[j] }) } main() { nums := []int{3,1,2}; Sort(nums); fmt.Println(nums) }`.

## Graph Relationships
- Related to: coding (cluster), specifically coding-python and coding-java via shared tags like "coding".
- Connected via tags: "go" links to general programming skills; "goroutine" and "channel" relate to concurrency-focused skills like coding-concurrency.
