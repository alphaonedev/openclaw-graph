---
name: macos-perf
cluster: macos
description: "Activity Monitor, Instruments, top/htop, memory pressure, thermal state, powermetrics, profiling"
tags: ["performance","profiling","macos","instruments"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "macos performance profiling instruments memory cpu thermal powermetrics"
---

# macos-perf

## Purpose
This skill enables monitoring and profiling macOS system performance using native tools, focusing on CPU, memory, thermal, and power metrics to identify bottlenecks and optimize applications.

## When to Use
Use this skill for diagnosing high CPU usage in apps, investigating memory leaks, profiling resource-intensive processes, checking thermal states during heavy workloads, or analyzing power consumption on macOS devices.

## Key Capabilities
- Monitor real-time system metrics via Activity Monitor or `top/htop` for CPU, memory, and network usage.
- Profile applications with Instruments, capturing detailed traces for CPU, memory, and energy.
- Check memory pressure using `vm_stat` to detect low-memory conditions.
- Query thermal state via `powermetrics` for CPU/GPU temperatures and fan speeds.
- Analyze power metrics with `powermetrics` to measure battery drain and efficiency.
- Use command-line tools like `top -o cpu` for sorted process lists or `instruments -s devices` for available templates.

## Usage Patterns
Invoke this skill in scripts for automated monitoring or integrate into AI workflows for real-time analysis. For example, run periodic checks in a loop for server-like macOS setups, or trigger profiling when an app exceeds resource thresholds. Always specify exact tools and flags based on the task; e.g., use `top` for quick views and Instruments for deep dives. If integrating with automation, export data to JSON for parsing.

## Common Commands/API
- Use `top -o cpu -s 1` to display processes sorted by CPU usage, updating every second; pipe output to `grep` for filtering, e.g., `top -o cpu | grep "MyApp"`.
- Check memory pressure with `vm_stat | grep "Pages"` to get free pages; sample code:
  ```
  output = subprocess.run(['vm_stat'], capture_output=True).stdout
  free_pages = int(re.search(r'free:\s+(\d+)', output.decode()).group(1))
  ```
- Run `powermetrics --samplers cpu,thermal -i 1000` for CPU and thermal data every 1 second.
- Launch Instruments via CLI: `instruments -w <device> -t Time Profiler -D output.trace /path/to/app`; use exported .trace files for analysis.
- For thermal state, use `ioreg -l | grep "Ambient" ` to parse ambient temperature from system registry.
- No API keys required for these tools; they run natively on macOS.

## Integration Notes
Integrate by wrapping commands in Python or shell scripts; set environment variables for custom paths, e.g., export `INSTRUMENTS_PATH=/Applications/Xcode.app/Contents/Developer/usr/bin/instruments`. For data export, use `plutil` to convert .plist outputs to JSON. If combining with other skills, ensure macOS version compatibility (e.g., Instruments requires Xcode); check via `sw_vers -productVersion`. Avoid running multiple intensive tools simultaneously to prevent resource contention.

## Error Handling
Check command exit codes; for example, if `top` fails, verify with `echo $?` and handle by logging errors or retrying. For Instruments, parse stderr for messages like "Template not found" and fallback to alternatives. Use try-except in scripts, e.g.:
  ```
  try:
      result = subprocess.run(['instruments', '-t', 'Time Profiler'], check=True)
  except subprocess.CalledProcessError as e:
      print(f"Error: {e.returncode} - {e.output}")
  ```
Common issues include permission errors (run with sudo) or missing dependencies (install Xcode command line tools via `xcode-select --install`).

## Concrete Usage Examples
1. To monitor CPU usage of a specific process: Run `top -pid <processID> -o cpu` in a loop script, then analyze output to alert if usage > 80%; example script line: `while true; do top -pid 1234 -l 1 | grep CPU; sleep 5; done`.
2. For profiling an app's memory: Use `instruments -t Allocations -D profile.trace /Applications/MyApp.app`, then open the trace in Instruments GUI to identify leaks; integrate by scripting: `instruments ... && open profile.trace`.

## Graph Relationships
- Related to: macos cluster (e.g., macos-core for basic system ops), performance tag (links to general profiling skills), profiling tag (connects to app optimization tools).
- Dependencies: Requires macos cluster skills for foundational access; no direct API links.
