---
name: ios-swiftui
cluster: mobile
description: "SwiftUI: View, modifiers, @State/@Binding/@ObservedObject, @EnvironmentObject, animations, NavigationStack"
tags: ["swiftui","ios","views","state"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "swiftui view state binding observable animation navigation list sheet"
---

# ios-swiftui

## Purpose
This skill provides expertise in SwiftUI for building declarative UIs in iOS apps, focusing on views, state management, animations, and navigation to streamline development.

## When to Use
Use this skill for iOS projects requiring responsive interfaces, such as apps with dynamic content, user interactions, or complex navigation; ideal for new iOS apps (iOS 13+), prototyping, or migrating from UIKit.

## Key Capabilities
- Create and modify views using structs that conform to the View protocol.
- Manage state with @State for local changes, @Binding for parent-child communication, @ObservedObject for external models, and @EnvironmentObject for app-wide data.
- Implement animations via withAnimation{} and modifiers like .animation(.easeIn).
- Handle navigation with NavigationStack, including stacks, lists, and sheets for multi-screen flows.

## Usage Patterns
To build a SwiftUI view, define a struct conforming to View and use modifiers in the body; for state, wrap variables with @State and update via functions. Pattern: Use @EnvironmentObject for shared data by injecting via .environmentObject() in the app's root view. For lists, apply List{} with ForEach{} for dynamic content. Always preview views with #Preview{} for rapid iteration. To handle sheets, use .sheet(isPresented: $isShowing) {} on a View.

## Common Commands/API
Use @State for local state: `@State private var count: Int = 0` then increment with `Button("Tap") { count += 1 }`.
Apply modifiers like `.padding()` or `.foregroundColor(.blue)` directly on views, e.g., `Text("Hello").padding().background(.yellow)`.
For animations, wrap changes: `withAnimation { self.isAnimating.toggle() }` on a view with `.animation(.default)`.
Navigation example: `NavigationStack { List(items, id: \.id) { item in NavigationLink { DetailView(item: item) } } }`.
Config format: In Xcode, ensure SwiftUI is selected in project settings; import SwiftUI in files.

## Integration Notes
Integrate SwiftUI into an existing iOS project by adding a SwiftUI view to a UIKit app via UIHostingController; set up in code like `let hostingController = UIHostingController(rootView: MySwiftUIView())`. For app-wide objects, pass via .environmentObject() in the @main App struct, e.g., `@main struct App: App { var body: some Scene { WindowGroup { ContentView().environmentObject(MyModel()) } } }`. If API keys are needed (e.g., for networking), load from env vars like `let apiKey = ProcessInfo.processInfo.environment["MY_API_KEY"]` and handle in your observed objects. Ensure iOS deployment target is 13.0+ in Xcode project settings.

## Error Handling
Handle state-related errors by ensuring @State updates occur on the main thread; use DispatchQueue.main.async for async updates, e.g., `DispatchQueue.main.async { self.data = newData }`. For navigation issues, check NavigationStack paths and use .onAppear{} to validate state, e.g., `onAppear { if path.isEmpty { path.append("home") } }`. Common errors: "Cannot use instance member" – fix by making variables @State; log errors with print() or os_log for debugging. If bindings fail, verify the wrapped value is correctly passed, e.g., in child views.

## Concrete Usage Examples
Example 1: Simple counter view – Create a view with @State: `struct CounterView: View { @State var count: Int = 0 var body: some View { VStack { Text("Count: \(count)") Button("Increment") { count += 1 } } } }`. Use in app: `ContentView().environment(\.colorScheme, .dark)`.
Example 2: Navigation with list – Build a list view: `struct ItemList: View { @State var items = [1,2,3] var body: some View { NavigationStack { List(items, id: \.self) { item in Text("Item \(item)") } .navigationTitle("Items") } } }`. Integrate by presenting: `ItemList().sheet(isPresented: $showSheet) { DetailView() }`.

## Graph Relationships
- Related to cluster: mobile (e.g., shares dependencies with android-kotlin skill).
- Links to: swift (for core language features), ios-core (for foundational iOS APIs).
- Dependencies: Requires xcode-tools for building; integrates with firebase-ios for backend services.
