---
name: ios
cluster: mobile
description: "iOS root: SDK, app lifecycle scene-based, permissions NSUsageDescription, HIG guidelines"
tags: ["ios","apple","sdk"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "ios sdk app lifecycle permissions apple scene human interface"
---

# ios

## Purpose
This skill handles core iOS development tasks using Apple's SDK, focusing on app lifecycle management (scene-based), permissions via NSUsageDescription in Info.plist, and adherence to Human Interface Guidelines (HIG) for UI/UX consistency.

## When to Use
- Building native iOS apps with Swift or Objective-C.
- Managing app states in scene-based architectures (e.g., iOS 13+).
- Requesting user permissions like camera or location.
- Ensuring apps follow HIG for accessibility and design standards.
- Integrating iOS-specific features in cross-platform projects.

## Key Capabilities
- Access iOS SDK components like UIKit and SwiftUI for UI building.
- Handle scene-based lifecycle events (e.g., sceneDidBecomeActive).
- Manage permissions by adding keys to Info.plist (e.g., NSCameraUsageDescription).
- Enforce HIG through practices like adaptive layouts and voiceover support.
- Support for Xcode tools and Apple ecosystem integration.

## Usage Patterns
- Start by setting up an Xcode project: Use `xcodegen` or create via Xcode UI, then add dependencies via Swift Package Manager.
- For app lifecycle, implement UISceneDelegate methods in your scene manifest.
- To handle permissions, edit Info.plist directly or via Xcode's property list editor, adding strings for each usage description.
- Follow HIG by using Auto Layout constraints and testing with Accessibility Inspector.
- Test apps on simulators or devices using Xcode's build scheme: Select device, then run `xcodebuild -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 14' build`.

## Common Commands/API
- **CLI Commands**: Use `xcodebuild` for building: `xcodebuild -workspace MyApp.xcworkspace -scheme MyApp clean build`. For archiving: `xcodebuild -scheme MyApp -configuration Release archive`.
- **API Endpoints**: Not applicable for direct endpoints; use iOS APIs like `AVCaptureDevice.requestAccess(for: .video)` for camera permission.
- **Code Snippets**:
  - Request camera permission:
    ```
    import AVFoundation
    AVCaptureDevice.requestAccess(for: .video) { granted in
        if granted { print("Access granted") } else { print("Denied") }
    }
    ```
  - Handle scene lifecycle in SceneDelegate.swift:
    ```
    func sceneDidBecomeActive(_ scene: UIScene) {
        // Resume tasks, e.g., start timers
    }
    func sceneWillResignActive(_ scene: UIScene) {
        // Pause tasks
    }
    ```
  - Add permission to Info.plist (XML format):
    ```
    <key>NSCameraUsageDescription</key>
    <string>This app uses the camera for photo capture.</string>
    ```
- **Config Formats**: Use Info.plist for permissions (key-value pairs) or entitlements files for capabilities like iCloud (e.g., `<key>com.apple.security.application-groups</key><string>group.com.example</string>`).

## Integration Notes
- Integrate with other tools by linking via Xcode: Add pods with CocoaPods (`pod install`) or packages in Package.swift.
- For Apple services like App Store Connect, use environment variables for API keys: Set `$APPLE_API_KEY` and reference in scripts (e.g., `xcrun altool --upload-app --file MyApp.ipa --username $APPLE_USERNAME --password $APPLE_API_KEY`).
- When combining with Android (via mobile cluster), use shared configs but handle iOS-specific code in conditional blocks (e.g., `#if os(iOS)` in Swift).
- For CI/CD, integrate with GitHub Actions: Use `actions/checkout` then run `xcodebuild` in a macOS runner.
- If using third-party SDKs, add them via Swift Package Manager: Edit Package.swift and resolve with `swift package resolve`.

## Error Handling
- For permission denials, check status with `AVAuthorizationStatus.authorized` and prompt users via UIAlertController if needed.
- Handle build errors from `xcodebuild` by parsing output: Look for "Command PhaseScriptExecution failed" and fix scripts; use `xcodebuild -verbose` for details.
- For lifecycle issues, add logging in delegate methods (e.g., `print("Scene error: \(error)")` in sceneWillEnterForeground).
- Common fixes: If Info.plist keys are missing, Xcode will error on build; add them via the project editor. For HIG violations, use Xcode's accessibility audit tool and resolve warnings.
- Use try-catch for API calls: e.g., `do { try AVAudioSession.sharedInstance().setCategory(.playAndRecord) } catch { print(error.localizedDescription) }`.

## Usage Examples
- **Example 1: Basic App with Camera Permission**
  Create a new Xcode project, add NSCameraUsageDescription to Info.plist, and implement permission request in ViewController.swift:
  ```
  import UIKit
  import AVFoundation
  class ViewController: UIViewController {
      override func viewDidLoad() { super.viewDidLoad(); requestCamera() }
      func requestCamera() { AVCaptureDevice.requestAccess(for: .video) { granted in if granted { /* Proceed */ } } }
  }
  ```
  Build and run with `xcodebuild -scheme MyApp build` to test on simulator.

- **Example 2: Managing App Lifecycle**
  In a scene-based app, handle state changes in SceneDelegate.swift:
  ```
  import UIKit
  class SceneDelegate: UIResponder, UIWindowSceneDelegate {
      func sceneDidBecomeActive(_ scene: UIScene) { print("App active") }
      func sceneWillEnterForeground(_ scene: UIScene) { /* Reload data */ }
  }
  ```
  Use `xcodebuild test` to verify lifecycle events during app testing.

## Graph Relationships
- Related to: mobile (cluster), as it shares mobile development patterns.
- Connected to: android (skill), via cross-platform mobile integration.
- Links with: apple-ecosystem (tag), for broader Apple services.
- Associated with: sdk-tools (implied), for shared SDK usage in iOS context.
