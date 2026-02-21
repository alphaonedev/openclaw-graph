---
name: unity
cluster: game-dev
description: "Develop interactive 2D and 3D games and simulations using Unity\'s C# based engine and ecosystem."
tags: ["unity","game-engine","c-sharp"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "unity game engine c-sharp 3d development scripting"
---

# unity

## Purpose
This skill allows an AI agent to develop interactive 2D and 3D games and simulations using Unity's C# engine. It focuses on scripting, scene management, and building projects for various platforms.

## When to Use
Use this skill for tasks involving real-time game development, such as creating prototypes, simulations, or full games with physics, animations, and user interactions. Apply it when C# scripting is needed for game logic, especially in projects requiring Unity's ecosystem for cross-platform deployment.

## Key Capabilities
- Script game objects and behaviors using C# in Unity's MonoBehaviour class.
- Manage scenes, assets, and physics via Unity's API, including components like Rigidbody and Collider.
- Build and export projects for platforms like Windows, Android, or WebGL using Unity's build pipeline.
- Integrate external libraries or services, such as Unity's Input System for handling user inputs.
- Utilize Unity's Editor features for rapid iteration, like Play mode for testing scripts in real-time.

## Usage Patterns
To accomplish tasks, start by creating a Unity project via the CLI or Editor, then write C# scripts attached to GameObjects. For automation, use Unity's command-line interface to execute methods or build projects. Always structure code with Update() for per-frame logic and Start() for initialization. To integrate with other tools, reference external DLLs in your project settings and use Unity's API to call them. For example, to handle events, subscribe to Unity's event system in your script's Awake() method.

## Common Commands/API
- **CLI Commands**: Use `unity-editor -projectPath /path/to/project -buildTarget Android -executeMethod BuildScript.PerformBuild` to build for Android; specify flags like `-quit` to exit after execution or `-batchmode` for headless operation.
- **C# API Snippets**:
  - Instantiate a GameObject: `GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube); cube.transform.position = new Vector3(0, 1, 0);`
  - Handle input: `if (Input.GetKeyDown(KeyCode.Space)) { Debug.Log("Space pressed"); }`
  - Apply physics: `Rigidbody rb = gameObject.AddComponent<Rigidbody>(); rb.AddForce(new Vector3(0, 5, 0));`
- **Config Formats**: Unity uses YAML-based .meta files for asset metadata (e.g., `guid: abc123`); edit project settings via the Editor or JSON-like ScriptableObjects for custom configurations.

## Integration Notes
To integrate Unity with other systems, use environment variables for authentication, such as `$UNITY_API_KEY` for Unity services like Cloud Build. For example, set `export UNITY_API_KEY=your_key` before running CLI commands. Link Unity projects to version control by initializing a Git repo in the project root and ignoring .meta files in .gitignore. When combining with other skills, import C# libraries via Unity's Package Manager (e.g., `Add package from Git URL`), and ensure compatibility by targeting .NET 4.x in project settings. For external APIs, use UnityWebRequest: `using UnityEngine.Networking; StartCoroutine(GetRequest("https://api.example.com/data"));`.

## Error Handling
In C# scripts, wrap potentially failing code in try-catch blocks, e.g., `try { GameObject.Find("MissingObject"); } catch (Exception e) { Debug.LogError(e.Message); }`. Check Unity's console for logs using `Debug.Log()` for info or `Debug.LogError()` for issues. For CLI errors, parse output; if a build fails, inspect the exit code (e.g., non-zero indicates failure) and use flags like `-logFile build.log` to capture details. Common issues include missing assets—resolve by verifying file paths in the project hierarchy.

## Usage Examples
1. **Example: Create a rotating cube in a Unity scene**: First, create a new Unity project via CLI: `unity-editor -createProject /path/to/newproject -quit`. Then, in a C# script attached to a GameObject, add: `void Update() { transform.Rotate(new Vector3(15, 30, 45) * Time.deltaTime); }`. Build and test in the Editor by pressing Play.
2. **Example: Build a project for WebGL via CLI**: Set up your project with a build script method: `public static void PerformBuild() { BuildPipeline.BuildPlayer(scenes, "/output/path", BuildTarget.WebGL, BuildOptions.None); }`. Run: `unity-editor -projectPath /path/to/project -executeMethod BuildScript.PerformBuild -buildTarget WebGL -quit`. This automates exporting for web deployment.

## Graph Relationships
- Related to: c-sharp (shares scripting language), game-engine (core functionality overlap)
- Connected to: game-dev (cluster membership), implying dependencies on tools like graphics or simulation skills
