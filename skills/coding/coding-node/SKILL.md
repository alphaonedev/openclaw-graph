---
name: coding-node
cluster: coding
description: "Node.js 22+: async patterns, ESM, npm/pnpm, event loop, streams. Express Fastify Hono"
tags: ["nodejs","javascript","coding"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "nodejs node javascript express fastify backend server pnpm"
---

# coding-node

## Purpose
This skill provides expertise in Node.js 22 and above, covering asynchronous programming patterns, ECMAScript Modules (ESM), package managers like npm and pnpm, the event loop, streams, and frameworks such as Express, Fastify, and Hono. Use it to guide users in building efficient, modern server-side applications.

## When to Use
Apply this skill when users need to handle asynchronous operations in Node.js, manage dependencies with npm or pnpm, debug event loop issues, process streams, or set up web servers with Express, Fastify, or Hono. Use it for backend development tasks like API creation, file handling, or real-time applications in JavaScript environments.

## Key Capabilities
- **Async Patterns**: Use `async/await` for non-blocking code; e.g., `async function fetchData() { const data = await fetch('url'); return data; }`.
- **ESM Support**: Import modules with `import` syntax; e.g., `import express from 'express';` in Node.js 22+ files with `.mjs` extension or `"type": "module"` in package.json.
- **Package Managers**: Handle dependencies via npm (e.g., `npm install express --save`) or pnpm (e.g., `pnpm add fastify`); use pnpm for faster installs with workspace support.
- **Event Loop**: Explain and optimize for blocking operations; use `process.nextTick()` to schedule callbacks before the next event loop phase.
- **Streams**: Process data in chunks with Readable, Writable, or Transform streams; e.g., `const fs = require('fs'); const readStream = fs.createReadStream('file.txt'); readStream.on('data', chunk => console.log(chunk));`.
- **Frameworks**: Set up servers with Express (e.g., `app.use(express.json())`), Fastify (e.g., `fastify.get('/path', handler)`), or Hono (e.g., `app.get('/route', c => c.text('Hello'))`).

## Usage Patterns
To accomplish tasks, always specify Node.js version 22+ in project setup. For ESM, add `"type": "module"` to package.json and use import statements. For async tasks, wrap code in try-catch blocks with async functions. When using npm, run `npm init -y` to create a package.json, then install packages. For pnpm, initialize with `pnpm init` and use it as a drop-in replacement for npm commands. To handle streams, pipe them directly: e.g., `readStream.pipe(writeStream)`. For frameworks, create an HTTP server instance and define routes; e.g., start Express with `app.listen(3000)`.

## Common Commands/API
- **Npm Commands**: Initialize project: `npm init -y`. Install package: `npm install express --save-prod`. Update dependencies: `npm update`. Run scripts: `npm run start` from package.json.
- **Pnpm Commands**: Add package: `pnpm add fastify`. Remove package: `pnpm remove package`. Install all: `pnpm install`.
- **API Endpoints**: In Express, define routes like `app.get('/users', (req, res) => res.json(users))`. In Fastify, use `fastify.post('/login', async (req, reply) => { /* auth logic */ reply.send({ token: 'abc' }); })`. In Hono, set up: `const app = new Hono(); app.get('/api/data', c => c.json({ data: 'value' }));`.
- **Event Loop Interactions**: Use `setImmediate()` for I/O callbacks; e.g., `setImmediate(() => console.log('After current event loop'));`.
- **Streams API**: Create a readable stream: `const { Readable } = require('stream'); const readable = Readable.from(['line1', 'line2']); readable.pipe(process.stdout);`.
If API keys are needed (e.g., for external services), set them as environment variables: `process.env.API_KEY = 'your_key'`, and access via `$YOUR_API_KEY` in commands.

## Integration Notes
Integrate this skill with other tools by using Node.js as a runtime. For example, combine with databases via `mongoose` for MongoDB: install with `pnpm add mongoose`, then connect in code: `const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI);`. Use dotenv for environment variables: install `npm install dotenv`, then require and configure: `require('dotenv').config(); const key = process.env.API_KEY;`. For deployment, export servers to tools like Vercel or Heroku; e.g., set `start` script in package.json as `"start": "node server.js"`. Ensure compatibility by specifying engine in package.json: `"engines": { "node": ">=22" }`. When integrating streams, chain with other modules like `zlib` for compression: `readStream.pipe(zlib.createGzip()).pipe(writeStream)`.

## Error Handling
Always use try-catch for async functions: e.g., `try { const result = await someAsyncFunction(); } catch (error) { console.error(error.message); }`. For streams, listen for 'error' events: e.g., `readStream.on('error', err => { console.error('Stream error:', err); process.exit(1); })`. In Express, use middleware for errors: `app.use((err, req, res, next) => { res.status(500).send('Server Error'); })`. For npm/pnpm, check exit codes: e.g., in scripts, use `if [ $? -ne 0 ]; then echo "Command failed"; fi`. Validate inputs to prevent event loop blocks, and use `process.on('uncaughtException', (err) => { console.error(err); process.exit(); })` for unhandled errors.

## Concrete Usage Examples
1. **Set Up a Basic Express Server**: Create a file `server.js` with: `import express from 'express'; const app = express(); app.get('/', (req, res) => res.send('Hello World')); app.listen(3000, () => console.log('Server running'));`. Run it with `node --experimental-vm-modules server.js` if using ESM, then access http://localhost:3000.
2. **Process a File Stream with Pnpm**: First, install dependencies: `pnpm add fs`. Then, in code: `const fs = require('fs'); const readStream = fs.createReadStream('input.txt'); readStream.on('data', chunk => console.log(chunk.toString())); readStream.on('end', () => console.log('Done'));`. Execute with `node script.js` to read and log file contents in chunks.

## Graph Relationships
- Related to: coding (same cluster), as it shares JavaScript fundamentals.
- Connected to: other coding skills via tags like "nodejs" and "javascript", potentially linking to frontend skills for full-stack development.
- Integrates with: tools in the "coding" cluster, such as database or deployment skills, for end-to-end application building.
