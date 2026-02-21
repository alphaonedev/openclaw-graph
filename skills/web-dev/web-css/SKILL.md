---
name: web-css
cluster: web-dev
description: "CSS: Grid/Flexbox, custom properties, animations, media queries, BEM, CSS Modules, :has/:is"
tags: ["css","styling","layout","web"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "css grid flexbox animation responsive custom properties modules"
---

# web-css

## Purpose
This skill allows OpenClaw to generate, optimize, and debug CSS code focusing on advanced features like Grid and Flexbox layouts, custom properties (variables), animations, media queries, BEM methodology, CSS Modules, and selectors like :has() and :is().

## When to Use
Use this skill for web development tasks involving styling components, such as creating responsive layouts, animating elements, or modularizing styles in projects using frameworks like React or Vue. Apply it when code needs to be efficient, maintainable, and compatible with modern browsers.

## Key Capabilities
- **Grid/Flexbox**: Create layouts using CSS Grid (e.g., `display: grid; grid-template-columns: repeat(3, 1fr);`) or Flexbox (e.g., `display: flex; justify-content: space-between;`).
- **Custom Properties**: Define and use variables like `--primary-color: #007bff;` for theming.
- **Animations**: Implement keyframe animations, e.g., `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`.
- **Media Queries**: Handle responsiveness, e.g., `@media (max-width: 768px) { .container { flex-direction: column; } }`.
- **BEM**: Enforce naming conventions like `.block__element--modifier` for scalable CSS.
- **CSS Modules**: Generate scoped styles, e.g., importing as `import styles from './styles.module.css';` and using `className={styles.button}`.
- **Selectors**: Utilize :has() and :is(), e.g., `div:has(p) { margin: 10px; }` or `button:is(:hover, :active) { background: red; }`.

## Usage Patterns
To invoke this skill in OpenClaw, use the CLI command: `openclaw execute web-css --input "task description" --options key=value`. For API integration, send a POST request to `/api/skills/web-css` with a JSON body like `{ "task": "generate grid layout", "params": { "elements": 3 } }`. Always set the environment variable for authentication: `$OPENCLAW_API_KEY`. Pass inputs as strings or JSON objects; for example, specify CSS features via flags like `--feature grid` or `--feature animations`.

## Common Commands/API
- **Generate Layout**: Run `openclaw execute web-css --task generate --type flexbox --properties "justify-content:center; align-items:center;"` to output a Flexbox snippet.
- **Add Animation**: Use API endpoint: POST /api/skills/web-css with body `{ "action": "add-animation", "selector": ".fade-element", "keyframes": "from { opacity: 0; }" }` to append animation code.
- **Optimize Media Queries**: Command: `openclaw execute web-css --optimize --breakpoints "mobile:480px, tablet:768px"` to refine responsive styles.
- **Config Format**: Provide configurations in JSON, e.g., `{ "bem": true, "modules": { "path": "./src/styles" } }`. For CSS Modules, ensure output includes import statements like `import styles from './Component.module.css';`.
- **Code Snippet Example**: 
  ```css
  .container {
    display: flex;
    flex-wrap: wrap;
  }
  ```
  Generated via `openclaw execute web-css --task layout --type flexbox`.

## Integration Notes
Integrate this skill with build tools like Webpack or Vite by wrapping outputs in module formats. For example, pipe OpenClaw output to a CSS processor: `openclaw execute web-css --output file.css && postcss file.css --use autoprefixer`. If using in a Node.js environment, import as `const openclaw = require('openclaw-sdk'); openclaw.run('web-css', { auth: process.env.OPENCLAW_API_KEY });`. Ensure CSS outputs are compatible with your framework; for React, generate class names that match BEM patterns. Handle dependencies by including libraries like `css-loader` for modules.

## Error Handling
Common errors include invalid CSS syntax or missing API keys; check for "SyntaxError" in responses and retry with corrected input. If authentication fails, verify `$OPENCLAW_API_KEY` is set and not expired. For API calls, catch HTTP errors like 401 (unauthorized) by logging and prompting for re-auth. Example: In code, use try-catch: 
```js
try {
  const response = await fetch('/api/skills/web-css', { headers: { 'Authorization': `Bearer ${process.env.OPENCLAW_API_KEY}` } });
  if (!response.ok) throw new Error('API error');
} catch (error) {
  console.error('Handle:', error.message); // Output: "API error"
}
```
Always validate inputs before execution, e.g., ensure selectors are valid strings.

## Concrete Usage Examples
1. **Flexbox Layout Generation**: To create a responsive navigation bar, run `openclaw execute web-css --task generate-layout --type flexbox --selectors ".nav" --properties "justify-content:space-around;"`. This outputs: 
   ```css
   .nav {
     display: flex;
     justify-content: space-around;
   }
   ```
   Then, integrate it into your HTML as `<nav class="nav">...</nav>`.

2. **Media Query for Responsiveness**: For a grid-based gallery, use `openclaw execute web-css --task add-media --breakpoint "768px" --selector ".gallery" --styles "grid-template-columns:1fr;"`. Resulting snippet: 
   ```css
   @media (min-width: 768px) {
     .gallery { grid-template-columns: repeat(2, 1fr); }
   }
   ```
   Apply this in a project to make the gallery adapt to tablet screens.

## Graph Relationships
- Related to: web-html (depends on for structure), web-js (integrates for dynamic styling), tools-build (uses for processing CSS Modules).
- Clusters: Connected via web-dev cluster for shared web tasks.
- Tags: Overlaps with "css" and "web" for cross-skill queries.
