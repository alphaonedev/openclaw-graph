---
name: ios-swift
cluster: mobile
description: "Swift for iOS: UIKit/SwiftUI basics, Swift concurrency in iOS, Xcode project structure, targets"
tags: ["swift","ios"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "swift ios xcode project target scheme configuration"
---

## ios-swift

### Purpose
This skill equips the AI to assist with Swift-based iOS development, focusing on UIKit and SwiftUI fundamentals, concurrency patterns, and Xcode project management for efficient app building.

### When to Use
- When generating code for iOS UI components, such as creating views in UIKit or SwiftUI.
- For handling asynchronous operations in iOS apps, like network requests or timers.
- When structuring or modifying Xcode projects, including targets and schemes for multi-app configurations.
- In debugging scenarios involving Swift errors or Xcode build issues.

### Key Capabilities
- Generate UIKit code for basic views: e.g., creating a UIViewController subclass with lifecycle methods.
- Build SwiftUI interfaces: e.g., defining structs that conform to the View protocol for declarative layouts.
- Implement Swift concurrency: using async/await for tasks like API calls, ensuring thread safety.
- Manage Xcode structures: defining targets for app extensions, schemes for build configurations, and handling project files like .xcodeproj.

### Usage Patterns
- Start by importing necessary frameworks: always begin Swift files with `import UIKit` or `import SwiftUI`.
- For concurrency, wrap blocking operations in async functions: define a function as `func fetchData() async -> Data { ... }` and call it via `Task { await fetchData() }`.
- When working with Xcode, reference project files directly: use paths like `./MyApp.xcodeproj` and specify targets in commands.
- Integrate patterns sequentially: first set up a project structure, then add UI elements, and finally handle concurrency to avoid deadlocks.

### Common Commands/API
- Xcode CLI: Use `xcodebuild -workspace MyWorkspace.xcworkspace -scheme MyScheme -configuration Debug build` to compile a project; add `-sdk iphonesimulator` for simulator testing.
- SwiftUI API: Create a basic view with `struct MyView: View { var body: some View { Text("Hello").padding() } }`; render it in an app entry point.
- UIKit API: Initialize a view controller like `let vc = UIViewController(); vc.view.backgroundColor = .white; present(vc, animated: true)`.
- Code snippet for concurrency: 
  ```swift
  func loadImage() async throws -> UIImage {
      let data = try await URLSession.shared.data(from: URL(string: "https://example.com/image")!)
      return UIImage(data: data.0) ?? UIImage()
  }
  ```
- Config formats: Edit Xcode schemes via the GUI or .pbxproj files; for example, add a build setting in the scheme editor like "GCC_PREPROCESSOR_DEFINITIONS = DEBUG=1".

### Integration Notes
- Require Xcode installation; check for it via `xcode-select -p` and set $XCODE_PATH environment variable if custom (e.g., export XCODE_PATH=/Applications/Xcode.app).
- For Apple services like App Store Connect, use $APPLE_API_KEY for authentication in scripts: e.g., pass it to tools via `altool --upload-app -f myapp.ipa -u user@email.com -p $APPLE_API_KEY`.
- Integrate with other tools: Use Swift Package Manager by adding dependencies in Package.swift, like `.package(url: "https://github.com/apple/swift-algorithms", from: "1.0.0")`.
- For testing, link to iOS simulators: Specify device in commands like `xcodebuild test -scheme MyScheme -destination 'platform=iOS Simulator,name=iPhone 14'`.

### Error Handling
- In Swift, use try-catch for throwable errors: `do { let data = try await fetchData() } catch let error { print("Error: \(error.localizedDescription)") }` to handle async failures.
- For Xcode builds, parse output from `xcodebuild` for common errors: e.g., if "Code Sign error: No matching provisioning profile found", ensure profiles are set via `xcodebuild -exportArchive -archivePath build/MyApp.xcarchive -exportPath output -exportOptionsPlist ExportOptions.plist`.
- Check concurrency errors: Use `Task` with cancellation, like `let task = Task { try await function() }; task.cancel()` to avoid leaks.
- Debug UI issues: In UIKit, override `viewDidLoad` to log errors; in SwiftUI, use `.onAppear { print("View appeared") }` to trace lifecycle problems.

### Concrete Usage Examples
1. Create a simple SwiftUI view for an iOS app: First, generate a new Swift file with `struct ContentView: View { var body: some View { VStack { Text("Welcome").font(.title) Button("Tap") { print("Tapped") } } } }`; then integrate it into an Xcode project by adding it to the main App struct and building with `xcodebuild -scheme MyApp build`.
2. Set up a new target in an existing Xcode project: Use the Xcode GUI to add a target (e.g., App Extension), or script it by editing .xcodeproj/project.pbxproj to add a new PBXNativeTarget entry; then build specifically for that target with `xcodebuild -target MyExtensionTarget -configuration Release`.

### Graph Relationships
- Related to cluster: mobile (e.g., shares iOS ecosystem knowledge).
- Links to: mobile-android (for cross-platform mobile development), general-swift (for broader Swift language features), ios-testing (for XCTest integration).
