---
name: portfolio-management
cluster: financial
description: "Manages investment portfolios with quantitative models, risk metrics, and optimization algorithms."
tags: ["finance","investments","risk-management","quant-analysis"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "portfolio management finance investment risk optimization quantitative"
---

## portfolio-management

### Purpose
This skill enables the AI to manage investment portfolios using quantitative models, calculate risk metrics like Value at Risk (VaR), and apply optimization algorithms such as mean-variance optimization. It processes portfolio data to generate actionable insights, supporting decisions in finance by integrating with data sources and executing trades based on predefined strategies.

### When to Use
Use this skill for tasks involving portfolio rebalancing, risk assessment, or performance analysis in financial contexts. Apply it when handling user queries about investment strategies, such as diversifying assets or responding to market volatility. Ideal for scenarios with real-time data feeds or when optimizing allocations under constraints like budget limits.

### Key Capabilities
- **Quantitative Models**: Implement models like CAPM or Black-Litterman; e.g., calculate expected returns with `claw portfolio model capm --assets AAPL,GOOG`.
- **Risk Metrics**: Compute VaR or Sharpe ratio; use API endpoint `GET /api/portfolios/risk/var?confidence=0.95` to get 95% VaR for a portfolio.
- **Optimization Algorithms**: Run mean-variance optimization; configure via JSON file: `{"assets": ["AAPL", "MSFT"], "weights": [0.5, 0.5]}`.
- **Data Integration**: Pull market data from external APIs; supports formats like CSV or JSON for portfolio inputs.
- **Performance Tracking**: Generate reports on portfolio returns; e.g., `claw portfolio track --period monthly --metric sharpe`.

### Usage Patterns
Always initialize with authentication via `$PORTFOLIO_API_KEY` environment variable. For CLI usage, pipe data inputs directly; e.g., start with `claw portfolio load --file portfolio.json` then chain commands like `claw portfolio optimize --risk-level high`. In API patterns, use POST requests for modifications and GET for queries; handle asynchronous operations by polling endpoints. For scripts, wrap in try-catch blocks to manage API failures, and use config files for reusable parameters like asset lists.

### Common Commands/API
- **CLI Commands**: Use `claw portfolio manage --action optimize --config config.json` to optimize a portfolio; flags include `--action` (optimize, analyze), `--config` (path to JSON), and `--verbose` for detailed logs.
- **API Endpoints**: Send requests to `POST /api/portfolios/create` with body `{"name": "my-portfolio", "assets": ["AAPL", "TSLA"]}`; authenticate via header `Authorization: Bearer $PORTFOLIO_API_KEY`.
- **Code Snippets**:
  ```
  import requests
  response = requests.post('https://api.openclaw.ai/api/portfolios/optimize', headers={'Authorization': f'Bearer {os.environ["PORTFOLIO_API_KEY"]}'}, json={'assets': ['AAPL', 'GOOG']})
  print(response.json()['optimized_weights'])
  ```
  ```
  claw portfolio analyze --assets AAPL,MSFT --metric var --confidence 0.99
  ```
- **Config Formats**: Use JSON for inputs, e.g., `{"portfolio": {"assets": [{"symbol": "AAPL", "quantity": 100}], "constraints": {"max_risk": 0.05}}}`; validate with `claw portfolio validate --file config.json`.

### Integration Notes
Integrate by setting `$PORTFOLIO_API_KEY` in your environment before running commands. For external systems, use webhooks to sync data; e.g., connect to a brokerage API by mapping endpoints like `POST /api/portfolios/update` to trigger updates. Ensure compatibility with financial libraries like NumPy for calculations; import as a module in Python scripts and handle rate limits by adding delays, e.g., `time.sleep(1)` between API calls. Test integrations in a sandbox environment using mock data.

### Error Handling
Check for authentication errors by verifying `$PORTFOLIO_API_KEY` is set; if missing, prompt user with `os.environ.get('PORTFOLIO_API_KEY') or raise ValueError("API key required")`. For API failures, catch HTTP errors like 401 or 429 using try-except in code: 
  ```
  try:
      response = requests.get('https://api.openclaw.ai/api/portfolios/risk')
  except requests.exceptions.HTTPError as e:
      print(f"Error: {e.response.status_code} - {e.response.text}")
  ```
Handle invalid inputs by validating configs first with `claw portfolio validate`; log errors to file with `--log-file errors.log` flag, and retry transient errors up to 3 times with exponential backoff.

### Graph Relationships
- Related to cluster: financial
- Connected via tags: finance, investments, risk-management, quant-analysis
- Links to other skills: depends on data-analysis for data processing; enhances trading-execution for automated trades
