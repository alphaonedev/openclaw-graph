---
name: market-data
cluster: financial
description: "Fetches and processes real-time financial market data for analysis and trading."
tags: ["finance","market","data","stocks","trading"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "finance market data stocks trading API"
---

## market-data

### Purpose
This skill fetches and processes real-time financial market data from APIs like Alpha Vantage or Yahoo Finance, enabling analysis and trading decisions. It handles data ingestion, normalization, and basic computations for stocks, currencies, and indices.

### When to Use
Use this skill for real-time market monitoring in trading bots, financial dashboards, or data-driven apps. Apply it when you need live stock prices, historical data, or indicators like moving averages, especially in high-frequency trading scenarios or portfolio analysis.

### Key Capabilities
- Fetch real-time or historical data for stocks, ETFs, and forex via APIs.
- Process data with built-in functions, e.g., calculate simple moving averages or volatility.
- Support for multiple data sources, configurable via JSON config files.
- Handle large datasets efficiently with pagination and caching.
- Integrate with other financial tools for automated workflows.

### Usage Patterns
Always initialize the skill with authentication via environment variables. Use it in a pipeline: first fetch data, then process it, and finally output or integrate. For scripts, import as a module and call functions directly. In CLI mode, chain commands for sequential operations. Avoid direct database writes; use it for transient data processing.

### Common Commands/API
Use the `claw` CLI for quick access; API endpoints are for programmatic use. Set `$MARKET_API_KEY` for authentication before running commands.

- CLI Command: Fetch stock price  
  `claw market-data fetch --symbol AAPL --interval 1min`  
  This retrieves the latest 1-minute OHLC data for AAPL.

- API Endpoint: Get stock data  
  Endpoint: GET /api/v1/stocks/{symbol} with query params like ?interval=1min  
  Example: Use in code:  
  ```python
  import requests
  response = requests.get('http://api.openclaw.ai/api/v1/stocks/AAPL', headers={'Authorization': f'Bearer {os.environ["MARKET_API_KEY"]}'})
  data = response.json()
  ```

- CLI Command: Process data (e.g., calculate SMA)  
  `claw market-data process --input data.json --function sma --period 20`  
  This reads a JSON file and computes a 20-period SMA.

- API Endpoint: Process data  
  Endpoint: POST /api/v1/process with JSON body {"function": "sma", "data": [...], "period": 20}  
  Example:  
  ```javascript
  fetch('http://api.openclaw.ai/api/v1/process', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.MARKET_API_KEY}` },
    body: JSON.stringify({function: 'sma', data: [/* array */], period: 20})
  }).then(res => res.json());
  ```

- Config Format: Use a JSON file for settings  
  Example config.json:  
  ```json
  {
    "api_endpoint": "http://api.openclaw.ai",
    "default_interval": "1min",
    "cache_ttl": 300
  }
  ```
  Load it with: `claw market-data config load path/to/config.json`

### Integration Notes
Integrate by wrapping skill functions in your app's code; ensure `$MARKET_API_KEY` is set in your environment. For web apps, use async calls to avoid blocking. If combining with other skills, pipe output via stdin/stdout, e.g., `claw market-data fetch --symbol AAPL | claw trading-execution analyze`. Handle rate limits by adding delays or using the built-in retry mechanism with `--retry-count 3`. Test integrations in a sandbox environment first.

### Error Handling
Check for API errors by parsing response codes; common ones include 401 (unauthorized) if `$MARKET_API_KEY` is missing or invalid. Use try-catch in code snippets:  
```python
try:
    response = requests.get(...)  # as above
    response.raise_for_status()
except requests.exceptions.HTTPError as err:
    print(f"Error: {err} - Check API key or endpoint")
```
For CLI, add `--verbose` to log errors, e.g., `claw market-data fetch --symbol AAPL --verbose`. Retry transient errors with exponential backoff; configure via config.json as {"retry_policy": {"max_retries": 5, "backoff": 2}}. Always validate inputs to prevent malformed requests.

### Concrete Usage Examples
1. Fetch and analyze stock price in a Python script:  
   Set `$MARKET_API_KEY=your_key`. Then:  
   ```python
   import os
   import requests
   symbol = 'AAPL'
   response = requests.get(f'http://api.openclaw.ai/api/v1/stocks/{symbol}', headers={'Authorization': f'Bearer {os.environ["MARKET_API_KEY"]}'})
   price = response.json()['price']
   print(f"Current price of {symbol}: {price}")
   ```
   This outputs the live price for immediate use in a trading algorithm.

2. Process historical data via CLI for trading signals:  
   First, fetch data: `claw market-data fetch --symbol TSLA --interval daily --output history.json`.  
   Then process: `claw market-data process --input history.json --function rsi --period 14`.  
   Output: A JSON with RSI values, which you can feed into a decision-making script for buy/sell signals.

### Graph Relationships
- Related to: trading-execution (fetches data for order placement), financial-analysis (provides processed data for reports).
- Depends on: authentication-service (for API key validation).
- Used by: portfolio-management (integrates market data for asset allocation).
