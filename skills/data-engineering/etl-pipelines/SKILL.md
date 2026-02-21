---
name: etl-pipelines
cluster: data-engineering
description: "Design and implement ETL pipelines for extracting, transforming, and loading data in data engineering workflows."
tags: ["etl","data-pipelines","data-engineering"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "etl pipelines data extraction transformation loading big data engineering"
---

## etl-pipelines

### Purpose
This skill enables OpenClaw to design and implement ETL pipelines for data extraction, transformation, and loading in data engineering workflows. It focuses on handling structured data sources like databases, files, and APIs, ensuring efficient data flow for analytics and reporting.

### When to Use
Use this skill when building data pipelines for batch processing, real-time data ingestion, or data migration. Apply it in scenarios involving large datasets (e.g., >1TB), integrating with tools like Apache Spark or AWS Glue, or automating ETL for BI dashboards.

### Key Capabilities
- Extract data from sources like CSV, JSON files, SQL databases, or APIs using connectors (e.g., JDBC for databases).
- Transform data with operations such as filtering, aggregation, or SQL queries (e.g., via Pandas or Spark DataFrames).
- Load data into targets like PostgreSQL, BigQuery, or S3 buckets with schema validation and error logging.
- Support for scheduling pipelines with cron-like expressions or integration with orchestration tools like Airflow.
- Handle incremental loads by tracking last processed timestamps or change data capture (CDC).

### Usage Patterns
To use this skill, invoke OpenClaw with specific ETL commands. Start by defining a pipeline configuration in JSON format, then execute it via CLI or API. For example, pass a config file like this:
```json
{
  "source": {"type": "file", "path": "data/input.csv"},
  "transform": {"operations": ["filter column='id' > 100"]},
  "destination": {"type": "postgres", "table": "processed_data"}
}
```
Structure pipelines modularly: extract first, then transform in memory or distributed environments, and finally load with retry mechanisms. Always set environment variables for authentication, e.g., export OPENCLAW_API_KEY=your_key.

### Common Commands/API
Use the OpenClaw CLI for ETL tasks. For instance:
- Create a pipeline: `openclaw etl create --config path/to/config.json --env $OPENCLAW_API_KEY`
  (Flags: --config for JSON file, --env for auth; outputs pipeline ID).
- Run a pipeline: `openclaw etl run <pipeline-id> --params '{"batch_size": 1000}'`
  (Flags: --params for runtime overrides; monitors progress via stdout).
- API endpoints: POST /v1/etl/pipelines to create, with body as JSON config; GET /v1/etl/pipelines/{id} to retrieve status.
For code integration, use OpenClaw's Python SDK:
```python
import openclaw
client = openclaw.Client(api_key=os.environ['OPENCLAW_API_KEY'])
pipeline = client.etl.create(config={'source': 'file.csv', 'transform': 'sql_query'})
client.etl.run(pipeline.id)
```
Always validate configs with `openclaw etl validate --file path/to/config.json` before execution.

### Integration Notes
Integrate this skill with data tools by referencing dependencies in your config, e.g., specify "engine": "spark" for distributed processing. For AWS, set env vars like $AWS_ACCESS_KEY_ID and use connectors like S3 for sources. Chain with other OpenClaw skills by passing outputs, e.g., pipe ETL results to a machine-learning skill. Ensure compatibility by matching data formats (e.g., Parquet for big data). For multi-tool setups, use webhooks: configure POST /v1/etl/webhook to trigger on external events.

### Error Handling
Handle errors by wrapping commands in try-catch blocks or using built-in flags like --retry 3 for automatic retries on transient failures (e.g., network issues). Check API responses for error codes (e.g., 400 for bad config, 500 for server errors) and log details. In code, use:
```python
try:
    client.etl.run(pipeline.id)
except openclaw.EtlError as e:
    print(f"Error: {e.code} - {e.message}; Retrying...")
```
Monitor logs with `openclaw etl logs <pipeline-id>` and set thresholds for failures, e.g., abort if >10% records fail validation. Use env vars for custom error handlers, like $ETL_ERROR_WEBHOOK_URL.

### Concrete Usage Examples
1. Extract from a CSV file, transform with SQL, and load into PostgreSQL:  
   First, create config: `{"source": {"type": "file", "path": "sales.csv"}, "transform": {"sql": "SELECT * FROM data WHERE amount > 100"}, "destination": {"type": "postgres", "table": "sales_filtered", "conn_str": "dbname=mydb"}}`  
   Then run: `openclaw etl create --config sales_config.json; openclaw etl run <id> --env $OPENCLAW_API_KEY`  
   This processes 1M rows in under 5 minutes on a standard setup.

2. Incremental ETL for a database source to BigQuery:  
   Config: `{"source": {"type": "mysql", "query": "SELECT * FROM orders WHERE updated_at > '2023-01-01'"}, "transform": {"operations": ["add_column": "processed_at=NOW()"}], "destination": {"type": "bigquery", "dataset": "my_dataset", "table": "orders_incremental"}}`  
   Execute: `openclaw etl run <pipeline-id> --params '{"incremental": true}'`  
   This handles daily updates, appending only new records.

## Graph Relationships
- Related to: data-engineering cluster (e.g., skills like data-warehousing, big-data-processing)
- Connected via tags: etl (links to data-pipelines), data-engineering (links to analytics-tools)
- Dependencies: Requires authentication with $OPENCLAW_API_KEY; integrates with external tools like Spark or Airflow for orchestration.
