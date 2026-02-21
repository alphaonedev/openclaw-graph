---
name: linux-admin
cluster: linux
description: "Ubuntu Server 24.04 LTS: apt, user management, disk/filesystem, sysctl, log management"
tags: ["linux","ubuntu","admin","system"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "linux ubuntu server administration apt package system admin"
---

# linux-admin

## Purpose
This skill provides tools for administering Ubuntu Server 24.04 LTS, focusing on package management with apt, user account creation and modification, disk and filesystem operations, kernel parameter tuning via sysctl, and log management.

## When to Use
Use this skill for server setup, maintenance, or troubleshooting on Ubuntu 24.04, such as deploying applications, securing user access, optimizing system performance, or analyzing logs in production environments.

## Key Capabilities
- **Package Management (apt)**: Update repositories, install/uninstall packages, and manage dependencies using `apt` with flags like `-y` for non-interactive mode.
- **User Management**: Create, modify, or delete users with commands like `useradd`, `usermod`, and `userdel`, including options for home directories and shells.
- **Disk/Filesystem**: Partition disks with `fdisk`, format filesystems using `mkfs`, and mount/unmount with `mount` and `umount`, supporting formats like ext4.
- **Sysctl**: Adjust kernel parameters dynamically, e.g., for networking or security, by editing `/etc/sysctl.conf` and applying with `sysctl -p`.
- **Log Management**: Query and filter system logs using `journalctl`, with options like `--since` for time-based searches and persistent storage in `/var/log`.

## Usage Patterns
Invoke this skill via shell commands in scripts or AI prompts. Always prefix commands with `sudo` for root privileges. Example 1: To install a package and add a user, use a sequence like: `sudo apt update; sudo apt install nginx -y; sudo useradd webuser -m`. Example 2: For disk management and log check, run: `sudo fdisk /dev/sda; sudo mkfs.ext4 /dev/sda1; sudo mount /dev/sda1 /mnt; sudo journalctl -u nginx --since "1 hour ago"`.

## Common Commands/API
- **Apt Example**: Update and install a package:  
  ```
  sudo apt update
  sudo apt install vim -y
  ```
- **User Management Example**: Add a user with home directory:  
  ```
  sudo useradd newuser -m -s /bin/bash
  sudo passwd newuser
  ```
- **Disk/Filesystem Example**: Create and mount a filesystem:  
  ```
  sudo fdisk -l /dev/sdb  # List partitions
  sudo mkfs.ext4 /dev/sdb1
  sudo mount /dev/sdb1 /mnt/data
  ```
- **Sysctl Example**: Set a kernel parameter:  
  ```
  echo "net.core.somaxconn=1024" | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p
  ```
- **Log Management Example**: Filter logs for a service:  
  ```
  sudo journalctl -u apache2 --since yesterday
  sudo journalctl -p err  # Show only errors
  ```

## Integration Notes
Run commands in a Bash environment on Ubuntu 24.04. For remote access, use SSH; no API keys required for core functions, but if integrating with external tools like monitoring APIs, set env vars like `$LINUX_API_KEY` for authentication. Ensure the AI agent prefixes commands with `sudo` and handles output parsing, e.g., check for `apt` success via exit codes.

## Error Handling
Check command exit codes immediately; for example, after `sudo apt install package`, verify with `if [ $? -ne 0 ]; then echo "Installation failed"; fi`. Parse errors from stdout/stderr, e.g., `apt` errors like "E: Unable to locate package" indicate missing repos—run `sudo apt update` first. For sysctl, if a parameter fails, check `/var/log/syslog` for details. Use `try-catch` in scripts:  
```
command_output=$(sudo apt update 2>&1)
if [[ $command_output == *"ERROR"* ]]; then echo "Handle error"; fi
```

## Graph Relationships
- Related to: linux cluster skills like "networking" for firewall integration.
- Depends on: None directly, but assumes base Ubuntu setup.
- Conflicts with: None specified.
