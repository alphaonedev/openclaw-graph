---
name: aws-cdk
cluster: cloud-aws
description: "Framework for defining and provisioning AWS cloud infrastructure using programming languages like TypeScript and Python."
tags: ["aws","cdk","infrastructure-as-code"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws cdk infrastructure as code cloud deployment provisioning"
---

# aws-cdk

## Purpose
AWS CDK (Cloud Development Kit) is an open-source framework for defining AWS cloud infrastructure as code, allowing users to write infrastructure definitions in programming languages like TypeScript or Python, which are then synthesized into CloudFormation templates for deployment.

## When to Use
Use AWS CDK for projects requiring repeatable, version-controlled infrastructure deployments, such as microservices architectures, CI/CD pipelines, or multi-environment setups on AWS. It's ideal when you need to integrate infrastructure code with application logic or leverage programming constructs for complex resource configurations.

## Key Capabilities
- Define AWS resources using high-level constructs (e.g., `Bucket` for S3, `Function` for Lambda) in code.
- Support for multiple languages via the JSII library, enabling reuse of constructs across TypeScript, Python, Java, etc.
- Built-in features for handling dependencies, permissions, and outputs, like automatic IAM role creation for Lambda functions.
- Integration with AWS services via CDK modules (e.g., `aws-cdk-lib/aws-lambda` for serverless apps).
- Environment management through stacks and contexts, such as specifying regions or accounts in code.

## Usage Patterns
Start by initializing a project: run `cdk init app --language typescript` in a new directory. Structure your code into stacks (e.g., one per environment) and use constructs for modular components. For example, import necessary modules, define resources in a stack class, and synthesize/deploy from the entry point. Always use version pinning in `package.json` for CDK dependencies, like `"aws-cdk-lib": "^2.0.0"`. Handle configurations via `cdk.json` for global settings or environment variables for dynamic values.

## Common Commands/API
Use the AWS CDK CLI for core operations. Authentication requires AWS credentials set as environment variables: `export AWS_ACCESS_KEY_ID=your_key` and `export AWS_SECRET_ACCESS_KEY=your_secret`.

- **cdk init**: Initialize a new project. Example: `cdk init app --language python` to create a Python app.
- **cdk synth**: Synthesize CloudFormation templates. Run `cdk synth --profile myprofile` to use a specific AWS profile.
- **cdk deploy**: Deploy stacks. Command: `cdk deploy MyStack --parameters MyParam=value --require-approval never` to skip approval prompts.
- **cdk destroy**: Tear down resources. Example: `cdk destroy MyStack --force` to bypass confirmation.
- API endpoints: CDK interacts with AWS CloudFormation API (e.g., via `cloudformation.amazonaws.com` for template uploads). In code, use constructs like `new s3.Bucket(this, 'MyBucket', { removalPolicy: cdk.RemovalPolicy.DESTROY });` to define an S3 bucket.
- Config formats: Use `cdk.json` for project settings, e.g., `{ "app": "npx ts-node bin/my-app.ts", "context": { "aws:region": "us-east-1" } }`.

## Integration Notes
Integrate AWS CDK with other tools by treating it as a build step in CI/CD pipelines (e.g., GitHub Actions or Jenkins). For example, in a GitHub workflow, add a step: `run: cdk deploy --require-approval never`. Combine with AWS SAM for serverless apps by importing SAM constructs or use Terraform via custom providers. For monitoring, export CDK outputs to AWS CloudWatch. Set environment variables for multi-account setups, like `export CDK_DEFAULT_ACCOUNT=123456789012`. Ensure compatibility by matching CDK versions with AWS CLI (e.g., CDK v2 requires AWS CLI v2+).

## Error Handling
Common errors include synthesis failures due to missing dependencies; resolve by running `npm install` or checking imports. For deployment issues, use `cdk deploy --verbose` to debug CloudFormation errors, such as permission denials—fix by adding IAM policies in code, e.g., `lambdaFunction.addToRolePolicy(new iam.PolicyStatement({ actions: ['s3:GetObject'], resources: ['arn:aws:s3:::my-bucket/*'] }));`. Handle runtime errors in Lambda constructs by wrapping code in try-catch blocks. If authentication fails, verify env vars and use `aws sts get-caller-identity` to test credentials. Always include error outputs in logs for traceability.

## Concrete Usage Examples
1. **Deploy a simple S3 bucket**: Create a file `lib/my-stack.ts` with:
   ```typescript
   import * as cdk from 'aws-cdk-lib';
   import * as s3 from 'aws-cdk-lib/aws-s3';
   export class MyStack extends cdk.Stack {
     constructor(scope: cdk.App, id: string) { super(scope, id); new s3.Bucket(this, 'MyBucket'); }
   }
   ```
   Then run `cdk synth` and `cdk deploy MyStack` to provision the bucket in your AWS account.

2. **Set up a Lambda with API Gateway**: In `lib/lambda-stack.ts`:
   ```typescript
   import * as cdk from 'aws-cdk-lib';
   import * as lambda from 'aws-cdk-lib/aws-lambda';
   import * as apigateway from 'aws-cdk-lib/aws-apigateway';
   export class LambdaStack extends cdk.Stack {
     constructor(scope: cdk.App, id: string) { super(scope, id); const fn = new lambda.Function(this, 'MyFunction', { runtime: lambda.Runtime.NODEJS_14_X, handler: 'index.handler' }); new apigateway.LambdaRestApi(this, 'Endpoint', { handler: fn }); }
   }
   ```
   Execute `cdk deploy` to create and expose the Lambda via API Gateway.

## Graph Relationships
- **Cluster**: Related to "cloud-aws" for AWS-specific cloud management skills.
- **Tags**: Connected to "aws" for general AWS tools, "cdk" for infrastructure-as-code frameworks, and "infrastructure-as-code" for IaC methodologies.
- **Dependencies**: Links to other skills like "aws-lambda" or "aws-s3" for resource-specific integrations.
