---
name: ios-frameworks
cluster: mobile
description: "CoreData/SwiftData, CoreML, ARKit, CloudKit, StoreKit 2, HealthKit, CoreLocation, APNs push"
tags: ["coredata","coreml","arkit","cloudkit","storekit","ios"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "coredata coreml arkit cloudkit storekit healthkit ios frameworks swiftdata"
---

# ios-frameworks

## Purpose
This skill equips the AI to assist with iOS app development using Apple's core frameworks, focusing on data management, ML integration, AR experiences, cloud syncing, in-app purchases, health tracking, location services, and push notifications.

## When to Use
Use this skill for apps requiring local data persistence (e.g., user profiles), integrating ML models for predictions, building AR overlays, syncing data to iCloud, handling purchases, accessing health data, tracking user locations, or sending push notifications. Apply it in scenarios like e-commerce apps with payments, fitness trackers, or AR games.

## Key Capabilities
- **CoreData/SwiftData**: Manages persistent object graphs; SwiftData offers a modern SwiftUI-friendly alternative for data modeling and storage.
- **CoreML**: Runs on-device ML models for tasks like image recognition; supports models from Create ML or TensorFlow.
- **ARKit**: Enables AR sessions for plane detection, object tracking, and world mapping using device's camera and sensors.
- **CloudKit**: Provides iCloud-based storage and databases for syncing user data across devices via CKContainer and CKRecord.
- **StoreKit 2**: Handles in-app purchases and subscriptions with SKProduct and SKPayment APIs for monetization.
- **HealthKit**: Accesses health and fitness data like steps or heart rate via HKHealthStore, requiring user permissions.
- **CoreLocation**: Delivers location updates and geofencing using CLLocationManager for apps needing real-time positioning.
- **APNs Push**: Sends remote notifications through Apple's Push Notification service using device tokens and APNs provider API.

## Usage Patterns
To use CoreData, initialize a persistent container in AppDelegate and perform fetches in view controllers. For ARKit, start an AR session in a UIViewController subclass and handle anchor updates. Integrate CoreML by loading a .mlmodel file and running predictions in response to user input. Pattern for CloudKit: Use CKDatabase to save records and subscribe to changes. For StoreKit 2, request products and process transactions in a payment queue observer. Access HealthKit by querying HKSampleType after requesting authorization. Use CoreLocation by configuring CLLocationManager delegates for updates. For APNs, register for remote notifications and handle incoming payloads in AppDelegate.

## Common Commands/API
- **CoreData Setup**: In AppDelegate.swift, create a persistent container:  
  `let container = NSPersistentContainer(name: "MyApp")`  
  `container.loadPersistentStores { ... }`
- **CoreML Prediction**: Load and predict with:  
  `let model = MyModel()  
  let input = MyModelInput(...)  
  let output = try model.prediction(input: input)`
- **ARKit Session**: In a view controller:  
  `let session = ARSession()  
  session.delegate = self  
  session.run(ARWorldTrackingConfiguration())`
- **CloudKit Record Save**: Using CKDatabase:  
  `let record = CKRecord(recordType: "MyType")  
  record["field"] = "value"  
  database.save(record) { ... }`
- **StoreKit 2 Purchase**: Request and buy:  
  `let request = SKProductsRequest(productIdentifiers: ["com.example.product"])  
  request.start()  // In delegate, handle products and SKPayment`
- **HealthKit Query**: Authorize and query:  
  `healthStore.requestAuthorization { ... }  
  let query = HKSampleQuery(sampleType: HKQuantityType(...), ...) { ... }`
- **CoreLocation Updates**: Start monitoring:  
  `locationManager.requestWhenInUseAuthorization()  
  locationManager.startUpdatingLocation()`
- **APNs Registration**: In AppDelegate:  
  `UNUserNotificationCenter.current().requestAuthorization { ... }  
  application.registerForRemoteNotifications()`

## Integration Notes
Add frameworks via Xcode: Select target > General > Frameworks, Libraries, and Embedded Content, then add CoreData.framework, etc. For permissions, update Info.plist (e.g., NSLocationWhenInUseUsageDescription for CoreLocation). Use environment variables for keys like `$CLOUDKIT_API_KEY` in scripts or configs. For CloudKit, enable iCloud capability in Xcode and set up a container in the developer portal. Import modules in code (e.g., `import CoreData`). For APNs, generate a certificate in Apple Developer portal and use it with your server. Config format: In entitlements file, add iCloud capabilities like `com.apple.developer.icloud-container-identifiers`. Ensure SwiftData compatibility by targeting iOS 17+.

## Error Handling
For CoreData, catch NSPersistentStoreCoordinator errors during setup (e.g., `catch let error as NSError { print(error.localizedDescription) }`). In CoreML, handle prediction errors with `do { try model.prediction(...) } catch { print(error) }`. ARKit sessions may throw ARSession.RunOptions errors; check session state in delegate methods. CloudKit operations use CKError; handle with `if case .partialFailure(let errors) = error { ... }`. StoreKit errors from SKPaymentTransaction include codes like .paymentCancelled; observe queue for failures. HealthKit authorization failures require UI prompts; check `error as HKErrorCode`. CoreLocation errors via delegate's `didFailWithError`; use error codes for debugging. For APNs, handle registration errors in AppDelegate's `didFailToRegisterForRemoteNotificationsWithError`.

## Concrete Usage Examples
1. **Example: Building a CoreData-based To-Do App**  
   Set up CoreData in a new project: Create a data model in Xcode, then in ViewController.swift, fetch items with:  
   `let fetchRequest: NSFetchRequest<Item> = Item.fetchRequest()  
   do { let items = try context.fetch(fetchRequest) } catch { ... }`  
   Save a new item: `let newItem = Item(context: context); newItem.name = "Task"; try context.save()`.
   
2. **Example: Integrating ARKit for Object Detection**  
   In a ARViewController, configure for object detection:  
   `let configuration = ARWorldTrackingConfiguration()  
   configuration.detectionImages = Set([ARReferenceImage(...)] )  
   session.run(configuration)`  
   Handle detection in `session(_:didUpdate:)` delegate to overlay UI elements.

## Graph Relationships
- Related to: mobile cluster (e.g., android-frameworks for cross-platform insights).
- Depends on: authentication skills for APNs and CloudKit (uses $APNS_TOKEN).
- Integrates with: backend skills for CloudKit syncing.
- Conflicts with: non-Apple ecosystems, but can link to web-api skills for hybrid apps.
