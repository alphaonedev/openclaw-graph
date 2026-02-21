---
name: macos-keychain
cluster: macos
description: "Keychain: security CLI, API key storage, certificates, codesigning, Secure Enclave"
tags: ["keychain","secrets","security","macos"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "keychain secrets api keys password certificate macos security"
---

# macos-keychain

## Purpose
This skill provides tools for managing macOS Keychain via the `security` CLI, handling secure storage of secrets like API keys, passwords, certificates, and codesigning, while interacting with the Secure Enclave for enhanced security.

## When to Use
Use this skill when your application needs to store or retrieve sensitive data on macOS, such as API keys in scripts, manage certificates for app signing, or handle hardware-backed secrets via Secure Enclave. Apply it in automation, CI/CD pipelines, or apps requiring macOS-specific security.

## Key Capabilities
- Store and retrieve generic passwords using Keychain services.
- Manage certificates and identities for codesigning apps or verifying connections.
- Interact with Secure Enclave for storing keys that require hardware protection.
- Add, delete, or search items in Keychain with fine-grained access controls.
- Handle API key storage with encryption, ensuring data is isolated per user or app.

## Usage Patterns
Always run `security` commands via subprocess in scripts, prefixing with `security` and using flags for operations. For programmatic access, use the Security framework in Swift/Objective-C. Check for Keychain access prompts and handle user interactions. Use environment variables like `$KEYCHAIN_ITEM_NAME` for dynamic inputs to avoid hardcoding secrets.

## Common Commands/API
Use the `security` CLI for most tasks; for apps, leverage Security framework APIs like SecItemAdd and SecItemCopyMatching.

- Add a generic password:  
  `security add-generic-password -a username -s service -w password -T ""`  
  This stores a password for a service; use `$SERVICE_NAME` for the service string.

- Find a generic password:  
  `security find-generic-password -a username -s service -w`  
  Output the password; pipe to a variable, e.g., in Bash: `pass=$(security find-generic-password -s myapp -w)`.

- Delete an item:  
  `security delete-generic-password -a username -s service`  
  Removes the entry; confirm with `-h` for help on flags.

- Add a certificate:  
  `security add-certificate -k login.keychain cert.pem`  
  Imports a PEM certificate; specify keychain with `-k`.

- For Secure Enclave, generate a key:  
  `security create-key -t secp256r1 -a -p`  
  Creates a key pair; use in apps via SecKeyGeneratePair.

- API example in Swift (Security framework):  
  `let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword]`  
  `let status = SecItemCopyMatching(query as CFDictionary, nil)`  
  This queries for a generic password item.

- Export a certificate:  
  `security export -k login.keychain -t identities -o cert.p12 -P passphrase`  
  Exports to P12 format; use for codesigning.

Config formats: Keychain items use a dictionary-based query (e.g., in APIs, as [String: Any]), with keys like kSecAttrAccount for usernames. CLI outputs are plain text or plist; parse with `plutil` for structured data.

## Integration Notes
Integrate by calling `security` commands from scripts using subprocess (e.g., in Python: `subprocess.run(['security', 'add-generic-password', ...])`). For apps, import Security.h and use functions like SecItemAdd; ensure entitlements include "keychain-access-groups". Use env vars for secrets, like `$API_KEY` passed to commands. Avoid storing keys in code; fetch from Keychain at runtime. For cross-app access, set the same access group in entitlements.

## Error Handling
Check command exit codes; e.g., in Bash, use `if [ $? -ne 0 ]; then echo "Error: Keychain operation failed"; fi`. For CLI, parse stderr for messages like "SecKeychainItem not found". In Swift APIs, handle OSStatus errors (e.g., if SecItemAdd returns errSecDuplicateItem, log and retry). Use try-catch in Objective-C for framework calls. Common issues: permission denied (prompt user via UI) or item not found (return default value). Always sanitize outputs to prevent exposure of secrets.

## Concrete Usage Examples
1. Store an API key in Keychain:  
   In a Bash script, use: `security add-generic-password -a myapp-user -s myapi -w $API_KEY -T ""`  
   Then retrieve it: `apiKey=$(security find-generic-password -a myapp-user -s myapi -w)`  
   Use `$API_KEY` from env vars to avoid plaintext in scripts.

2. Manage a certificate for codesigning:  
   Import a cert: `security add-certificate -k login.keychain mycert.pem`  
   Verify: `security find-certificate -c "My Cert Name"`  
   In a build script, export for signing: `security export -k login.keychain -t identities -o signing.p12`.

## Graph Relationships
- Related to: macos-filesystem (for certificate file handling), security-tools (for broader security operations), encryption-services (via Secure Enclave integration).
- Clusters: macos (direct), secrets-management (via tags).
- Tags connections: keychain (core), secrets (overlaps with vault tools), security (links to authentication skills).
