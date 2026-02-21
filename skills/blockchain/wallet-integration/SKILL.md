---
name: wallet-integration
cluster: blockchain
description: "Integrates blockchain wallets for secure cryptocurrency transactions and asset management."
tags: ["blockchain","wallet","integration"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "blockchain wallet integration crypto transactions keys"
---

## Purpose

This skill integrates blockchain wallets to enable secure cryptocurrency transactions, asset management, and key handling for networks like Ethereum and Bitcoin. It abstracts wallet interactions, ensuring secure key management and transaction signing.

## When to Use

Use this skill when building applications that require wallet connectivity, such as dApps for token transfers, NFT management, or querying blockchain balances. Apply it in scenarios involving user authentication with wallets (e.g., MetaMask integration) or automated scripts for asset tracking.

## Key Capabilities

- Connect to blockchain networks (e.g., Ethereum via RPC, Bitcoin via electrum) using private keys or mnemonic phrases.
- Perform transactions: Send ETH or BTC, including gas fee estimation for Ethereum.
- Manage assets: Query balances, list tokens, and handle multi-chain wallets.
- Secure key storage: Encrypt keys in memory and support hardware wallets like Ledger.
- Event listening: Subscribe to wallet events like incoming transactions via WebSocket.

## Usage Patterns

Always initialize the wallet with a network and authentication method. Use environment variables for keys to avoid hardcoding. For CLI, prefix commands with `claw wallet`. In code, import the OpenClaw library and create a wallet instance. Handle asynchronous operations with async/await for network calls. Test integrations in a sandbox environment before production.

## Common Commands/API

Use the following CLI commands or API endpoints for wallet operations. Set authentication via `$WALLET_API_KEY` environment variable.

- CLI Command: `claw wallet connect --network ethereum --key $ETH_PRIVATE_KEY --rpc-url https://mainnet.infura.io/v3/your-project-id`
  - Flags: `--network` specifies chain (e.g., ethereum, bitcoin); `--key` uses a hex string; `--rpc-url` for custom nodes.
  - Example: Connects to Ethereum and returns a session ID.

- API Endpoint: POST /api/v1/wallet/connect
  - Body: JSON format: `{"network": "ethereum", "privateKey": "$ETH_PRIVATE_KEY", "rpcUrl": "https://mainnet.infura.io/v3/your-project-id"}`
  - Response: JSON with `{ "status": "connected", "address": "0xYourAddress" }`.

- CLI Command: `claw wallet send --to 0xRecipientAddress --amount 0.1 --network ethereum`
  - Flags: `--to` for recipient; `--amount` in ETH; adds `--gas-limit 21000` for custom gas.

- API Endpoint: POST /api/v1/wallet/transaction
  - Body: JSON: `{"to": "0xRecipientAddress", "amount": "0.1", "network": "ethereum", "gasLimit": 21000}`
  - Code Snippet:
    ```python
    import requests
    import os
    response = requests.post('https://api.openclaw.com/api/v1/wallet/transaction', 
                             json={"to": "0xRecipient", "amount": "0.1"}, 
                             headers={"Authorization": f"Bearer {os.environ['WALLET_API_KEY']}"})
    print(response.json())
    ```

- CLI Command: `claw wallet balance --address 0xYourAddress --network bitcoin`
  - Flags: `--address` for query; supports `--unit satoshi` for precision.

Config Format: Use JSON for wallet configs, e.g.,
```json
{
  "network": "ethereum",
  "rpcUrl": "https://mainnet.infura.io/v3/your-id",
  "privateKeyEnv": "ETH_PRIVATE_KEY"
}
```
Load via CLI: `claw wallet load-config path/to/config.json`.

## Integration Notes

Always use `$WALLET_API_KEY` for authentication in API calls or CLI commands to prevent exposure. Install dependencies like `web3.py` for Ethereum or `bitcoinlib` for Bitcoin via `pip install openclaw-blockchain`. For multi-chain support, specify networks explicitly in configs. Avoid storing keys in code; use secure vaults or hardware devices. If integrating with other services, chain wallet events to OpenClaw's event bus using WebSockets (e.g., `ws://api.openclaw.com/events`). Validate inputs (e.g., check address formats with `web3.utils.isAddress()`) before operations.

## Error Handling

Catch common errors like network failures, invalid keys, or insufficient funds. Use try-except blocks for API calls. For CLI, check exit codes.

- Error: Invalid private key – Code: 400 Bad Request
  - Handle: In code, check with `if not wallet.validate_key(key): raise ValueError("Invalid key")`
  - Snippet:
    ```python
    try:
        wallet.connect(key=os.environ['ETH_PRIVATE_KEY'])
    except ConnectionError as e:
        print(f"Network error: {e}. Retrying in 5s...")
        time.sleep(5)
    ```

- Error: Insufficient funds – Code: 402 Payment Required
  - Handle: Query balance first with `claw wallet balance` and abort if low.
  - CLI Example: Pipe output: `claw wallet balance --address 0xAddr && claw wallet send || echo "Funds low"`

Always log errors with context (e.g., network and timestamp) and retry transient errors up to 3 times with exponential backoff.

## Concrete Usage Examples

**Example 1: Connecting and Sending ETH**
To connect a wallet and send 0.1 ETH:
1. Set env var: `export ETH_PRIVATE_KEY=0xYourHexKey`
2. Run CLI: `claw wallet connect --network ethereum --key $ETH_PRIVATE_KEY`
3. Send transaction: `claw wallet send --to 0xRecipient --amount 0.1`
   - In code:
     ```python
     import openclaw
     wallet = openclaw.Wallet(network='ethereum')
     wallet.connect(key=os.environ['ETH_PRIVATE_KEY'])
     tx_hash = wallet.send(to='0xRecipient', amount=0.1)
     print(f"Transaction sent: {tx_hash}")
     ```

**Example 2: Querying and Managing Bitcoin Assets**
To check balance and transfer BTC:
1. Set env var: `export BTC_PRIVATE_KEY=YourBitcoinKey`
2. Query balance: `claw wallet balance --address bc1YourAddress --network bitcoin`
3. Transfer: `claw wallet send --to bc1Recipient --amount 0.001 --network bitcoin`
   - In code:
     ```python
     import openclaw
     wallet = openclaw.Wallet(network='bitcoin')
     wallet.connect(key=os.environ['BTC_PRIVATE_KEY'])
     balance = wallet.get_balance(address='bc1YourAddress')
     if balance > 0.001:
         tx_id = wallet.send(to='bc1Recipient', amount=0.001)
         print(f"Transferred: {tx_id}")
     ```

## Graph Relationships

- Related to: transaction-processing (for post-transaction handling)
- Depends on: blockchain-explorer (for block data queries)
- Clusters with: smart-contracts (for wallet-based contract interactions)
