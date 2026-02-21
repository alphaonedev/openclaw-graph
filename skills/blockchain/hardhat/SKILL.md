---
name: hardhat
cluster: blockchain
description: "Hardhat is an Ethereum development environment for compiling, testing, and deploying Solidity smart contracts."
tags: ["ethereum","solidity","smart-contracts"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "ethereum solidity smart-contracts development testing deployment"
---

# hardhat

## Purpose
Hardhat is a development environment for Ethereum that enables compiling, testing, and deploying Solidity smart contracts efficiently. It automates workflows for professional blockchain developers.

## When to Use
Use Hardhat for Ethereum smart contract development when you need a local blockchain simulator, automated testing, or deployment to testnets like Goerli. Apply it in projects requiring Solidity code compilation, especially for debugging or integrating with dApps. Avoid it for non-Ethereum blockchains or simple scripting tasks.

## Key Capabilities
- Compile Solidity files with customizable compiler versions (e.g., via hardhat.config.js: `solidity: "0.8.17"`).
- Run unit tests using Mocha or Hardhat's API, supporting assertions like `expect(await contract.balance()).to.equal(100)`.
- Deploy contracts to networks using ethers.js, with built-in support for forking mainnet for testing.
- Extend via plugins (e.g., @nomiclabs/hardhat-ethers) for advanced features like gas reporting.
- Handle multiple networks in config, e.g., defining Goerli with an RPC URL and accounts array.

## Usage Patterns
To set up a Hardhat project, run `npx hardhat init` in a new directory, then add your Solidity files to the `contracts` folder and tests to `test`. For workflows, always configure hardhat.config.js first with networks and Solidity settings. Use scripts for deployment: write a JS file in `scripts` that imports ethers and deploys contracts. Test iteratively: compile, run tests, then deploy. Always use environment variables for sensitive data, like `process.env.PRIVATE_KEY` in scripts.

## Common Commands/API
- Compile contracts: `npx hardhat compile --force` to rebuild all files, ignoring cache.
- Run tests: `npx hardhat test test/MyContract.js` to execute specific tests with Mocha.
- Deploy to a network: `npx hardhat run scripts/deploy.js --network goerli`, where deploy.js might look like:  
  ```javascript
  const hre = require("hardhat");
  async function main() { const MyContract = await hre.ethers.deployContract("MyContract"); await MyContract.waitForDeployment(); }
  main();
  ```
- View network info: `npx hardhat node` to start a local blockchain for testing.
- API usage: In scripts, access ethers via `hre.ethers.getSigners()` to get accounts; for config, use hardhat.config.js format:  
  ```javascript
  module.exports = { networks: { goerli: { url: process.env.GOERLI_RPC_URL, accounts: [process.env.PRIVATE_KEY] } }, solidity: "0.8.17" };
  ```
- Set environment variables: Export keys like `export PRIVATE_KEY=0xYourPrivateKey` before running commands.

## Integration Notes
Integrate Hardhat with ethers.js by installing `@nomiclabs/hardhat-ethers` and importing it in scripts for wallet and provider management. For CI/CD, use it with GitHub Actions: add a step like `npx hardhat test` in your workflow YAML. Combine with tools like Foundry for advanced testing or Truffle for migration scripts. If using Infura or Alchemy, set RPC URLs via env vars (e.g., `export GOERLI_RPC_URL=https://goerli.infura.io/v3/$INFURA_API_KEY`). Ensure compatibility by matching Solidity versions across projects.

## Error Handling
Handle compilation errors by checking console output for Solidity issues, e.g., "ParserError: Expected token" – fix syntax in your .sol file. For network errors, use try-catch in scripts:  
```javascript
try { await contract.deploy(); } catch (error) { console.error("Deployment failed:", error.message); process.exit(1); }
```
Common issues: Invalid private keys – ensure format with `ethers.utils.isHexString(process.env.PRIVATE_KEY)`. For RPC failures, verify URLs and add retries: use `hre.network.provider.send("eth_getBalance", [address])` with error checks. Always log errors with timestamps for debugging.

## Concrete Usage Examples
1. **Example: Set up and compile a simple contract**  
   Create a project: Run `npx hardhat init`, add a file `contracts/Greeter.sol` with:  
   ```solidity
   pragma solidity ^0.8.0; contract Greeter { string public greeting; constructor() { greeting = "Hello"; } }
   ```
   Then compile: `npx hardhat compile`. This outputs artifacts in `artifacts/`.

2. **Example: Deploy to Goerli testnet**  
   In `scripts/deploy.js`, write:  
   ```javascript
   const hre = require("hardhat"); async function main() { const Greeter = await hre.ethers.deployContract("Greeter"); console.log("Deployed to:", await Greeter.getAddress()); } main();
   ```
   Set env vars: `export PRIVATE_KEY=0xYourKey && export GOERLI_RPC_URL=https://goerli.infura.io/v3/your-key`. Run: `npx hardhat run scripts/deploy.js --network goerli`.

## Graph Relationships
- Related to tags: ethereum, solidity, smart-contracts
- Part of cluster: blockchain
- Connected via embedding: development, testing, deployment
