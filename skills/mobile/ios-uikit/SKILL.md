---
name: ios-uikit
cluster: mobile
description: "UIKit: UIViewController, UITableView/CollectionView, Auto Layout, programmatic UI, UIHostingController bridge"
tags: ["uikit","ios","viewcontroller","autolayout"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "uikit viewcontroller tableview autolayout programmatic swiftui bridge"
---

# ios-uikit

## Purpose
This skill equips the AI to assist in iOS app development using UIKit, focusing on building and managing user interfaces with UIViewController, UITableView/CollectionView, Auto Layout, programmatic UI creation, and bridging to SwiftUI via UIHostingController.

## When to Use
Use this skill for iOS projects needing custom views, lists, or layouts without storyboards; ideal for programmatic UI in Swift apps, integrating UIKit with SwiftUI, or handling dynamic content in UITableView; avoid if using SwiftUI exclusively or for non-iOS platforms.

## Key Capabilities
- Manage UIViewController lifecycle: Implement viewDidLoad, viewWillAppear for setup and updates.
- Handle UITableView/CollectionView: Set up data sources, delegates, and cell reuse for efficient list rendering.
- Apply Auto Layout programmatically: Use NSLayoutConstraint to define layouts dynamically, ensuring adaptability to device sizes.
- Create programmatic UI: Build views using UIView subclasses and add subviews via code, bypassing Interface Builder.
- Bridge to SwiftUI: Use UIHostingController to embed SwiftUI views in UIKit apps for mixed architecture support.

## Usage Patterns
To create a UIViewController subclass, define a new class inheriting from UIViewController and override key methods; for example, in a new file, write:
```swift
import UIKit

class MyViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
    }
}
```
For UITableView, implement UITableViewDataSource: Set the data source, define numberOfRowsInSection, and cellForRowAt; ensure to register cell classes like this:
```swift
let tableView = UITableView(frame: view.bounds)
tableView.dataSource = self
tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")
```
When using Auto Layout, add constraints programmatically: Use anchors for positioning, e.g., pin a button to the center:
```swift
let button = UIButton()
view.addSubview(button)
button.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
```
For UIHostingController bridge, embed a SwiftUI view: Create an instance and set it as the root view controller:
```swift
let hostingController = UIHostingController(rootView: MySwiftUIView())
present(hostingController, animated: true)
```
Always use weak references in delegates to avoid retain cycles, and test on different devices for layout responsiveness.

## Common Commands/API
Key APIs include UIViewController methods like viewDidLoad() for initial setup; for UITableView, use tableView.reloadData() to refresh content. To add Auto Layout constraints, employ NSLayoutConstraint.activate() with an array. Example CLI for building in Xcode: `xcodebuild -scheme MyApp -configuration Debug`. For programmatic UI, use UIView.addSubview() and set frames or constraints. Config format for Info.plist might include UIRequiredDeviceCapabilities for device checks. Auth isn't directly required, but if integrating with services, use env vars like `$API_KEY` in build scripts. Specific pattern: Export as `export API_KEY=your_key` before running `xcodebuild`. Common endpoints aren't applicable here, but for network calls in UIKit, use URLSession with delegates. Code snippet for basic URLSession:
```swift
let session = URLSession.shared
let task = session.dataTask(with: URL(string: "https://example.com")!) { data, response, error in
    // Handle response
}
task.resume()
```
For error-free Auto Layout, always call layoutIfNeeded() after updates.

## Integration Notes
Integrate this skill by importing UIKit in Swift files; for SwiftUI bridges, ensure SwiftUI is also imported. When combining with other frameworks, use UIHostingController to wrap SwiftUI views and add as child view controllers. For config, set up in AppDelegate or SceneDelegate, e.g., in application(_:didFinishLaunchingWithOptions:), instantiate and present view controllers. If using pods, add via Podfile: `pod 'SomeUIKitLib'` and run `pod install`. Test integrations in a simulator with `xcrun simctl boot "iPhone 14"` to launch devices. For env vars, reference like `let key = ProcessInfo.processInfo.environment["API_KEY"]` in code. Ensure all views are added to the view hierarchy before applying constraints.

## Error Handling
Handle common errors like Auto Layout conflicts by using visual format language or anchors correctly; debug with Xcode's Debug View Hierarchy. For UITableView, catch data source errors by implementing didSelectRowAt and checking indices. Use try-catch for runtime issues, e.g., in URLSession callbacks, check for errors: 
```swift
if let error = error {
    print("Error: \(error.localizedDescription)")
    return
}
```
For UIViewController, override didReceiveMemoryWarning to release resources. Log errors with os_log or print for debugging, and use guard statements for nil checks in delegates.

## Graph Relationships
- Related to cluster: mobile (e.g., shares tags with android-jetpack for cross-platform UI patterns).
- Connected via tags: uikit (links to swiftui for bridging), ios (connects to xcode-build for development workflows), viewcontroller (relates to navigation-stack for app flow), autolayout (ties to responsive-design for adaptive UIs).
