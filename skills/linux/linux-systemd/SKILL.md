---
name: linux-systemd
cluster: linux
description: "systemd: unit files, systemctl, journalctl, cgroup integration, socket activation, OpenClaw service"
tags: ["systemd","services","linux","units"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "systemd service unit file start stop restart journalctl cgroup"
---

# linux-systemd

## Purpose
This skill provides tools for managing systemd on Linux, focusing on service units, system control, logging, and integration features like cgroups and socket activation, specifically for OpenClaw service management.

## When to Use
Use this skill when you need to automate Linux service operations, such as starting/stopping daemons, monitoring logs, or optimizing resource usage with cgroups. Apply it in scripts for system administration, container orchestration, or when integrating OpenClaw as a systemd service. Avoid it on non-systemd systems like BSD or custom init setups.

## Key Capabilities
- Manage systemd unit files for services, sockets, and timers, including editing files in /etc/systemd/system/.
- Control services via systemctl commands, such as starting, stopping, and restarting units.
- Query logs with journalctl for real-time or historical output from specific units.
- Integrate cgroups for resource limits, e.g., CPU/memory constraints on services.
- Enable socket activation for on-demand service starts, reducing resource overhead.
- Handle OpenClaw as a systemd service by creating a unit file with ExecStart pointing to the OpenClaw binary.

## Usage Patterns
Always run commands with elevated privileges using sudo or as root. In scripts, use subprocess calls in Python or shell exec in Bash to invoke systemctl/journalctl. For unit file creation, edit files directly or use systemd-analyze for validation. When integrating with OpenClaw, ensure the service unit references the correct binary path and environment variables. Structure patterns as: detect service state first, then perform actions, and log outputs. For cgroups, specify limits in the unit file's [Service] section before reloading systemd.

## Common Commands/API
Use systemctl for service management: e.g., `systemctl start <unit>` to start a service. For logs, run `journalctl -u <unit> -f` to follow output. To restart, use `systemctl restart <unit> --no-block` for non-blocking operation. For cgroups, inspect with `systemctl status <unit> | grep CGroup` or set via unit file. Socket activation setup: add `Sockets=` in the unit file and use `systemctl start <socket-unit>`. Code snippet in Bash:
```
#!/bin/bash
systemctl stop my-service
systemctl start my-service
echo "Service restarted"
```
In Python, use:
```
import subprocess
subprocess.run(['systemctl', 'status', 'my-service'])
```
For OpenClaw service, create a unit file like:
```
[Unit]
Description=OpenClaw Service
[Service]
ExecStart=/usr/bin/openclaw --config /etc/openclaw/config.json
```

## Integration Notes
To integrate cgroups, add lines like `CPUQuota=50%` in the [Service] section of a unit file, then run `systemctl daemon-reload` and restart the unit. For socket activation, define a .socket unit file (e.g., `ListenStream=12345`) and link it to your service unit. When managing OpenClaw as a service, set environment variables in the unit file, e.g., `Environment="OPENCLAW_API_KEY=$SERVICE_API_KEY"`, and ensure $SERVICE_API_KEY is set via export in your shell or systemd environment files. Reload systemd with `systemctl daemon-reload` after changes. Avoid conflicts by checking for existing units with `systemctl list-units --type=service`.

## Error Handling
Always check command exit codes; for example, in Bash, use `if systemctl start <unit>; then echo "Success"; else echo "Failed: $?"; fi`. In Python, wrap subprocess calls in try-except blocks: try: subprocess.run([...], check=True) except subprocess.CalledProcessError as e: print(f"Error: {e.returncode}"). Common errors include "Failed to start unit" (check permissions or dependencies) or "Unit not found" (verify unit name with `systemctl list-units`). For journalctl, handle no logs with `journalctl -u <unit> --since "1 hour ago"` and parse output for errors. If cgroups fail, use `systemctl status <unit>` to debug limits, and ensure kernel support with `cat /proc/cgroups`.

## Concrete Usage Examples
Example 1: Start and monitor an OpenClaw service. First, create a unit file at /etc/systemd/system/openclaw.service with contents:
```
[Unit]
Description=OpenClaw Daemon
[Service]
ExecStart=/usr/bin/openclaw
```
Then, run: `systemctl daemon-reload; systemctl start openclaw; journalctl -u openclaw -f` to start and tail logs.

Example 2: Restart a service with cgroup limits. Edit the unit file to include `[Service] CPUQuota=30%`, then execute: `systemctl daemon-reload; systemctl restart my-service`. Verify with `systemctl status my-service | grep CGroup` to ensure CPU limits are applied.

## Graph Relationships
- Connected to: linux cluster (e.g., shares dependencies with other linux skills like file management or process control).
- Related via tags: systemd (direct link), services (e.g., to container or orchestration skills), linux (broad cluster ties), units (links to resource management skills).
- Integration points: cgroup (connects to performance monitoring tools), socket activation (relates to networking skills).
