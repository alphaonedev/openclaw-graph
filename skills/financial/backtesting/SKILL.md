---
name: backtesting
cluster: financial
description: "Test trading strategies on historical data to evaluate performance, risks, and profitability."
tags: ["backtesting","financial-analysis","trading-strategy"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "backtesting financial trading strategy historical data analysis"
---

## backtesting

### Purpose
This skill enables OpenClaw to perform backtesting on historical financial data, simulating trading strategies to measure metrics like returns, drawdowns, and Sharpe ratio. Use it to validate strategies before live trading, identifying potential flaws in logic or risk exposure.

### When to Use
Apply this skill when developing or refining trading strategies, such as evaluating a moving average crossover on stock data. Use it for quantitative analysis in algorithmic trading, portfolio optimization, or risk assessment, especially when historical data is available and strategies need empirical validation.

### Key Capabilities
- Simulate trades using historical price data from CSV, JSON, or API sources.
- Compute performance metrics including total return, volatility, maximum drawdown, and risk-adjusted returns.
- Support for common indicators like SMA, RSI, and Bollinger Bands via integrated libraries.
- Handle multiple assets or portfolios, with options for transaction costs, slippage, and position sizing.
- Output results in JSON format for easy parsing and visualization.

### Usage Patterns
To backtest a strategy, provide a Python script defining the strategy logic, historical data source, and parameters. Always set the API key via environment variable `$OPENCLAW_API_KEY` before running. For CLI, use flags to specify inputs; for API, send a POST request with a JSON payload. Validate data integrity first by checking for missing values or incorrect timestamps. Run tests iteratively, adjusting parameters based on initial results.

### Common Commands/API
Use the OpenClaw CLI for quick tests or the REST API for programmatic integration. Authentication requires setting `$OPENCLAW_API_KEY` in your environment.

- CLI Command: Run a backtest with a strategy file and data source.
  ```
  openclaw backtest --strategy strategy.py --data historical.csv --start-date 2020-01-01 --end-date 2023-01-01 --capital 10000
  ```
  This executes the strategy on the specified date range with initial capital.

- API Endpoint: POST to /v1/backtest with JSON body.
  ```
  curl -X POST https://api.openclaw.ai/v1/backtest \
  -H "Authorization: Bearer $OPENCLAW_API_KEY" \
  -d '{"strategy": "def trade(data): return buy if data['close'] > data['sma'] else sell", "data_source": "historical.csv", "params": {"start_date": "2020-01-01"}}'
  ```
  Expect a JSON response with keys like "returns" and "drawdown".

- Config Format: Use YAML for strategy configurations, e.g.,
  ```
  strategy:
    name: moving_average
    parameters:
      period: 20
      threshold: 0.05
  ```
  Load this via CLI with `--config strategy.yaml`.

### Integration Notes
Integrate with data providers like Yahoo Finance or Alpha Vantage by specifying URLs in the data source flag (e.g., `--data https://example.com/data.csv`). For Python workflows, import OpenClaw as a library: `import openclaw; result = openclaw.backtest(strategy_file='strategy.py', data='historical.csv')`. Ensure compatibility by using Python 3.8+ and handling dependencies via `pip install openclaw-finance`. If combining with other skills, chain outputs; for example, use results from a "data-fetch" skill as input here.

### Error Handling
Anticipate errors like invalid data formats, missing API keys, or strategy failures. Check for `$OPENCLAW_API_KEY` before execution; if absent, the command will exit with code 401. Handle runtime errors by wrapping calls in try-except blocks, e.g.,
```
try:
    openclaw.backtest(strategy='strategy.py', data='historical.csv')
except ValueError as e:
    print(f"Data error: {e} - Verify CSV columns match expected format.")
```
Common issues: Invalid dates return code 400; use `--verbose` flag for detailed logs. Always validate strategy code for syntax errors before running.

### Concrete Usage Examples
1. Backtest a simple SMA crossover strategy on Apple stock data:
   ```
   openclaw backtest --strategy examples/sma_crossover.py --data aapl_historical.csv --params '{"short_period": 10, "long_period": 30}' --capital 5000
   ```
   This simulates buying when short SMA crosses above long SMA, outputting metrics like 15% annual return.

2. Evaluate a portfolio strategy with multiple assets and fees:
   ```
   curl -X POST https://api.openclaw.ai/v1/backtest -H "Authorization: Bearer $OPENCLAW_API_KEY" -d '{"strategy": "portfolio_alloc.py", "data_source": ["aapl.csv", "goog.csv"], "params": {"fee_per_trade": 5.0}}'
   ```
   This assesses a diversified portfolio, calculating net returns after fees, e.g., 12% with 8% drawdown.

### Graph Relationships
- Related to: trading (dependency for strategy execution)
- Related to: financial-analysis (provides input data and metrics)
- Connected to: risk-management (outputs risk metrics for further analysis)
- Links with: data-fetch (uses fetched historical data as input)
