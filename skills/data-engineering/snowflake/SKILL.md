---
name: snowflake
cluster: data-engineering
description: "Utilizes Snowflake for cloud-based data warehousing, enabling scalable SQL queries and analytics on large datasets."
tags: ["snowflake","data-warehouse","cloud-analytics"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "snowflake data warehouse cloud sql analytics big data"
---

## Purpose
This skill allows the AI to leverage Snowflake for cloud-based data warehousing, enabling efficient SQL queries and analytics on large-scale datasets for data engineering tasks.

## When to Use
Use this skill for scenarios involving big data analytics, ETL pipelines, scalable SQL operations, or integrating with cloud storage. Apply it when datasets exceed on-premise capabilities, such as processing terabytes of data in real-time analytics or data warehousing for BI tools.

## Key Capabilities
- Execute scalable SQL queries using Snowflake's virtual warehouses, e.g., via the SnowSQL CLI or Python connector.
- Load/unload data from cloud storage like S3 using COPY INTO commands, supporting formats like CSV, JSON, or Parquet.
- Manage resources programmatically, such as creating databases with SQL: `CREATE DATABASE my_db;` or scaling warehouses via API calls to `/api/v2/warehouses`.
- Support for secure data sharing and zero-copy cloning, enabling quick data replication without duplication.
- Integrate with external tools via JDBC/ODBC drivers or the Snowflake REST API for authentication and query execution.

## Usage Patterns
Always authenticate using environment variables for security, e.g., set `$SNOWFLAKE_ACCOUNT`, `$SNOWFLAKE_USER`, and `$SNOWFLAKE_PASSWORD`. Start by establishing a connection in code, then execute queries in a try-except block. For CLI usage, pipe queries directly. Pattern for Python:
```python
import snowflake.connector
conn = snowflake.connector.connect(
    user=os.getenv('SNOWFLAKE_USER'),
    password=os.getenv('SNOWFLAKE_PASSWORD'),
    account=os.getenv('SNOWFLAKE_ACCOUNT')
)
cur = conn.cursor()
```
For repeated tasks, use stored procedures: define with `CREATE PROCEDURE proc_name() RETURNS VARCHAR AS $$ ... $$ LANGUAGE SQL;`, then call via `CALL proc_name();`. In workflows, check warehouse status before queries to avoid timeouts.

## Common Commands/API
Use SnowSQL CLI for interactive or scripted operations. Example command: `snowsql -a $SNOWFLAKE_ACCOUNT -u $SNOWFLAKE_USER -p $SNOWFLAKE_PASSWORD -d my_database -s my_schema -w my_warehouse -q "SELECT * FROM my_table LIMIT 10;"`. Include flags like `--noup` to skip prompts or `--format csv` for output formatting.

For API interactions, target the Snowflake REST API:
- Endpoint: POST /api/v2/statements for executing SQL, with JSON body: `{"sqlText": "SELECT * FROM my_table"}`.
- Authenticate via OAuth or key pairs; include headers like `Authorization: Bearer $SNOWFLAKE_TOKEN`.

Common SQL commands:
- Load data: `COPY INTO my_table FROM @my_stage/my_file.csv FILE_FORMAT = (TYPE = CSV);`
- Query optimization: Use `ALTER WAREHOUSE my_warehouse SET WAREHOUSE_SIZE = 'MEDIUM';` to scale resources.

## Integration Notes
Integrate Snowflake with Python via the `snowflake-connector-python` library; install with `pip install snowflake-connector-python`. For AWS S3, configure external stages: `CREATE STAGE my_s3_stage URL='s3://my-bucket/' CREDENTIALS=(AWS_KEY_ID='$AWS_ACCESS_KEY_ID' AWS_SECRET_KEY='$AWS_SECRET_ACCESS_KEY');`. Use env vars for keys, e.g., `$SNOWFLAKE_PRIVATE_KEY` for key-pair auth. When combining with other tools, wrap in a function: for Spark integration, use `spark.read.format("snowflake").options(**conn_params).load()`, ensuring compatible data types. Always validate schemas before integration to prevent type mismatches.

## Error Handling
Handle authentication errors by checking env vars first (e.g., if `$SNOWFLAKE_ACCOUNT` is unset, log "Missing account ID" and exit). For query errors, use try-except in Python:
```python
try:
    cur.execute("SELECT * FROM non_existent_table")
except snowflake.connector.errors.ProgrammingError as e:
    print(f"Error: {e.errno} - {e.msg}")
```
Common issues: 390110 (invalid credentials) – retry with refreshed tokens; 2003 (syntax error) – validate SQL strings. For API calls, check HTTP status codes (e.g., 401 for unauthorized) and implement retries with exponential backoff. Log all errors with context, like query text, to aid debugging.

## Concrete Usage Examples
1. Querying data: To count rows in a table, connect and execute: `snowsql -a $SNOWFLAKE_ACCOUNT -u $SNOWFLAKE_USER -q "SELECT COUNT(*) FROM my_table;"`. In code: `cur.execute("SELECT COUNT(*) FROM my_table"); result = cur.fetchone(); print(result[0])`. Use this for quick analytics reports.
2. Loading data from S3: First, create a stage if needed, then run: `COPY INTO my_table FROM @my_s3_stage/my_data.csv;`. In a script: `cur.execute("COPY INTO my_table FROM @my_s3_stage/my_data.csv FILE_FORMAT = (TYPE = CSV)"); conn.commit()`. This pattern is ideal for ETL jobs, ensuring data is transformed before loading.

## Graph Relationships
- Connected to: data-engineering cluster (e.g., shares resources with skills like Apache Airflow for orchestration).
- Related via tags: "snowflake" links to data-warehouse skills; "cloud-analytics" connects to tools like AWS Redshift or Google BigQuery for cross-platform analytics.
- Dependency: Requires authentication skills for handling $SNOWFLAKE_TOKEN; integrates with storage skills for S3 interactions.
