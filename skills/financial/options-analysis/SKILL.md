---
name: options-analysis
cluster: financial
description: "Analyzes financial options using quantitative models like Black-Scholes for pricing and risk evaluation."
tags: ["options","finance","analysis"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "financial options analysis trading quantitative models"
---

## options-analysis

### Purpose
This skill analyzes financial options using quantitative models like Black-Scholes for pricing and risk evaluation. It processes inputs such as stock price, strike price, time to expiration, volatility, and risk-free rate to output option prices and Greeks (e.g., delta, gamma).

### When to Use
Use this skill for real-time financial analysis in trading scenarios, such as pricing European call/put options, evaluating portfolio risks, or backtesting strategies. Apply it when you have access to market data and need quantitative insights, like in algorithmic trading or risk management dashboards.

### Key Capabilities
- Price options using Black-Scholes or binomial models.
- Compute Greeks (e.g., delta, gamma, theta, vega) for sensitivity analysis.
- Evaluate risk metrics like implied volatility and probability of exercise.
- Support batch processing for multiple options in a single call.
- Handle various asset types, including stocks and indices, with error bounds for invalid inputs.

### Usage Patterns
Invoke this skill via CLI for quick tests or integrate it into Python code for automated workflows. Always provide required parameters like stock price and volatility. Use JSON config files for complex inputs to avoid CLI length limits. For API calls, set the authentication header first using `$OPTIONS_API_KEY`. Example pattern: Load data from a file, run analysis, and parse results into a dataframe for further processing.

### Common Commands/API
Use the CLI command `claw options-analysis [subcommand] [flags]`. For API, send POST requests to `https://api.openclaw.ai/financial/options/price`.

- **Pricing Command**: `claw options-analysis price --model black-scholes --stock-price 100 --strike 105 --time 0.5 --volatility 0.2 --rate 0.05`
  - Outputs: JSON with price and Greeks, e.g., {"price": 5.23, "delta": 0.52}
  
- **Risk Evaluation Command**: `claw options-analysis risk --model black-scholes --stock-price 100 --strike 105 --time 1 --volatility 0.3 --iterations 1000`
  - Flags: `--iterations` for Monte Carlo simulations; defaults to 100 if omitted.
  
- **API Endpoint for Pricing**: POST to `/api/options/price` with body: `{"model": "black-scholes", "stock_price": 100, "strike": 105}`
  - Response: JSON object, e.g., {"call_price": 4.82, "put_price": 3.45}
  
- **Code Snippet (Python)**:
  ```python
  import requests
  headers = {"Authorization": f"Bearer {os.environ['OPTIONS_API_KEY']}"}
  response = requests.post("https://api.openclaw.ai/financial/options/price", json={"model": "black-scholes", "stock_price": 100}, headers=headers)
  print(response.json()['price'])
  ```
  
- **Config Format**: Use JSON files for inputs, e.g.,
  ```
  {
    "model": "black-scholes",
    "params": {"stock_price": 100, "strike": 105, "time": 1}
  }
  ```
  Pass via CLI: `claw options-analysis price --config path/to/config.json`

### Integration Notes
Integrate by importing the skill in OpenClaw workflows or calling via API. Authentication requires setting `$OPTIONS_API_KEY` as an environment variable before execution. For example, in a script: `export OPTIONS_API_KEY=your_api_key_here`. Handle dependencies like NumPy for post-processing results. If using in a larger application, wrap calls in try-except blocks and cache results for repeated queries to reduce API latency.

### Error Handling
Check for errors like invalid inputs (e.g., negative volatility) by validating parameters before calling. Common errors include HTTP 400 for missing fields or 401 for auth failures. In CLI, errors return as stderr messages, e.g., "Error: Volatility must be positive." In code, catch exceptions like `requests.exceptions.HTTPError` and retry with exponential backoff. Always log error details, such as "Invalid model: Use 'black-scholes' or 'binomial'." Test with sample data to ensure graceful handling.

### Concrete Usage Examples
1. **Example 1: Price a Call Option**  
   Use this to calculate the price of a call option on a stock:  
   `claw options-analysis price --model black-scholes --stock-price 150 --strike 155 --time 0.25 --volatility 0.15 --rate 0.02`  
   This outputs the price (e.g., 5.10) and can be piped to a script for trading decisions.

2. **Example 2: Evaluate Risk for a Portfolio**  
   For risk assessment on multiple options:  
   Create a config file `portfolio.json` with:  
   ```
   {"options": [{"stock_price": 200, "strike": 205, "time": 0.5}, {"stock_price": 50, "strike": 55, "time": 1}]}
   ```  
   Run: `claw options-analysis risk --config portfolio.json --model black-scholes`  
   This computes Greeks for each, helping identify high-risk positions.

### Graph Relationships
- Related to: financial-cluster (parent), options-trading-skill (sibling), risk-assessment-skill (dependent)
- Connects to: data-fetching-skill (for market data input), visualization-skill (for output graphing)
