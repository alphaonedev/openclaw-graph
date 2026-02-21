---
name: aws-rds
cluster: cloud-aws
description: "Managed service for setting up, operating, and scaling relational databases in the AWS cloud."
tags: ["aws","rds","database","cloud","relational"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws rds database managed service relational sql"
---

# aws-rds

## Purpose
This skill allows the AI to interact with AWS RDS for provisioning, managing, and scaling relational databases. It focuses on automating tasks like creating instances, backups, and monitoring.

## When to Use
Use this skill when deploying scalable relational databases in AWS, such as for web apps needing MySQL, PostgreSQL, or SQL Server. Apply it in scenarios requiring high availability, automated patching, or multi-AZ deployments, especially in cloud-native architectures.

## Key Capabilities
- Create and manage DB instances with specific engine types (e.g., MySQL, PostgreSQL) and configurations.
- Scale resources dynamically using instance classes (e.g., db.t2.micro for low-cost testing).
- Handle backups, snapshots, and point-in-time restores via automated or manual processes.
- Monitor performance metrics through CloudWatch integration, accessing endpoints like `https://monitoring.rds.amazonaws.com`.
- Support for read replicas and multi-AZ setups for failover, using parameters like `--multi-az` in CLI commands.

## Usage Patterns
To use this skill, authenticate with AWS credentials via environment variables (e.g., set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`). Invoke AWS CLI commands directly or integrate with SDKs in scripts. For example, in a Python script, import boto3 and call RDS client methods. Always specify regions (e.g., `--region us-west-2`) to avoid default region errors. Pattern: Wrap commands in try-except blocks for error handling, and use parameterized inputs to prevent injection risks.

## Common Commands/API
Use AWS CLI for quick operations or the RDS API via SDKs. Key commands:
- Create a DB instance: `aws rds create-db-instance --db-instance-identifier mydb --db-instance-class db.t2.micro --engine mysql --master-username admin --master-user-password pass123 --allocated-storage 20`
- Describe instances: `aws rds describe-db-instances --db-instance-identifier mydb`
- Modify instance: `aws rds modify-db-instance --db-instance-identifier mydb --apply-immediately --db-instance-class db.m5.large`
API endpoints via boto3 SDK:
```python
import boto3
rds_client = boto3.client('rds', region_name='us-west-2')
response = rds_client.create_db_instance(
    DBInstanceIdentifier='mydb',
    DBInstanceClass='db.t2.micro',
    Engine='mysql',
    MasterUsername='admin',
    MasterUserPassword='pass123',
    AllocatedStorage=20
)
```
Config formats: Use JSON for API requests, e.g., specify VPC security groups in `{ "VPCSecurityGroupIds": ["sg-12345678"] }`.

## Integration Notes
Integrate RDS with other AWS services by ensuring proper IAM roles and VPC configurations. For authentication, use environment variables like `$AWS_ACCESS_KEY_ID` and `$AWS_SECRET_ACCESS_KEY`. When combining with EC2, attach RDS to a subnet group via `--db-subnet-group-name my-subnet-group`. For Lambda integration, grant permissions in the execution role policy, e.g., add `"rds:DescribeDBInstances"` action. Use AWS SDKs for seamless calls; in code, handle sessions with `boto3.Session(aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'])`. Always validate inputs and use parameterized queries to avoid SQL injection.

## Error Handling
Common errors include authentication failures (e.g., "InvalidClientTokenId"), resolved by verifying `$AWS_ACCESS_KEY_ID`. Handle "DBInstanceNotFound" by checking instance existence before operations. For throttling, implement retries with exponential backoff, e.g., in Python:
```python
import time
try:
    rds_client.describe_db_instances(DBInstanceIdentifier='mydb')
except rds_client.exceptions.DBInstanceNotFoundFault as e:
    print("Instance not found:", e)
except rds_client.exceptions.ThrottlingException:
    time.sleep(5)  # Wait and retry
```
Parse error responses for codes like "InsufficientDBInstanceCapacity" and suggest alternatives, such as upgrading instance class.

## Concrete Usage Examples
1. **Create a MySQL DB for a web app**: First, set env vars: `export AWS_ACCESS_KEY_ID=your_key; export AWS_SECRET_ACCESS_KEY=your_secret`. Then, run: `aws rds create-db-instance --db-instance-identifier webapp-db --engine mysql --db-instance-class db.t2.micro --allocated-storage 20 --master-username admin --master-user-password securepass --vpc-security-group-ids sg-12345678`. Verify with `aws rds describe-db-instances --db-instance-identifier webapp-db`.
2. **Scale an existing DB instance**: For increased load, execute: `aws rds modify-db-instance --db-instance-identifier existing-db --db-instance-class db.m5.large --apply-immediately`. Monitor the operation and handle any errors by checking the response status.

## Graph Relationships
- Belongs to cluster: cloud-aws
- Related tags: aws, rds, database, cloud, relational
- Connected skills: aws-ec2 (for EC2-based applications accessing RDS), aws-s3 (for storing RDS backups)
