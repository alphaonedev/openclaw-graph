---
name: iot-cloud
cluster: iot
description: "Cloud IoT platforms: AWS IoT Core, GCP IoT Core, Azure IoT Hub, fleet management"
tags: ["iot"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "iot-cloud iot"
---

# iot-cloud

## Purpose
This skill enables interaction with major cloud IoT platforms, including AWS IoT Core, GCP IoT Core, and Azure IoT Hub, for device management, data ingestion, and fleet operations. It focuses on automating IoT workflows like provisioning devices and handling telemetry.

## When to Use
Use this skill for IoT device management in cloud environments, such as scaling fleets of connected devices, integrating IoT data with backend services, or monitoring remote sensors. Apply it when dealing with AWS, GCP, or Azure IoT services, especially for real-time data processing or fleet-wide updates.

## Key Capabilities
- Provision and manage IoT devices on AWS IoT Core, including creating things and attaching policies.
- Handle device registry and telemetry in GCP IoT Core via Pub/Sub integration.
- Manage device identities and message routing in Azure IoT Hub, including direct method calls.
- Support fleet management features like bulk updates, shadow synchronization (AWS), and device twins (Azure).
- Query device states and handle secure connections using MQTT or HTTPS protocols across platforms.

## Usage Patterns
Always set environment variables for authentication first, e.g., export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID. Use SDKs for programmatic access; for AWS, install boto3 and import it. Pattern: Initialize client, perform operation, handle response. For CLI, prefix commands with platform-specific tools like `aws iot` or `gcloud iot`.

Example 1: Create an AWS IoT thing using boto3:
```python
import boto3
iot_client = boto3.client('iot')
response = iot_client.create_thing(thingName='MySensor')
print(response['thingArn'])
```

Example 2: Register a device on Azure IoT Hub using Azure CLI:
```bash
az iot hub device-identity create --hub-name MyHub --device-id MyDevice --edge-enabled
az iot hub device-identity show --hub-name MyHub --device-id MyDevice
```

For GCP, use gcloud CLI in scripts: First, authenticate with `gcloud auth login`, then create devices. Common pattern: Use loops for bulk operations, e.g., in a Python script with subprocess.

## Common Commands/API
For AWS IoT Core: Use AWS CLI or boto3 SDK. Command: `aws iot create-thing --thing-name Device1 --thing-type Sensor`. API endpoint: POST https://iot.us-east-1.amazonaws.com/things. Include flags like --attribute to add metadata, e.g., `aws iot create-thing --thing-name Device1 --attribute '{"location": "office"}'`.

For GCP IoT Core: Use gcloud CLI. Command: `gcloud iot devices create Device1 --registry=MyRegistry --region=us-central1 --project=MyProject`. API endpoint: POST https://cloudiot.googleapis.com/v1/projects/{project}/locations/{location}/registries/{registry}/devices. Config format: JSON payload for device config, e.g., {"id": "Device1", "credentials": [{"publicKey": {"format": "RSA_X509_PEM", "key": "-----BEGIN CERTIFICATE-----"}}]}.

For Azure IoT Hub: Use az CLI. Command: `az iot hub device-identity create --hub-name MyHub --device-id Device1 --auth-method x509_ca`. API endpoint: POST https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Devices/IotHubs/{hubName}/IotHubDevices/{deviceId}. Use env var for keys: $AZURE_IOT_HUB_CONNECTION_STRING.

General pattern: Pass authentication via env vars, e.g., $GOOGLE_APPLICATION_CREDENTIALS for GCP JSON key file.

## Integration Notes
Integrate by linking IoT services to other cloud components. For AWS, use AWS IoT Rules to route data to S3 or Lambda; configure via `aws iot create-topic-rule --rule-name MyRule --sql-version '2016-03-23' --sql "SELECT * FROM 'iot/topic'" --actions '{"lambda":{"functionArn":"arn:aws:lambda:region:account-id:function:function-name"}}'`. For GCP, connect to Pub/Sub: Use `gcloud pubsub topics create my-topic` and link in device registry. For Azure, integrate with Event Grid: `az eventgrid event-subscription create --name sub1 --source-resource-id /subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.Devices/IotHubs/{hub} --endpoint-type webhook --endpoint-url https://endpoint.com/api/updates`. Always validate schemas; use JSON for payloads. If using multiple platforms, manage credentials via a secrets manager like AWS Secrets Manager.

## Error Handling
Check for common errors like authentication failures (e.g., 403 Forbidden) by verifying env vars first, such as ensuring $AWS_SECRET_ACCESS_KEY is set. For AWS, catch ClientError in boto3: 
```python
try:
    iot_client.create_thing(thingName='Device1')
except iot_client.exceptions.ResourceAlreadyExistsException:
    print("Thing already exists; update instead.")
```
For GCP, handle via gcloud exit codes; check if command returns non-zero and retry with exponential backoff. Azure: Parse JSON error responses, e.g., if `az iot hub device-identity create` fails with "Conflict", use `az iot hub device-identity update`. Log errors with details like error codes (e.g., AWS: InvalidRequestException) and include retry logic for transient issues like network errors.

## Graph Relationships
- Part of cluster: iot
- Tagged with: iot
- Related to: Other skills in iot cluster for broader IoT ecosystems
