---
name: defi-protocols
cluster: blockchain
description: "Specialized knowledge of DeFi protocols including smart contracts, tokens, and decentralized lending on blockchains."
tags: ["defi","protocols","blockchain"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "defi protocols blockchain smart contracts decentralized finance"
---

# defi-protocols

## Purpose
This skill equips the AI with specialized knowledge of DeFi protocols, enabling precise interactions with smart contracts, tokens, and decentralized lending on blockchains like Ethereum and Binance Smart Chain.

## When to Use
Use this skill for tasks involving DeFi app development, smart contract auditing, token management, or lending protocol integrations. Apply it when handling blockchain transactions, yield farming, or protocol vulnerabilities in real-time coding scenarios.

## Key Capabilities
- Interact with smart contracts using Web3.js or Ethers.js libraries to read/write state.
- Manage ERC-20/ERC-721 tokens, including transfers and approvals.
- Handle decentralized lending via protocols like Aave or Compound, querying interest rates or borrowing limits.
- Analyze on-chain data from block explorers like Etherscan API endpoints (e.g., `/api?module=account&action=balance`).
- Simulate transactions with tools like Hardhat for testing smart contracts.

## Usage Patterns
To use this skill, initialize a Web3 provider in your code and set environment variables for API keys. For example, in a Node.js script, import Web3 and connect to a network:

```javascript
const Web3 = require('web3');
const web3 = new Web3(process.env.RPC_URL || 'http://localhost:8545');
```

For DeFi-specific tasks, wrap contract interactions in try-catch blocks and use ABI files for decoding. When querying Aave, fetch pool data by specifying the contract address and function signature.

## Common Commands/API
- CLI: Use Hardhat for deploying contracts: `npx hardhat run scripts/deploy.js --network sepolia --api-key $ETHEREUM_API_KEY`.
- API: Ethereum JSON-RPC via endpoints like `eth_call` for contract calls: `curl -X POST --data '{"jsonrpc":"2.0","method":"eth_call","params":[{...}],"id":1}' $RPC_URL`.
- Aave API: Query lending pools with `GET https://api.thegraph.com/subgraphs/name/aave/protocol-v2` using GraphQL queries.
- Config formats: Store ABI in JSON files, e.g., `{ "abi": [{ "name": "balanceOf", "inputs": [...] }] }`, and load via `fs.readFileSync('abi.json')`.
- Token interactions: Use Ethers.js for transfers: `contract.methods.transfer(address, amount).send({ from: walletAddress })`.

## Integration Notes
Integrate this skill with wallets like MetaMask by using Web3 providers that handle signer objects. For authentication, set env vars like `$ETHEREUM_API_KEY` for services such as Infura or Alchemy. When combining with other skills, ensure compatibility by standardizing blockchain networks (e.g., use Web3.js for both DeFi and general blockchain tasks). For oracles like Chainlink, import their contracts and call functions like `getPrice` before executing DeFi logic.

## Error Handling
Handle common errors like transaction reverts by checking for `TransactionError` in Ethers.js: try { await contract.methods.borrow().send(); } catch (error) { if (error.reason.includes('insufficient collateral')) console.log('Add more collateral'); }. For API failures, verify status codes (e.g., 429 for rate limits) and retry with exponential backoff. Use event listeners for blockchain errors, e.g., `contract.events.ErrorOccurred().on('data', handleError)`. Always validate inputs to prevent exploits like reentrancy in lending protocols.

## Concrete Usage Examples
1. **Query Aave Lending Pool:** To check available liquidity for a token, use this Ethers.js snippet: `const pool = await ethers.getContractAt('ILendingPool', '0x...'); const liquidity = await pool.getReserveData(tokenAddress); console.log(liquidity.availableLiquidity.toString());`. Set `$AAVE_SUBGRAPH_KEY` for any required API access.
2. **Deploy a Simple Token Contract:** In a Hardhat project, run `npx hardhat compile` then `npx hardhat deploy --network mumbai`, with config in `hardhat.config.js` like `module.exports = { networks: { mumbai: { url: process.env.RPC_URL, accounts: [process.env.PRIVATE_KEY] } } };`. This deploys an ERC-20 token for DeFi use.

## Graph Relationships
- Related to: ethereum (shares blockchain cluster), smart-contracts (overlaps on contract interactions), tokens (focuses on ERC standards).
- Connected via: blockchain cluster for broader ecosystem access.
- Dependencies: Requires protocols like aave for lending specifics.
