---
name: ipfs
cluster: blockchain
description: "IPFS is a peer-to-peer protocol for decentralized storage and sharing of files in a distributed network."
tags: ["p2p","decentralized-storage","distributed-filesystem"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "ipfs p2p decentralized storage distributed files blockchain"
---

# ipfs

## Purpose
IPFS (InterPlanetary File System) is a peer-to-peer protocol for storing and sharing files in a decentralized network, ensuring data persistence without central servers.

## When to Use
Use IPFS when building applications that require distributed storage for resilience, such as blockchain data archiving, peer-to-peer file sharing, or content delivery in unreliable networks. Apply it for scenarios involving large files or censorship-resistant data, like NFT metadata storage or decentralized apps.

## Key Capabilities
- Decentralized storage: Files are addressed by content hashes (e.g., CID like Qm...abc), enabling global access via any node.
- Peer discovery: Automatically connects to peers using DHT; configure with `ipfs config Addresses.Swarm --json '["/ip4/0.0.0.0/tcp/4001"]'`.
- Versioning: Supports IPLD for linking data structures; use `ipfs dag put` to add a DAG node.
- Encryption: Files can be encrypted via external tools; integrate with libsodium for symmetric encryption before adding files.
- Pinning: Manually pin files to local storage with `ipfs pin add <CID>` to prevent garbage collection.

## Usage Patterns
To add a file, run `ipfs add path/to/file.txt` from CLI, then reference it by CID. In code, use the Go IPFS library: import "github.com/ipfs/go-ipfs-api" and call sh := shell.NewShell("localhost:5001"); cid, err := sh.Add(strings.NewReader("data")). In scripts, wrap commands in try-catch for errors, e.g., check if the daemon is running with `ipfs daemon` first. For API calls, use HTTP endpoints like POST /api/v0/add with multipart form data.

## Common Commands/API
- Add a file: `ipfs add -r /path/to/dir` (recursive flag for directories); API: POST /api/v0/add with body containing the file.
- Retrieve a file: `ipfs cat <CID>` to output to stdout; API: GET /api/v0/cat?arg=<CID>.
- List pins: `ipfs pin ls --type=recursive`; use with `--enc=json` for JSON output.
- Configure settings: `ipfs config --json Datastore.StorageMax "10GB"` to set storage limits; config file is JSON at ~/.ipfs/config.
- Start daemon: `ipfs daemon --enable-pubsub` for pubsub features; if API keys are needed (e.g., for enterprise gateways), set env var like `export IPFS_API_KEY=$SERVICE_API_KEY` and include in headers.
Code snippet for adding via curl:  
`curl -X POST -F file=@file.txt http://localhost:5001/api/v0/add`
Code snippet for Go:  
`cid, err := sh.AddFile("/path/to/file.txt")`

## Integration Notes
Integrate IPFS with other tools by running the daemon locally or using public gateways (e.g., https://ipfs.io/ipfs/<CID>). For blockchain, link with Ethereum via IPFS for storing contract metadata; use web3.js to fetch CIDs. Set API endpoint in code: `shell.NewShell("http://$IPFS_GATEWAY:5001")` where $IPFS_GATEWAY is an env var. For authentication, if using a private API, add headers like `Authorization: Bearer $IPFS_API_KEY`. Handle multi-network setups by specifying swarm addresses in config, e.g., add `ipfs bootstrap add /ip4/1.2.3.4/tcp/4001/ipfs/Qm...` for custom peers.

## Error Handling
Check for common errors like "daemon not running" by verifying with `ipfs id` first; if it fails, start with `ipfs daemon`. For network issues, use `ipfs swarm connect /ip4/host/tcp/port` to manually connect peers. Parse API errors: responses include JSON with "Message" field, e.g., {"Message": "file not found"}. In code, handle with:  
`if err != nil { log.Fatal(err) }` after sh.Add(). For permission errors, ensure $IPFS_API_KEY is set and valid; retry with exponential backoff for transient failures. Validate CIDs before operations using `ipfs validate <CID>`.

## Concrete Usage Examples
1. **Uploading a file for blockchain storage**: First, ensure IPFS daemon is running. Add a file: `ipfs add contract.json` outputs a CID like Qmabcd. Store this CID in a smart contract. In Node.js:  
`const ipfsApi = require('ipfs-api'); const ipfs = ipfsApi('localhost', '5001', {protocol: 'http'}); ipfs.add(Buffer.from('contract data')).then(response => console.log(response[0].hash));`
2. **Retrieving and verifying a file**: Fetch a file by CID: `ipfs get Qmabcd -o output.txt`. In a script, verify integrity: `ipfs cat Qmabcd | sha256sum` to match the original hash. For distributed apps, use in a loop: fetch multiple CIDs and handle missing ones with try-catch.

## Graph Relationships
- Related to: blockchain (cluster), as IPFS provides decentralized storage for blockchain data.
- Connected via tags: p2p (links to other P2P protocols), decentralized-storage (ties to distributed databases), distributed-filesystem (overlaps with file-sharing skills).
