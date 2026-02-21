---
name: testing-e2e
cluster: testing
description: "E2E: Playwright browser automation/visual regression, Cypress, Selenium. POM, trace viewer, CI"
tags: ["e2e","playwright","cypress","testing"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "e2e playwright cypress selenium browser automation visual regression"
---

# testing-e2e

## Purpose
This skill enables end-to-end (E2E) testing using tools like Playwright, Cypress, and Selenium for browser automation, visual regression testing, and integration with CI/CD pipelines. It focuses on reliable test automation for web applications.

## When to Use
Use this skill for full-stack testing of web apps, such as verifying user flows, UI interactions, or visual changes. Apply it in scenarios like regression testing before deployments, cross-browser compatibility checks, or when debugging UI issues in production-like environments.

## Key Capabilities
- Automate browser interactions with Playwright: Supports headless mode, tracing, and visual comparisons via `expect.toHaveScreenshot()`.
- Run Cypress tests: Includes real-time reloading, automatic waiting, and custom commands for assertions.
- Implement Selenium for legacy setups: Use WebDriver to control browsers and handle dynamic content.
- Page Object Model (POM): Structure tests with reusable page classes, e.g., define locators in a separate file.
- Visual regression: Capture and compare screenshots using Playwright's trace viewer or Cypress plugins.
- CI integration: Generate reports and artifacts for tools like GitHub Actions or Jenkins.

## Usage Patterns
To set up E2E tests, initialize a project with the chosen tool and write tests in a dedicated directory. Always use environment variables for sensitive data, like `$PLAYWRIGHT_BROWSER` for browser selection.

**Example 1: Playwright test for login flow**
- Create a test file: `tests/login.spec.js`
- Code snippet:
  ```javascript
  const { test } = require('@playwright/test');
  test('login success', async ({ page }) => {
    await page.goto('https://app.example.com');
    await page.fill('#username', 'user');
    await page.click('#login');
  });
  ```
- Run with: `npx playwright test --headed --project=chromium`

**Example 2: Cypress test for form submission**
- Add to `cypress/integration/form.spec.js`
- Code snippet:
  ```javascript
  describe('Form Submission', () => {
    it('submits correctly', () => {
      cy.visit('/form');
      cy.get('#name').type('Test User');
      cy.get('button[type=submit]').click();
      cy.url().should('include', '/success');
    });
  });
  ```
- Execute via: `npx cypress run --browser chrome --spec cypress/integration/form.spec.js`

For Selenium, use WebDriver with POM: Define a page class and call methods in tests.

## Common Commands/API
- Playwright CLI: `npx playwright install` to setup browsers; `npx playwright test --trace on` for tracing; API: `page.locator('selector').click()` for interactions.
- Cypress CLI: `npx cypress open` for interactive mode; `npx cypress run --config video=true` to enable videos; API: `cy.get('selector').should('be.visible')` for assertions.
- Selenium setup: Use `webdriverio` or similar; Command: `node selenium-test.js` with script like `driver.get('https://example.com')`; Config: JSON file for WebDriver options, e.g., `{ "browserName": "chrome" }`.
- Visual regression: Playwright's `npx playwright show-trace trace.zip` to view traces; Cypress via plugins like `cypress-image-snapshot`.

## Integration Notes
Integrate this skill into your workflow by adding it to package.json scripts, e.g., `"test:e2e": "npx playwright test"`. For CI, use GitHub Actions with a step: `run: npx cypress run --reporter junit`. If API keys are needed (e.g., for cloud services), set env vars like `$SELENIUM_GRID_URL` or `$CYPRESS_API_KEY`. Ensure browsers are installed via tools like `playwright install --with-deps`. For multi-tool setups, use a config file like `playwright.config.ts` with exports for projects.

## Error Handling
When tests fail, check logs first: Use Playwright's `--trace` flag to generate traces and debug with the trace viewer. For Cypress, enable `--config video=true` to capture videos. Handle common errors by adding retries, e.g., in Playwright: `test('retry', { retries: 2 }, async () => { ... })`. For Selenium, wrap code in try-catch blocks: 
```javascript
try {
  await driver.findElement(By.id('element')).click();
} catch (error) {
  console.error('Element not found:', error);
}
```
Assert conditions explicitly to avoid flaky tests, and use env vars for dynamic configs to prevent setup errors.

## Graph Relationships
- Cluster: Connected to "testing" cluster for related skills like unit testing or integration testing.
- Tags: Links to skills with tags "e2e", "playwright", "cypress", and "testing".
- Dependencies: Relates to CI/CD skills for pipeline integration and browser automation tools for execution environments.
