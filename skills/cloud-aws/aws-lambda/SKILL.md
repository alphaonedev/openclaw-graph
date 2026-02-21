---
name: aws-lambda
cluster: cloud-aws
description: "AWS Lambda is a serverless computing service that executes code in response to events without managing servers."
tags: ["aws","lambda","serverless"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws lambda serverless functions event-driven compute"
---

## aws-lambda

### Purpose
AWS Lambda is a serverless compute service that runs code in response to events, handling scaling and infrastructure automatically. It executes functions in languages like Python, Node.js, or Java without managing servers, ideal for event-driven workloads.

### When to Use
Use AWS Lambda for short-lived tasks triggered by events, such as file uploads to S3 or API requests. It's suitable when you need automatic scaling, cost efficiency (pay per invocation), or integration with AWS services. Avoid it for long-running processes (>15 minutes) or high-compute needs better suited to EC2.

### Key Capabilities
- Supports multiple runtimes: Python, Node.js, Java, .NET, Go, Ruby.
- Automatic scaling: Handles up to 1,000 concurrent executions per account by default.
- Event sources: Integrates with S3, DynamoDB, Kinesis, API Gateway for triggers.
- Function limits: Up to 10 GB memory, 15-minute timeout, 6 MB payload size.
- Environment variables: Securely pass configs via Lambda console or CLI, e.g., set `AWS_LAMBDA_FUNCTION_MEMORY_SIZE=512`.

### Usage Patterns
- Event-driven processing: Trigger a Lambda on S3 object creation to process files.
- API backends: Use with API Gateway for RESTful services; invoke Lambda via HTTP POST.
- Scheduled tasks: Set up cron-like jobs with CloudWatch Events for periodic execution.
- Data processing: Stream data from Kinesis and transform it in Lambda before storing in DynamoDB.

### Common Commands/API
Use AWS CLI for Lambda management; requires AWS credentials via env vars like `$AWS_ACCESS_KEY_ID` and `$AWS_SECRET_ACCESS_KEY`. API endpoint: `https://lambda.us-east-1.amazonaws.com` (region-specific).

- Create a function: `aws lambda create-function --function-name myFunction --zip-file fileb://function.zip --handler index.handler --runtime nodejs14.x --role arn:aws:iam::123456789012:role/lambda-role`
- Update code: `aws lambda update-function-code --function-name myFunction --zip-file fileb://new-function.zip`
- Invoke synchronously: `aws lambda invoke --function-name myFunction out.txt --payload '{"key": "value"}'`
- List functions: `aws lambda list-functions --max-items 10`
- API call example: Use POST to `/2015-03-31/functions/{FunctionName}/invocations` with JSON payload, e.g., curl request: `curl -X POST https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/myFunction/invocations -H "X-Amz-Invocation-Type: RequestResponse" -d '{"key": "value"}'`
- Delete function: `aws lambda delete-function --function-name myFunction`

### Integration Notes
Authenticate via AWS IAM roles; assign execution role with policies like `arn:aws:iam::aws:policy/AWSLambdaExecute`. For integrations:
- S3 trigger: In Lambda console, add S3 as event source; specify bucket and prefix in JSON config: `{"bucket": "my-bucket", "events": ["s3:ObjectCreated:*"]}`.
- API Gateway: Create a REST API, integrate with Lambda; set up proxy in API Gateway console, e.g., add endpoint with method integration pointing to Lambda ARN.
- Use env vars for secrets: Set `$AWS_LAMBDA_FUNCTION_SECRET` in function configuration for sensitive data, accessed in code as `process.env.AWS_LAMBDA_FUNCTION_SECRET`.
- Cross-service: For DynamoDB, grant Lambda permissions via IAM policy, e.g., add `dynamodb:PutItem` to the role.

### Error Handling
Handle errors in Lambda code by returning specific status codes or logging to CloudWatch. Use try-catch blocks in functions:
```python
try:
    result = process_data(event)
    return {'statusCode': 200, 'body': result}
except Exception as e:
    print(f"Error: {e}")
    return {'statusCode': 500, 'body': 'Internal Error'}
```
Monitor via CloudWatch Logs; set up dead-letter queues for failed invocations by configuring a target SQS queue in Lambda settings. Common errors: Invocation failures (e.g., timeout) return 429; check via `aws lambda get-function --function-name myFunction` for last invocation details. Retry patterns: Use exponential backoff in code or enable asynchronous invocation retries up to 2 times.

### Concrete Usage Examples
1. **Process S3 Uploads**: Create a Lambda to resize images on S3 upload. Command: `aws lambda create-function --function-name imageProcessor --zip-file fileb://lambda.zip --handler lambda_function.handler --runtime python3.8 --role arn:aws:iam::123456789012:role/lambda-exec`. Add S3 trigger: In console, select bucket and set event. Code snippet:
```python
import boto3
s3 = boto3.client('s3')
def handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        # Resize logic here
```
2. **Scheduled Backup**: Set up Lambda for daily database backups to S3. Use: `aws lambda create-function --function-name dailyBackup --zip-file fileb://backup.zip --handler index.handler --runtime nodejs14.x --role arn:aws:iam::123456789012:role/lambda-role`. Add CloudWatch Event: Schedule rule with cron expression "cron(0 2 * * ? *)". Code snippet:
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
exports.handler = async (event) => {
    await s3.putObject({ Bucket: 'backups', Key: 'daily.sql', Body: 'backup content' }).promise();
};
```

### Graph Relationships
- Belongs to: cluster:cloud-aws
- Integrates with: service:aws-s3 (for event triggers), service:aws-api-gateway (for HTTP endpoints), service:aws-dynamodb (for data storage)
- Depends on: service:aws-iam (for role permissions)
- Related to: skill:aws-ec2 (as alternative for compute), skill:aws-cloudwatch (for monitoring)
