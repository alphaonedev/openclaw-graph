---
name: testing-mobile
cluster: testing
description: "Mobile: XCUITest, Espresso, Detox, Maestro, BrowserStack/Sauce Labs/Firebase Test Lab, screenshots"
tags: ["mobile-test","xctest","espresso","detox","testing"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "mobile test xctest espresso detox browserstack screenshot device farm"
---

# testing-mobile

## Purpose
This skill automates mobile app testing using frameworks like XCUITest for iOS, Espresso for Android, Detox for end-to-end, Maestro for flows, and cloud services like BrowserStack, Sauce Labs, or Firebase Test Lab. It focuses on UI testing, device compatibility, and screenshot capture to ensure app reliability across platforms.

## When to Use
Use this skill when building or maintaining iOS/Android apps and needing to run UI tests, verify interactions, or test on real devices. Apply it in CI/CD pipelines for regression testing, before releases, or when debugging UI issues on specific devices like iPhone 14 or Pixel 6.

## Key Capabilities
- XCUITest: Write UI tests for iOS using XCTest framework.
- Espresso: Automate Android UI tests with precise interactions.
- Detox: Perform end-to-end tests on iOS/Android with flaky test handling.
- Maestro: Define test flows via YAML for cross-platform mobile testing.
- Cloud integration: Run tests on BrowserStack/Sauce Labs/Firebase Test Lab for parallel execution on real devices.
- Screenshots: Capture and compare screenshots for visual regression testing.
- Device farms: Access emulators/simulators or real devices via APIs.

## Usage Patterns
To accomplish tasks, structure tests as follows: Write test scripts in Swift/Kotlin/JavaScript, configure environments with device specs, and run via CLI or APIs. For local testing, use simulators; for scale, upload to cloud services. Always set up dependencies like Xcode for iOS or Android SDK first. Example pattern: Initialize tests, perform actions, assert results, and handle cleanups.

## Common Commands/API
Use these exact commands for testing:

- XCUITest (iOS): Run tests with `xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 14' -only-testing:MyAppTests`. Pass env vars for keys like `$XCUITEST_API_KEY`.
  
  Code snippet:
  ```
  import XCTest
  class MyAppTests: XCTestCase {
      func testButtonTap() { /* assertions */ }
  }
  ```

- Espresso (Android): Execute via Gradle: `./gradlew connectedAndroidTest --tests com.example.MyTest`. Use flags like `--stacktrace` for debugging.

  Code snippet:
  ```
  import androidx.test.espresso.Espresso;
  Espresso.onView(withId(R.id.my_button)).perform(click());
  ```

- Detox: Build and run with `detox build -c ios.sim.release` then `detox test -c ios.sim.release`. Configure in `package.json` for scripts.

  Code snippet:
  ```
  describe('Login', () => {
      it('should login', async () => { await element(by.id('username')).typeText('user'); });
  });
  ```

- Maestro: Run flows with `maestro test my-flow.yml`. YAML format: `appId: com.example.app` and `steps: - launchApp`.

- BrowserStack: Upload and run via API: POST to `https://api-cloud.browserstack.com/app-automate/espresso/v2` with JSON payload, using `$BROWSERSTACK_ACCESS_KEY` in headers.

- Sauce Labs: Use `sc run --device "iPhone 14" --app myapp.ipa` or API endpoint: `POST https://api.us-west-1.saucelabs.com/v1/{username}/jobs` with auth header `Authorization: Basic $SAUCE_ACCESS_KEY`.

- Firebase Test Lab: Run with `gcloud firebase test android run --app myapp.apk --test mytest.apk --device model=shiba`, requiring `$GOOGLE_APPLICATION_CREDENTIALS` env var.

## Integration Notes
Integrate by adding dependencies: For XCUITest, ensure Xcode is installed; for Espresso, include in `build.gradle`. Set env vars like `$BROWSERSTACK_USERNAME` and `$BROWSERSTACK_ACCESS_KEY` for cloud auth. Use config files: e.g., `detox.config.js` with `{ configurations: { 'ios.sim.debug': { device: 'iPhone 14' } } }`. In CI/CD (e.g., GitHub Actions), add steps like `run: detox test` and handle artifacts for screenshots. For parallel runs, specify matrices in your workflow.

## Error Handling
Handle errors prescriptively: For XCUITest, if "No such device" occurs, check destination string and ensure simulator is booted via `xcrun simctl boot iPhone 14`. For Espresso, if tests fail due to timeouts, add `.withTimeout(5000)` in code. Detox flaky tests: Use `await waitFor(element).toBeVisible();`. For cloud services, if auth fails (e.g., 401 from BrowserStack), verify `$BROWSERSTACK_ACCESS_KEY` and retry. Parse API responses for errors, e.g., check HTTP status codes and log details. Common fix: Update dependencies or device profiles in configs.

## Concrete Usage Examples
1. **Run XCUITest on local simulator:** Write a test for button click, then execute: `xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 14'`. Ensure your test file has: `func testExample() { XCTAssertTrue(app.buttons["Submit"].exists) }`. This verifies UI elements quickly.

2. **Upload and run tests on BrowserStack:** First, set env vars: `export BROWSERSTACK_ACCESS_KEY=your_key`. Then, use cURL: `curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" -X POST https://api-cloud.browserstack.com/app-automate/espresso/v2 -d '{"app": "bs://..."}'`. This runs tests on real devices for comprehensive coverage.

## Graph Relationships
- Related to: testing-general (shares testing cluster)
- Depends on: authentication-service (for API keys like $BROWSERSTACK_ACCESS_KEY)
- Integrates with: mobile-development (for app builds)
- Conflicts with: none
- Extends: device-farm-management (via cloud testing)
