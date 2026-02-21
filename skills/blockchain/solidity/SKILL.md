---
name: solidity
cluster: blockchain
description: "Solidity is a statically-typed language for writing secure smart contracts on the Ethereum blockchain."
tags: ["solidity","smart-contracts","ethereum"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "solidity ethereum smart contracts blockchain programming language"
---

# solidity

## Purpose
This skill enables the AI to write, compile, and debug Solidity code for secure smart contracts on the Ethereum blockchain. It focuses on generating and manipulating Solidity scripts to interact with decentralized applications.

## When to Use
Use this skill when developing Ethereum-based smart contracts, such as token implementations, decentralized exchanges, or voting systems. Apply it for tasks requiring on-chain logic, like handling transactions or state changes, especially in projects involving Web3 integration or blockchain prototyping.

## Key Capabilities
- Write statically-typed code with support for inheritance, libraries, and modifiers.
- Compile Solidity files into bytecode using the solc compiler.
- Generate ABI (Application Binary Interface) for contract interactions.
- Handle data types like uint, address, and mappings for secure storage.
- Support for events and functions to emit logs and execute logic.

## Usage Patterns
To accomplish tasks, structure code with a contract definition, state variables, and functions. For example, invoke this skill by providing a prompt like: "Write a Solidity contract for a simple token." Always specify the Solidity version in code, e.g., pragma solidity ^0.8.0;. Use it in loops for iterative development, such as compiling code, checking for errors, and redeploying. Integrate with testing frameworks like Hardhat or Truffle for end-to-end workflows.

## Common Commands/API
Use the solc compiler for building contracts. To compile a file: `solc --optimize --bin YourContract.sol --output-dir build/`. For ABI generation: `solc --abi YourContract.sol`. In OpenClaw, call this via API endpoints like POST /api/solidity/compile with a JSON body: {"source": "pragma solidity ^0.8.0; contract Simple {}"}. Config formats: Use a solc.json file with {"language": "Solidity", "sources": {"YourContract.sol": {"content": "..."}}}. For Ethereum interactions, set environment variables like $ETHEREUM_API_KEY for RPC nodes, then use web3.js: const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.ETHEREUM_API_KEY}`)).

## Integration Notes
Integrate Solidity with OpenClaw by passing code snippets in prompts, e.g., "Compile this Solidity code: pragma solidity ^0.8.0; contract Example {}." Use Hardhat for project setup: install via `npm install --save-dev hardhat`, then run `npx hardhat compile` in your workflow. For API calls, ensure $SOLC_VERSION is set, e.g., export SOLC_VERSION=0.8.19, and use it in commands like `solc-select $SOLC_VERSION`. If deploying, reference Infura or Alchemy endpoints with auth: export ALCHEMY_API_KEY=yourkey, then connect via web3. Avoid direct blockchain interactions without error checking.

## Error Handling
When compiling, check for syntax errors like undeclared variables; use `solc --optimize YourContract.sol 2>&1` to capture output and parse for messages like "Parser error: Expected token". For runtime errors, wrap functions with require statements, e.g.: function safeTransfer(uint amount) public { require(amount > 0, "Amount must be positive"); }. In OpenClaw, handle API errors by checking response codes: if (response.status === 400) { retry with corrected code; }. Common issues: Gas limit exceeded—optimize code by removing unnecessary computations; Type mismatches—use explicit casting, e.g., uint8(myUint) = 255;. Log errors with events: event Error(string message); emit Error("Transaction failed").

## Concrete Usage Examples
1. **Write and Compile a Simple Contract**: To create a basic storage contract, prompt: "Generate Solidity code for a contract that stores a number." Result: pragma solidity ^0.8.0; contract Storage { uint public number; function set(uint _number) public { number = _number; } } Then, compile it: solc --bin Storage.sol to get bytecode for deployment.
2. **Deploy a Token Contract**: For an ERC20 token, use: "Write a Solidity ERC20 token contract." Output: pragma solidity ^0.8.0; import "OpenZeppelin/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol"; contract MyToken is ERC20 { constructor() ERC20("MyToken", "MTK") { _mint(msg.sender, 1000 * 10 ** 18); } } Deploy via: npx hardhat run scripts/deploy.js --network sepolia, assuming $PRIVATE_KEY is set for signing.

## Graph Relationships
- Related to cluster: blockchain (e.g., shares nodes with other blockchain skills like web3.js).
- Connected to tags: solidity (direct match), smart-contracts (for contract-specific tools), ethereum (links to Ethereum ecosystem skills).
- Outgoing links: to ethereum (for deployment), smart-contracts (for auditing tools).
- Incoming links: from programming (as a language skill), blockchain (as a sub-category).
