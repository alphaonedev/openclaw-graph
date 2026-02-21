---
name: cs-crypto
cluster: computer-science
description: "Cryptography: AES, RSA/ECC, SHA-256/Blake3, PKI/X.509, TLS, digital signatures, ZKP, quantum resistance"
tags: ["cryptography","encryption","hashing","pki","cs"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "cryptography encryption hash signature pki tls quantum zkp aes rsa"
---

# cs-crypto

## Purpose
This skill equips the AI to implement and utilize cryptographic techniques for data security, including encryption, hashing, key management, and protocols like TLS, ensuring secure operations in code or CLI environments.

## When to Use
- Secure data transmission or storage, e.g., encrypting files or messages.
- Verify data integrity or authenticity, such as hashing user inputs or signing transactions.
- Handle secure communications, like setting up TLS for APIs.
- Implement advanced security features, such as zero-knowledge proofs (ZKP) for privacy-preserving computations or quantum-resistant algorithms for future-proofing.

## Key Capabilities
- Symmetric encryption: AES-128/256 in CBC or GCM modes for fast, secure data encryption.
- Asymmetric encryption: RSA (up to 4096 bits) or ECC (e.g., secp256k1) for key exchange and signing.
- Hashing: SHA-256 for standard digests or Blake3 for high-speed hashing with 256-bit outputs.
- PKI: Generate and manage X.509 certificates, including CSR creation and validation.
- TLS: Configure TLS 1.3 handshakes for secure sockets, including cipher suite selection.
- Digital signatures: Create and verify signatures using RSA or ECC, e.g., ECDSA.
- ZKP: Basic implementations like zk-SNARKs for proofs without revealing data.
- Quantum resistance: Use algorithms like CRYSTALS-Kyber for key encapsulation or Dilithium for signatures.

## Usage Patterns
Always initialize cryptographic operations with secure random keys and handle exceptions for invalid inputs. For AES encryption, generate a key first, then encrypt/decrypt in a single function call. Use hardware security modules (HSMs) for key storage if available. Pattern for hashing: input data -> hash object -> update and finalize. For TLS, wrap sockets with SSL contexts. Example pattern in Python:
```python
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
key = b'32-byte-key-for-aes-256'  # Use secure key generation
iv = os.urandom(16)
cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
encryptor = cipher.encryptor()
encrypted = encryptor.update(b"plaintext") + encryptor.finalize()
```
For CLI, pipe inputs to OpenSSL commands with specific flags.

## Common Commands/API
- AES encryption via OpenSSL: `openssl enc -aes-256-cbc -pbkdf2 -iter 10000 -in input.file -out output.enc -k $ENCRYPT_KEY` (use -salt for added security).
- RSA key generation: `openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048` then export public key with `openssl rsa -in private.pem -pubout -out public.pem`.
- Hashing with SHA-256: `echo -n "data_to_hash" | openssl dgst -sha256 -binary | base64` or in Python: `import hashlib; hash_obj = hashlib.sha256(b"data").digest()`.
- X.509 certificate creation: `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -subj "/CN=example.com"`.
- TLS setup in code: Use Python's ssl module: `import ssl; context = ssl.create_default_context(); context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")`.
- Digital signatures: Sign with `openssl dgst -sha256 -sign private.pem -out signature.bin input.file`, verify with `openssl dgst -sha256 -verify public.pem -signature signature.bin input.file`.
- ZKP example: Use libzkp library; in code: `from libzkp import prove; proof = prove(statement, witness)`.
- Quantum-resistant ops: Generate Kyber keys with OpenQuantumSafe: `oqsprov genpkey -algorithm Kyber512 -out key.pem`.

## Integration Notes
Install required libraries first, e.g., `pip install cryptography openssl` or use system OpenSSL. For authenticated services like cloud KMS, set environment variables: export AWS_KMS_KEY=$SERVICE_API_KEY and reference in code, e.g., `os.environ.get('AWS_KMS_KEY')`. Handle keys via secure vaults; never log them. For multi-tool integration, wrap OpenSSL in scripts: import subprocess and run `subprocess.run(['openssl', 'enc', ...])`. Ensure compatibility with languages like Python or Go; for Go, use crypto/aes package.

## Error Handling
Always wrap cryptographic calls in try-except blocks to catch specific exceptions, e.g., in Python: `from cryptography.exceptions import InvalidSignature; try: verifier.verify(signature, data) except InvalidSignature: raise ValueError("Signature invalid")`. For CLI, check exit codes: if `openssl` command fails, parse stderr for errors like "bad decrypt" and retry with correct key. Common issues: invalid keys (use `openssl errstr` for codes), hash mismatches (recompute and compare), or TLS handshake failures (debug with `-debug` flag). Log errors with context, e.g., key length or mode errors, and fallback to alternative algorithms if needed.

## Concrete Usage Examples
1. Encrypt a sensitive string with AES-256-GCM and decrypt it:
   In Python: 
   ```python
   from cryptography.hazmat.primitives.ciphers.aead import AESGCM
   key = b'32-byte-long-secret-key-here'
   aesgcm = AESGCM(key)
   nonce = os.urandom(12)
   encrypted = aesgcm.encrypt(nonce, b"confidential data", None)
   decrypted = aesgcm.decrypt(nonce, encrypted, None)  # Output: b"confidential data"
   ```
   Use this for securing API payloads; store nonce with encrypted data.

2. Generate an RSA key pair, sign a message, and verify the signature:
   Via CLI: First, generate keys: `openssl genrsa -out private.pem 2048`. Sign: `openssl dgst -sha256 -sign private.pem -out sig.bin message.txt`. Verify: `openssl dgst -sha256 -verify public.pem -signature sig.bin message.txt` (outputs "Verified OK" if successful).
   In code (Python): 
   ```python
   from cryptography.hazmat.primitives.asymmetric import rsa, padding
   from cryptography.hazmat.primitives import hashes
   private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
   signature = private_key.sign(b"message", padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH), hashes.SHA256())
   public_key = private_key.public_key()
   public_key.verify(signature, b"message", padding.PSS(...), hashes.SHA256())  # No error if valid
   ```
   Apply this for authenticating transactions or documents.

## Graph Relationships
- Related to cluster: computer-science
- Links to: network-security (shares TLS and PKI capabilities)
- Connects with: data-privacy (via encryption and hashing features)
- Overlaps with: blockchain-tech (through digital signatures and ZKP)
- Integrates with: quantum-computing (for quantum-resistant algorithms)
