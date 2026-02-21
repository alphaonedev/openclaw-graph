---
name: coding-dart
cluster: coding
description: "Dart 3: null safety, async/await, streams, isolates, Flutter integration, pub package manager"
tags: ["dart","flutter","coding"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "dart flutter null safety stream isolate pub async"
---

# coding-dart

## Purpose
This skill provides expertise in Dart 3 programming, focusing on features like null safety, async/await, streams, isolates, Flutter integration, and pub package management, to assist in writing efficient, safe code for apps and tools.

## When to Use
Use this skill for Dart 3 projects involving mobile apps (e.g., Flutter), concurrent processing, asynchronous operations, or package dependencies. Apply it when null safety is critical to avoid runtime errors, or for handling real-time data with streams.

## Key Capabilities
- **Null Safety**: Enforce non-nullable types using `late` for lazy initialization and `required` for parameters, e.g., `late String name;` to declare a variable that must be initialized before use.
- **Async/Await**: Handle asynchronous code with `Future` and `async` functions, such as `Future<void> fetchData() async { var data = await http.get('/api/data'); }`.
- **Streams**: Manage asynchronous data streams using `Stream` from `dart:async`, e.g., `Stream<int> countStream() async* { for (int i = 0; i < 5; i++) yield i; }`.
- **Isolates**: Run concurrent tasks with `Isolate` for CPU-bound operations, e.g., `Isolate.spawn(workerFunction, args);` to offload work.
- **Flutter Integration**: Build UI with widgets and state management, e.g., using `StatelessWidget` for simple components.
- **Pub Package Manager**: Manage dependencies via pub, including adding packages with `pub add package_name`.

## Usage Patterns
To accomplish tasks, structure code with null safety by always specifying types (e.g., `String? optionalString;` for nullable values). For async operations, wrap I/O in `async` functions and use `await` for readability. Use isolates for background tasks to avoid UI blocking. Integrate Flutter by starting with `MaterialApp` in `main.dart`. For package management, run `pub get` after editing `pubspec.yaml`. Always test with `dart test` before deployment.

## Common Commands/API
- **Dart CLI Commands**: Use `dart analyze` with flags like `--fatal-infos` to enforce strict checks; run scripts with `dart run bin/main.dart`. For async, import `dart:async` and use `Future.delayed(Duration(seconds: 1), () => print('Delayed'));`.
- **Pub Commands**: Add dependencies with `pub add http --major-version 1` for specific versions; update with `pub upgrade`; build packages with `pub build --release`.
- **Key APIs**: Access streams via `StreamController` for custom streams, e.g., `var controller = StreamController<int>(); controller.add(1);`. For isolates, use `Isolate.run` for simple tasks: `Isolate.run(() => computeHeavyTask());`.
- **Config Formats**: Edit `pubspec.yaml` for dependencies, e.g.:
  ```
  dependencies:
    http: ^1.0.0
  ```
  Use environment variables for secrets, e.g., set `$API_KEY` and access via `String.fromEnvironment('API_KEY')`.

## Integration Notes
Integrate Dart with Flutter by adding Flutter dependencies in `pubspec.yaml` and running `flutter pub get`. For external APIs, set environment variables like `$FLUTTER_API_KEY` and access in code via `Platform.environment['FLUTTER_API_KEY']`. Combine with other tools by using Dart's FFI for C libraries or integrating with VS Code via the Dart extension (install with `code --install-extension Dart-Code.dart-code`). Ensure Dart SDK is in PATH; verify with `dart --version`.

## Error Handling
Handle errors in async code with try-catch in `async` functions, e.g.:
```
try {
  var result = await fetchData();
} catch (e) {
  print('Error: $e');
}
```
For streams, use `onError` callbacks: `stream.listen((data) => print(data), onError: (error) => print(error))`. Check null safety errors with `dart analyze`, and use `rethrow` to propagate exceptions. For isolates, handle communication errors with `ReceivePort` and `SendPort`.

## Concrete Usage Examples
1. **Async HTTP Request**: To fetch data safely with null safety, use: `import 'package:http/http.dart' as http; Future<String?> getData() async { try { var response = await http.get(Uri.parse('https://api.example.com/data')); return response.body; } catch (e) { return null; } }` Then call it with `var data = await getData(); if (data != null) print(data);`.
2. **Flutter Widget with Stream**: Create a simple counter stream in Flutter: `import 'dart:async'; class MyWidget extends StatelessWidget { Stream<int> counter() async* { for (int i = 0; i < 5; i++) yield i; } @override Widget build(BuildContext context) { return StreamBuilder<int>( stream: counter(), builder: (context, snapshot) => Text(snapshot.data?.toString() ?? '0'), ); } }`.

## Graph Relationships
- Related to cluster: coding (e.g., shares tags with coding-flutter for Flutter-specific tasks).
- Connected via tags: dart (links to general programming skills), flutter (integrates with UI-focused skills), coding (groups with other language skills like coding-python).
