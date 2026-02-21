---
name: coding-swift
cluster: coding
description: "Swift 6: async/await/actors/Sendable, generics, property wrappers, result builders, SPM, testing"
tags: ["swift","ios","macos","coding"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "swift ios macos concurrency actor async swift6 spm generics"
---

## Purpose
This skill equips the AI to assist with Swift 6 programming, focusing on modern features for iOS and macOS development, including concurrency, generics, and package management.

## When to Use
Use this skill for tasks involving Swift 6 code, such as building async/await-based apps, implementing actors for thread safety, or managing Swift Package Manager (SPM) dependencies in iOS/macOS projects. Apply it when existing code needs updates for Sendable conformance or generics enhancements.

## Key Capabilities
- Async/await: For non-blocking code execution, e.g., handling network requests.
- Actors: To manage shared state safely, ensuring Sendable compliance.
- Generics: Enable reusable code with type constraints, like defining a generic struct.
- Property wrappers: Simplify property management, e.g., for validation.
- Result builders: Construct complex types like views in SwiftUI.
- SPM: Handle dependencies via Package.swift files.
- Testing: Write unit tests using XCTest for async code.

## Usage Patterns
To accomplish tasks, structure code with Swift 6 idioms: Use async functions for I/O operations, wrap shared state in actors, and leverage generics for collections. For SPM, edit Package.swift and run builds. Always check for Sendable conformance to avoid data races. When integrating with Xcode, compile projects using the Swift 6 toolchain by setting the compiler version in project settings.

## Common Commands/API
- Build a Swift package: Run `swift build --configuration release` from the project directory.
- Run tests: Execute `swift test --enable-test-discovery` in an SPM project.
- Async API usage: Define an async function like `func fetchData() async throws -> Data { ... }` and call it with `Task { let data = try await fetchData() }`.
- Actor example: Create an actor with `actor MyActor { var state: Int = 0; func update() { state += 1 } }`.
- Generics API: Use a generic function like `func swap<T>(_ a: inout T, _ b: inout T) { let temp = a; a = b; b = temp }`.
- Property wrapper: Define one as `@propertyWrapper struct Clamped<Value: Comparable> { var wrappedValue: Value { ... } }`.
- SPM config: Edit Package.swift with format like `let package = Package(name: "MyApp", dependencies: [.package(url: "https://github.com/apple/swift-algorithms", from: "1.0.0")])`.

## Integration Notes
Integrate this skill by ensuring the Swift 6 toolchain is installed (e.g., via Xcode 15+). For external services, set auth via environment variables like `$SWIFT_API_KEY` for API calls in code, e.g., `let apiKey = ProcessInfo.processInfo.environment["SWIFT_API_KEY"]`. When combining with other skills, import Swift packages in Xcode by adding them in the "Swift Packages" tab. For concurrency, ensure actors are used in async contexts to avoid runtime errors.

## Error Handling
Handle errors in Swift 6 by using do-catch blocks with async functions, e.g.:
```swift
do {
    let result = try await someAsyncFunction()
} catch let error as NSError {
    print("Error code: \(error.code)")
}
```
Check for Sendable errors by adding `@Sendable` to functions and fixing non-conforming closures. For SPM, parse build errors from `swift build` output, e.g., look for "error: dependency not found" and resolve by updating Package.swift. Always use `guard` statements for optionals to prevent crashes.

## Concrete Usage Examples
1. **Async network request**: To fetch data from an API, use: `func fetchUser() async throws -> User { let url = URL(string: "https://api.example.com/user")!; let (data, _) = try await URLSession.shared.data(from: url); return try JSONDecoder().decode(User.self, from: data) }`. Call it in a task: `Task { do { let user = try await fetchUser(); print(user.name) } catch { print(error) } }`.
2. **Actor for shared state**: To manage a counter safely, define: `actor Counter { private var value = 0; func increment() { value += 1 } }`. Use it like: `let counter = Counter(); Task { await counter.increment(); print(await counter.value) }` to ensure thread safety.

## Graph Relationships
- Related to: coding-general (shares cluster), ios-development (via tags "ios"), macos-app (via tags "macos"), concurrency-handling (via embedding hint "concurrency actor async").
- Clusters: Connected to "coding" cluster for broader programming skills.
- Tags: Links with skills tagged "swift" for language-specific tasks and "spm" for package management.
