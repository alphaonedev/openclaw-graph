---
name: unreal-engine
cluster: game-dev
description: "Unreal Engine is a cross-platform game engine for creating high-fidelity 3D games and simulations using C++ and Blueprin"
tags: ["unreal-engine","game-development","3d-rendering"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "unreal engine game development 3d rendering blueprints c++"
---

## unreal-engine

### Purpose
This skill enables the AI to assist with Unreal Engine development, focusing on creating 3D games and simulations using C++ and Blueprints for cross-platform projects.

### When to Use
Use this skill for high-fidelity 3D game development, such as building multiplayer games, simulations, or VR experiences; when projects require advanced rendering, physics, or AI behaviors; or when integrating C++ with visual scripting for rapid prototyping.

### Key Capabilities
- Cross-platform building with C++ and Blueprints: Supports Windows, macOS, Linux, and consoles via Unreal Build Tool (UBT).
- 3D rendering and physics: Leverage Niagara for visual effects or PhysX for simulations, e.g., using `UPrimitiveComponent::SetSimulatePhysics(true);` to enable physics on an object.
- Asset management: Handle blueprints (.uasset files) and C++ classes, with config in .ini files like Engine.ini for settings such as `r.DefaultFeature.AutoExposure=True`.
- Multi-threaded performance: Use async tasks via `AsyncTask(ENamedThreads::GameThread, [](){ /* code */ });` for background operations.
- Integration with tools: Embed with Git for version control or external APIs via HTTP requests in Blueprints.

### Usage Patterns
To start a project, generate a new Unreal project using UBT, then write C++ code or Blueprints for game logic. For C++ patterns, extend UCLASS objects and override methods; for Blueprints, create event graphs linked to actors. Always use the Editor for iterative testing: launch via `UnrealEditor.exe MyProject.uproject`, then compile changes with `UnrealBuildTool.exe`. Pattern for error-prone tasks: wrap code in try-catch for UObject operations and log via `UE_LOG(LogTemp, Warning, TEXT("Message"));`.

### Common Commands/API
- UBT CLI commands: Build projects with `UnrealBuildTool.exe -project=Path/To/Project.uproject -target=MyGame -configuration=Development -platform=Win64`; clean builds using `-clean`.
- Editor commands: Run from command line with `UnrealEditor.exe -game -log` to launch in play mode with logging.
- C++ API snippets: Spawn an actor with `AActor* Actor = GetWorld()->SpawnActor<AActor>(AActor::StaticClass(), FVector(0,0,0), FRotator::ZeroRotator);`; access components via `UStaticMeshComponent* MeshComp = Actor->FindComponentByClass<UStaticMeshComponent>();`.
- Blueprint API: In Blueprints, use nodes like "Get Actor Location" followed by "Set Actor Location" to move objects; equivalent code: `FVector NewLocation = Actor->GetActorLocation() + FVector(1,0,0); Actor->SetActorLocation(NewLocation);`.
- Config formats: Edit .ini files for settings, e.g., in DefaultEngine.ini: `[Core.System] AllowCommandLineAudioDeviceSelection=True`; load configs in code with `GConfig->GetFloat(TEXT("Section.Key"), Value, GEngineIni);`.

### Integration Notes
Integrate Unreal Engine into workflows by installing via Epic Games Launcher (requires an Epic account; use env var `$EPIC_API_KEY` for authenticated downloads if scripting automation). For external tools, link libraries in Build.cs files, e.g., add `PublicDependencyModuleNames.Add("Core");` in MyProject.Build.cs. When embedding with other skills, chain with "game-dev" cluster tools: pass outputs from a C++ compiler skill to UBT. Use environment variables for paths, like `$UNREAL_ENGINE_PATH` for the root directory, and set in scripts as `export UNREAL_ENGINE_PATH=/path/to/engine`. For API integrations, use Unreal's HTTP module: `TSharedRef<IHttpRequest> Request = FHttpModule::Get().CreateRequest(); Request->OnRequestComplete().BindLambda([](FHttpRequestPtr Req, FHttpResponsePtr Res){ /* handle response */ }); Request->ProcessRequest();`.

### Error Handling
Common errors include build failures from missing dependencies; check logs with `UnrealBuildTool.exe -verbose` and fix by adding modules in Build.cs, e.g., if "Core" is missing, add it and rebuild. For runtime crashes, use `ensure(Condition)` for assertions or catch exceptions in async code: `try { AsyncTask(ENamedThreads::AnyBackgroundThreadNormal, [](){ throw; }); } catch (...) { UE_LOG(LogTemp, Error, TEXT("Async error caught")); }`. Handle Blueprint compilation errors by validating nodes in the Editor; in code, use `if (IsValid(Actor)) { /* proceed */ } else { UE_LOG(LogTemp, Warning, TEXT("Actor is invalid")); }`. For network issues, verify with `if (Request->GetResponse()->GetResponseCode() == 200) { /* success */ } else { UE_LOG(LogTemp, Error, TEXT("HTTP error: %d"), Request->GetResponse()->GetResponseCode()); }`.

### Concrete Usage Examples
1. **Building a simple C++ actor**: Create a new project with `UnrealBuildTool.exe -project=NewProject.uproject -newprojecttype=Game -game=Blank`; then in code, add to MyActor.h: `UFUNCTION() void MyFunction();` and in MyActor.cpp: `void AMyActor::MyFunction() { GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Red, TEXT("Function called")); }`; compile with `UnrealBuildTool.exe Development Win64 NewProject`.
2. **Implementing a Blueprint for movement**: In the Unreal Editor, create a Blueprint class from ACharacter; add an event graph with "InputAction MoveForward" connected to "Add Movement Input"; equivalent C++: in AMyCharacter.cpp, `void AMyCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) { Super::SetupPlayerInputComponent(PlayerInputComponent); PlayerInputComponent->BindAxis("MoveForward", this, &AMyCharacter::MoveForward); } void AMyCharacter::MoveForward(float Value) { AddMovementInput(GetActorForwardVector(), Value); }`.

### Graph Relationships
- Related to cluster: game-dev (e.g., shares tags with unity-engine for game-development workflows).
- Connected via tags: unreal-engine links to 3d-rendering skills; game-development connects to blueprints and c++ focused tools.
