---
name: gcp-bigquery
cluster: cloud-gcp
description: "Google Cloud\'s BigQuery is a serverless, fully managed data warehouse for running SQL queries on large datasets."
tags: ["bigquery","gcp","sql"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "gcp bigquery sql data warehouse analytics"
---

# gcp-bigquery

## Purpose
This skill allows the AI to interact with Google Cloud BigQuery, a serverless data warehouse for executing SQL queries on petabyte-scale datasets. Use it to perform analytics without managing servers.

## When to Use
Use this skill for large-scale data analysis, such as processing logs, business intelligence, or machine learning feature engineering. Apply it when datasets exceed traditional database limits, or when integrating with other GCP services like Storage or Pub/Sub. Avoid it for small-scale queries where simpler tools suffice.

## Key Capabilities
- Run SQL queries on structured and semi-structured data (e.g., JSON, Avro) without schema enforcement upfront.
- Automatically scale resources based on query complexity; for example, use partitioned tables for time-based data to reduce costs.
- Integrate with GCP ecosystem: link BigQuery datasets to Cloud Storage for imports or exports.
- Support for standard SQL with extensions, like geospatial functions (e.g., ST_GEOGFROMTEXT for location data).
- Real-time analytics via BigQuery Storage API for streaming data ingestion.

## Usage Patterns
Authenticate using `$GOOGLE_APPLICATION_CREDENTIALS` environment variable pointing to a JSON key file. Then, use the `bq` CLI or Python client for queries. For scripts, import the BigQuery library and handle connections via service accounts. Pattern: Set up a project, create datasets, and run queries in a loop for batch processing. For API calls, use HTTP requests with OAuth 2.0 tokens.

## Common Commands/API
Use the `bq` CLI tool for quick operations. Example: Authenticate with `gcloud auth application-default login`, then run queries.
- Command: `bq query "SELECT * FROM dataset.table LIMIT 10"` — Executes a simple query; add `--use_legacy_sql=false` for standard SQL.
- API Endpoint: POST to `https://bigquery.googleapis.com/bigquery/v2/projects/{projectId}/queries` with a JSON body like: `{"query": "SELECT COUNT(*) FROM dataset.table"}`.
- Python Snippet:
  ```python
  from google.cloud import bigquery
  client = bigquery.Client(project='your-project-id')
  query_job = client.query("SELECT * FROM dataset.table")
  results = query_job.result()
  ```
- Config Format: Use `bq init` to set up; datasets defined in JSON like: `{"datasetReference": {"datasetId": "my_dataset"}}`.
- For loading data: `bq load --source_format=CSV dataset.table gs://bucket/file.csv schema.json` — Specifies source, format, and schema file.

## Integration Notes
Set environment variable `$GOOGLE_APPLICATION_CREDENTIALS` to the path of your service account key (e.g., `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`). Integrate with other GCP services by referencing resources; e.g., query Cloud Storage data directly via `EXTERNAL_QUERY` functions. For apps, use the BigQuery client libraries in Python, Java, or Node.js. Handle pagination in API responses using `nextPageToken` from the response JSON. Ensure IAM roles like `roles/bigquery.user` are assigned for query permissions.

## Error Handling
Common errors include authentication failures (e.g., 403 Forbidden due to invalid credentials); check `$GOOGLE_APPLICATION_CREDENTIALS` and verify IAM roles. For query errors, parse the `errors` field in API responses, e.g., if a query fails with "Invalid table name," correct the SQL syntax. Use try-except in code:
  ```python
  try:
      query_job = client.query("SELECT * FROM invalid_table")
      query_job.result()
  except google.api_core.exceptions.BadRequest as e:
      print(e.errors[0]['message'])  # Output error details
  ```
Handle quota exceeded errors (e.g., 429) by implementing retries with exponential backoff. For CLI, use `--quiet` to suppress output and check exit codes programmatically.

## Concrete Usage Examples
1. **Query a Public Dataset**: To analyze Shakespeare works, run: `bq query --use_legacy_sql=false "SELECT word, SUM(word_count) as total FROM \`bigquery-public-data.samples.shakespeare\` GROUP BY word ORDER BY total DESC LIMIT 5"`. This returns the top 5 words; pipe output to a file for further processing.
2. **Load Data from CSV**: First, upload a CSV to GCS, then: `bq mk dataset.my_data` to create a dataset, followed by `bq load --autodetect --source_format=CSV dataset.my_data.table gs://your-bucket/data.csv`. Use this in a script to ingest user logs and query for daily aggregates.

## Graph Relationships
- Related to: cloud-gcp (cluster), as it's part of GCP services.
- Connected to: gcp-storage (for data integration), gcp-pubsub (for streaming), and sql-related skills like database-query for general SQL patterns.
