---
name: cs-networks
cluster: computer-science
description: "Networks: TCP/IP, HTTP/2/3, TLS 1.3, DNS, BGP, WebSockets, QUIC, socket programming"
tags: ["networks","tcp","http","tls","dns","cs"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "network tcp ip http tls dns socket protocol http3 quic websocket"
---

# cs-networks

## Purpose
This skill equips the AI to handle computer network protocols and programming, focusing on TCP/IP, HTTP/2/3, TLS 1.3, DNS, BGP, WebSockets, QUIC, and socket operations for building, debugging, and securing networked applications.

## When to Use
Use this skill for tasks involving network communication, such as establishing connections in distributed systems, troubleshooting protocol issues (e.g., HTTP timeouts), implementing secure data transfer with TLS, or optimizing performance with QUIC in web apps. Apply it when code requires socket programming or protocol-specific handling, like DNS resolution in IoT devices.

## Key Capabilities
- Establish and manage TCP/IP connections, including creating sockets and handling data streams.
- Process HTTP/2 and HTTP/3 requests, including multiplexing and header compression.
- Implement TLS 1.3 encryption for secure sockets, verifying certificates and cipher suites.
- Perform DNS lookups and resolve hostnames using standard libraries.
- Handle BGP routing concepts for network topology analysis.
- Manage WebSockets for real-time bidirectional communication.
- Optimize with QUIC for low-latency UDP-based transports.
- Conduct socket programming for custom protocols, including error detection and retries.

## Usage Patterns
To use this skill, integrate it into code by importing relevant libraries (e.g., Python's socket or requests). Start with initializing connections, then handle data exchange in loops, and finally clean up resources. For HTTP operations, use asynchronous patterns to avoid blocking. Always check for authentication requirements early, like setting $API_KEY for external APIs. Pattern: Import module -> Configure options (e.g., timeouts) -> Execute operation -> Handle response or errors.

## Common Commands/API
- **Socket Programming (Python)**: Create a TCP socket and connect:  
  ```python
  import socket
  s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  s.connect(('example.com', 80))
  ```
- **HTTP Requests (using requests library)**: Send a GET request with HTTP/2:  
  ```python
  import requests
  response = requests.get('https://api.example.com/data', headers={'Authorization': f'Bearer {os.environ.get("API_KEY")}'})
  ```
- **DNS Lookup (Python)**: Resolve a hostname:  
  ```python
  import socket
  address = socket.gethostbyname('example.com')
  print(address)  # e.g., '93.184.216.34'
  ```
- **TLS Verification**: Use OpenSSL CLI for testing: `openssl s_client -connect example.com:443 -tls1_3` to verify TLS 1.3 handshake.
- **WebSockets**: Establish a connection with websockets library:  
  ```python
  import websockets
  async with websockets.connect('ws://example.com/ws') as websocket:
      await websocket.send('Hello')
  ```
- **QUIC/HTTP/3**: Test with curl: `curl --http3 https://example.com -H 'Authorization: Bearer $QUIC_API_KEY'` (ensure QUIC support in curl version).
- **BGP Query**: Use bgpq3 tool: `bgpq3 -A AS1234 -l myprefix` to fetch prefixes for an AS number.

## Integration Notes
Integrate this skill by wrapping network operations in functions or classes for modularity. For authenticated APIs, set environment variables like `export API_KEY=your_secret_key` and access via `os.environ.get('API_KEY')` in Python. Handle TLS by specifying CA bundles, e.g., in requests: `requests.get(url, verify='/path/to/ca.crt')`. For QUIC, ensure the environment supports UDP (e.g., no firewalls blocking port 443). Config formats: Use JSON for API configs, e.g., `{"host": "example.com", "port": 443, "tls": true}`. Avoid hardcoding keys; use vaults or env vars for security.

## Error Handling
Always wrap network operations in try-except blocks to catch exceptions. For sockets, check specific errors:  
```python
import socket
try:
    s.connect(('example.com', 80))
except socket.error as e:
    if e.errno == socket.errno.ECONNREFUSED:
        print("Connection refused; check server status")
    elif e.errno == socket.errno.ETIMEDOUT:
        print("Timeout; retry with exponential backoff")
```
For HTTP, handle status codes: if response.status_code == 401, prompt for $API_KEY refresh. In QUIC/HTTP/3, watch for h3 errors like stream resets. Implement retries with limits, e.g., using tenacity: `@retry(stop=stop_after_attempt(3), wait=wait_exponential_multiplier(1)) def fetch_data(): ...`. Log errors with details like errno for debugging.

## Concrete Usage Examples
1. **Example: Implement a Simple TCP Client**  
   To send data over TCP, use this code:  
   ```python
   import socket
   s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   s.connect(('localhost', 8080))
   s.sendall(b'Hello, server')
   response = s.recv(1024)
   s.close()
   ```
   This connects to a local server, sends a message, and receives a response. Use it for testing network apps; ensure the server is running on port 8080.

2. **Example: Secure HTTP Request with TLS**  
   To fetch data from a TLS-protected endpoint:  
   ```python
   import requests
   headers = {'Authorization': f'Bearer {os.environ.get("API_KEY")}'}
   response = requests.get('https://api.example.com/data', headers=headers, verify=True)
   if response.ok:
       print(response.json())
   ```
   This retrieves JSON data while enforcing TLS verification. Set $API_KEY in your environment before running, and handle 4xx/5xx errors as shown in Error Handling.

## Graph Relationships
- Related Clusters: computer-science (parent cluster for this skill).
- Related Skills: cs-algorithms (for network pathfinding), cs-security (for TLS and encryption integration).
- Tags Connections: "networks" links to cs-security and general-computing; "tcp" and "http" connect to web-development skills; "tls" and "dns" relate to cs-infrastructure.
