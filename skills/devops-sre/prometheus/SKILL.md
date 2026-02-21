---
name: prometheus
cluster: devops-sre
description: "Prometheus is an open-source monitoring and alerting toolkit for collecting metrics from targets and generating alerts."
tags: ["monitoring","metrics","alerting"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "prometheus monitoring alerting metrics devops sre"
---

# prometheus

## Purpose
Prometheus is used for monitoring and alerting on metrics from various targets. It collects time-series data via HTTP pulls, stores it, and allows querying to trigger alerts.

## When to Use
Use this skill when monitoring infrastructure, applications, or services in a DevOps/SRE environment. Apply it for real-time metrics collection, anomaly detection, or scaling decisions, such as tracking server health in Kubernetes clusters or alerting on high error rates in microservices.

## Key Capabilities
- **Metrics Collection**: Scrapes HTTP endpoints using configurable jobs; specify targets in YAML config, e.g., `scrape_configs: - job_name: 'node' static_configs: - targets: ['localhost:9100']`.
- **Querying**: Use PromQL for data retrieval; example: query CPU usage with `rate(node_cpu_seconds_total{mode="idle"}[5m])`.
- **Alerting**: Define rules in YAML files to fire alerts; e.g., `groups: - name: example rules: - alert: HighCPU usage: (avg by(instance) (rate(node_cpu_seconds_total{mode="system"}[5m])) > 0.8) for: 1m`.
- **Storage and Retention**: Handles time-series data with configurable retention; set via `--storage.tsdb.retention.time=15d` flag.
- **Federation**: Aggregate metrics from multiple Prometheus instances for larger setups.

## Usage Patterns
To monitor a target, start by creating a YAML config file (e.g., prometheus.yml) with scrape jobs. Run the Prometheus server with that config. For querying, use the built-in API or integrate with tools like Grafana. Always set up alerting rules early. If using in a container, mount the config volume and expose the web port (default 9090). For production, enable authentication by setting `--web.external-url` and using basic auth with env vars like `$PROMETHEUS_AUTH_USER` and `$PROMETHEUS_AUTH_PASS`.

## Common Commands/API
- **CLI Commands**: Start server with `prometheus --config.file=prometheus.yml --web.listen-address=":9090" --storage.tsdb.path="/prometheus"`. Reload config dynamically with `curl -X POST http://localhost:9090/-/reload`. Use `promtool` for testing rules: `promtool check rules prometheus.rules.yml`.
- **API Endpoints**: Query metrics via GET /api/v1/query with query params, e.g., `curl "http://localhost:9090/api/v1/query?query=up"`. For range queries, use GET /api/v1/query_range?query=up&start=1630000000&end=1630003600&step=15s. If auth is required, include headers like `Authorization: Bearer $PROMETHEUS_API_KEY`.
- **Code Snippets**:
  ```go
  // Simple Go client to query Prometheus
  client, err := prometheus.NewClient(http.Client{}, "http://localhost:9090")
  result, err := client.Query(context.Background(), "up", time.Now())
  ```
  ```python
  # Python example using prometheus-api-client
  from prometheus_api_client import MetricsList
  metrics = MetricsList('http://localhost:9090/api/v1/query?query=up')
  print(metrics)
  ```
- **Config Formats**: Use YAML for main config; example snippet: `global: scrape_interval: 15s`. For alert rules, use YAML arrays as shown in Key Capabilities.

## Integration Notes
Integrate Prometheus with exporters (e.g., Node Exporter for system metrics) by adding scrape jobs in the config. For visualization, connect to Grafana by adding a Prometheus data source with URL like `http://prometheus:9090` and auth via env var `$GRAFANA_PROM_DS_KEY`. To federate, configure remote write in YAML: `remote_write: - url: 'http://federate-prometheus:9090/api/v1/write'`. If using with Kubernetes, deploy via Helm charts and set up ServiceMonitors with labels. Always handle API keys via env vars, e.g., export them as `$PROMETHEUS_API_KEY` for secure access.

## Error Handling
Common errors include config syntax issues (check with `promtool check config prometheus.yml`), scrape failures (verify targets and timeouts in config), or query errors (use API response codes like 422 for bad queries). To debug, enable logging with `--log.level=debug` and check logs for messages like "error scraping target". For API calls, handle HTTP errors: if status is 500, retry with exponential backoff; use code like:
```go
if err != nil && strings.Contains(err.Error(), "context deadline exceeded") { log.Fatal("Scrape timeout; increase timeout in config") }
```
Validate PromQL queries with the /api/v1/query endpoint first. If authentication fails (e.g., 401), ensure env var `$PROMETHEUS_AUTH_TOKEN` is set and passed correctly.

## Concrete Usage Examples
1. **Monitor a Local Web Server**: Create a prometheus.yml with: `scrape_configs: - job_name: 'web' metrics_path: '/metrics' static_configs: - targets: ['localhost:8080']`. Start Prometheus: `prometheus --config.file=prometheus.yml`. Query uptime: `curl "http://localhost:9090/api/v1/query?query=up{job='web'}"`. This collects metrics every 15 seconds and allows alerting if the server goes down.
2. **Set Up CPU Alert**: Define a rule file: `groups: - name: instance rules: - alert: HighCPU expr: avg by(instance) (rate(node_cpu_seconds_total{mode="system"}[5m])) > 0.9 for: 2m`. Load it via config: add `rule_files: ["alert.rules.yml"]` to prometheus.yml. Run `prometheus --config.file=prometheus.yml`. Integrate with Alertmanager by adding: `alerting: alertmanagers: - static_configs: - targets: ['localhost:9093']`. This triggers alerts for high CPU and sends notifications.

## Graph Relationships
- Belongs to cluster: devops-sre
- Tagged with: monitoring, metrics, alerting
- Related skills: (e.g., via tags) grafana for visualization, alertmanager for notifications
