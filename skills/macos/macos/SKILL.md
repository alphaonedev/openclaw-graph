---
name: macos
cluster: macos
description: "macOS system overview and general orchestration"
tags: ["macos","apple","system"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "macos apple mac system overview"
---

# macos

## Purpose
This skill enables OpenClaw to provide macOS system overviews and orchestrate tasks like file management, process control, and app interactions, leveraging macOS-specific APIs and CLI tools for efficient automation.

## When to Use
Use this skill for macOS-exclusive tasks, such as managing user permissions, monitoring system resources, automating app launches, or integrating with Apple ecosystem tools. Apply it when the agent needs to handle Apple-specific environments, like scripting for macOS-only workflows or troubleshooting hardware interactions.

## Key Capabilities
- Access macOS CLI commands for file operations, e.g., listing directories with permissions.
- Orchestrate system processes using `launchctl` for service management.
- Interact with Apple APIs, like Foundation framework for file I/O.
- Monitor system metrics via `sysctl` or `top`, and handle app-specific events using AppleScript.
- Manage configurations in plist XML format for system preferences or app settings.

## Usage Patterns
Invoke this skill by specifying the "macos" ID in OpenClaw queries, e.g., prefix with "use skill: macos" for context. Always check for macOS version compatibility using `sw_vers` before executing commands. For orchestration, chain tasks like file checks followed by process starts. Use environment variables for sensitive data, e.g., set `$APPLE_API_KEY` for authenticated API calls. Structure requests as JSON payloads with fields like {"action": "run_command", "command": "ls -l"}.

## Common Commands/API
- Use `ls -l` to list files with detailed permissions; example: run via subprocess in Python: `import subprocess; subprocess.run(['ls', '-l', '/path'])`.
- Manage services with `launchctl load /path/to/plist` for starting daemons; snippet: `subprocess.run(['launchctl', 'load', '-w', '/Library/LaunchDaemons/com.example.plist'])`.
- Query system info via `sysctl -n hw.memsize` for memory size; code: `output = subprocess.check_output(['sysctl', '-n', 'hw.memsize']).decode().strip()`.
- Open files with `open -a "Application" file.path`; e.g., `subprocess.run(['open', '-a', 'TextEdit', 'document.txt'])`.
- AppleScript integration: Use `osascript -e 'tell app "Finder" to open document file "path"'`; snippet: `subprocess.run(['osascript', '-e', 'tell app "Finder" to display dialog "Hello"'])`.
If API keys are needed for extended services (e.g., Apple Developer APIs), reference them as `$APPLE_DEVELOPER_KEY` in environment variables.

## Integration Notes
Integrate this skill with other OpenClaw skills by linking via clusters, e.g., combine with "system" cluster for cross-platform tasks. For config files, parse plist XML using Python's `plistlib` module: `import plistlib; with open('config.plist', 'rb') as f: data = plistlib.load(f)`. Ensure compatibility by checking macOS version with `subprocess.run(['sw_vers', '-productVersion'])` and adjust commands accordingly, e.g., use `xattr` for extended attributes on macOS 10.10+. When integrating with tools like Homebrew, prefix commands with `brew --prefix` for paths. Always sandbox operations using `sandbox-exec` for security.

## Error Handling
Handle permission errors by checking for `Operation not permitted` and prefix commands with `sudo` if needed, e.g., wrap in try-except: `try: subprocess.run(['command']) except subprocess.CalledProcessError as e: log_error(e, "Permission issue; use sudo")`. For API failures, verify `$APPLE_API_KEY` is set and catch HTTP errors like 401 Unauthorized. Common issues: File not found—use `os.path.exists('/path')` before operations; Process timeouts—set timeouts in subprocess calls, e.g., `subprocess.run(['command'], timeout=10)`. Log errors with macOS's `syslog` via `logger` command for auditing.

## Concrete Usage Examples
1. **Automate file backup**: To back up a directory, use this pattern: First, check disk space with `df -h /`, then copy files: `subprocess.run(['cp', '-R', '/source/dir', '/backup/dir'])`. In OpenClaw, query: "use skill: macos; backup /Documents to /Backup if disk space > 10GB".
2. **Monitor system resources**: Query CPU usage with `top -l 1 | grep "CPU usage"`, then alert if >80%: `import re; output = subprocess.check_output(['top', '-l', '1']); if re.search(r'CPU usage: \d+\.\d+% user', output) and float(match) > 80: send_alert()`. In OpenClaw: "use skill: macos; monitor CPU and notify if usage exceeds 80%".

## Graph Relationships
- Related to cluster: macos (direct link for system tasks).
- Connects to skills: ["apple"] for ecosystem integrations, ["system"] for general OS operations.
- Dependencies: Requires "core" cluster for basic execution; provides outputs to "automation" cluster for workflow chaining.
