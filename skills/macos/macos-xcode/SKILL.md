---
name: macos-xcode
cluster: macos
description: "Xcode: CLI tools, simulators, signing, provisioning profiles, xcrun, xcodebuild, Instruments"
tags: ["xcode","ios","macos","build","signing"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "xcode ios build simulator signing certificate provisioning xcrun"
---

# macos-xcode

## Purpose
This skill equips the AI to handle Xcode-related tasks on macOS, focusing on building, testing, and deploying iOS/macOS applications using command-line tools. It covers core functionalities like code signing, simulator management, and profiling to automate development workflows.

## When to Use
Use this skill for tasks involving iOS app compilation, simulator testing, or provisioning profile management. Apply it in CI/CD pipelines for macOS builds, when debugging with Instruments, or for automating xcodebuild processes. Avoid it for non-Apple platforms or GUI-only Xcode interactions.

## Key Capabilities
- Execute xcodebuild commands for building, archiving, and testing projects.
- Manage simulators via xcrun simctl, including booting devices and installing apps.
- Handle code signing with security commands, provisioning profiles, and certificates.
- Profile applications using Instruments for performance analysis.
- Query Xcode installations with xcrun to locate tools and SDKs.
- Automate workflows for iOS/macOS apps, including scheme selection and configuration management.
- Integrate with macOS keychain for secure handling of signing identities.

## Usage Patterns
Always run commands in a macOS environment with Xcode installed. Prefix xcodebuild/xcrun calls with checks for Xcode availability, e.g., verify `$xcode-select -p` outputs a valid path. Use in AI responses by generating bash scripts that wrap these commands, ensuring error redirection (e.g., `> output.log 2>&1`). For automation, embed in Python scripts via subprocess: import subprocess and call `subprocess.run(['xcodebuild', '-list'])`. Handle paths dynamically, using environment variables like `$DEVELOPER_DIR` to point to Xcode installations.

## Common Commands/API
- Build a project: `xcodebuild -project MyApp.xcodeproj -scheme MyScheme -configuration Release build`
- List schemes: `xcodebuild -list` (use output to parse available schemes in scripts).
- Boot simulator: `xcrun simctl boot "iPhone 15"`; followed by `xcrun simctl install booted MyApp.ipa`
- Code signing: `xcodebuild -exportArchive -archivePath MyApp.xcarchive -exportPath output.ipa -exportOptionsPlist ExportOptions.plist` (create ExportOptions.plist with {"method": "app-store"}).
- Run Instruments: `instruments -w "iPhone 15" -t Time Profiler MyApp`
- Query tools: `xcrun --find xcodebuild` to get the path; use in code: `path = subprocess.check_output(['xcrun', '--find', 'xcodebuild']).decode().strip()`
- Provisioning profiles: Use `security find-identity -v -p codesigning` to list certificates, then specify in xcodebuild via `-signingIdentity "iPhone Developer: Name (ID)"`.

## Integration Notes
Integrate by setting up environment variables for sensitive data, e.g., use `$XCODE_SIGNING_IDENTITY` for code signing identities. For CI/CD, ensure Xcode is installed via `xcode-select --install` and set `$DEVELOPER_DIR=/Applications/Xcode.app`. When combining with other skills, pipe outputs (e.g., from macos-core for file ops). For API-like interactions, wrap xcrun/xcodebuild in RESTful services, but use env vars like `$APPLE_DEVELOPER_KEY` if accessing Apple services. Always check for Xcode version compatibility, e.g., require >=14.0 for certain simctl features.

## Error Handling
Check for common errors like "Code Sign error: No matching provisioning profile found" by verifying profiles with `security cms -D -i profile.mobileprovision`; fix by running `xcodebuild -fixit` or updating ExportOptions.plist. For simulator issues (e.g., "Device not booted"), use `xcrun simctl list devices` to check status and boot via script: if device not booted, run `xcrun simctl boot <udid>`. Handle xcodebuild failures by parsing exit codes (e.g., code 65 for build errors) and log outputs. Use try-except in scripts: try: subprocess.run([...]) except subprocess.CalledProcessError as e: print(e.output). Always include `--verbose` flag for detailed logs.

## Concrete Usage Examples
### Example 1: Build and Archive an iOS App
To build and archive a project, first ensure Xcode is selected: `xcode-select -s /Applications/Xcode.app`. Then run:  
```bash
xcodebuild -workspace MyApp.xcworkspace -scheme MyScheme -configuration Release archive -archivePath build/MyApp.xcarchive
xcodebuild -exportArchive -archivePath build/MyApp.xcarchive -exportPath output -exportOptionsPlist options.plist
```
This outputs an IPA file; use in AI responses to automate app packaging for testing.

### Example 2: Launch Simulator and Install App
To test on a simulator, boot a device and install an app:  
```bash
xcrun simctl boot "iPhone 15"
xcrun simctl install booted MyApp.ipa
xcrun simctl launch booted com.example.MyApp
```
Monitor via `xcrun simctl status booted`; integrate this into AI workflows for automated UI testing.

## Graph Relationships
- Connected to: macos (cluster), due to shared macOS dependencies.
- Related to: ios (tag), for overlapping iOS build processes.
- Links with: build (tag), for integration with other build tools.
- Associated with: signing (tag), for certificate management in related skills.
- Overlaps with: xcode (tag), as a core component in macOS development ecosystems.
