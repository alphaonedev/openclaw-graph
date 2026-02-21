---
name: gcp-pubsub
cluster: cloud-gcp
description: "Interact with Google Cloud Pub/Sub for scalable messaging and event-driven architectures."
tags: ["gcp","pubsub","messaging"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "gcp pubsub messaging google cloud publish subscribe event-driven"
---

# gcp-pubsub

## Purpose
This skill allows the AI to interact with Google Cloud Pub/Sub for publishing messages to topics, subscribing to receive messages, and managing resources, enabling scalable event-driven architectures.

## When to Use
Use this skill for decoupling microservices, real-time event processing (e.g., user actions triggering workflows), or handling high-volume messaging in applications like IoT data streams or notification systems. Apply it when you need reliable, at-least-once delivery for asynchronous communication.

## Key Capabilities
- Publish messages to topics with attributes for filtering.
- Create subscriptions for topics, supporting pull (polling) or push (webhook) delivery.
- Manage topics and subscriptions via API or CLI, with support for message ordering and dead-letter queues.
- Scale automatically to handle millions of messages per second, with global reach via multi-region topics.
- Integrate with other GCP services like Cloud Functions for event triggers.

## Usage Patterns
- **Event Publishing**: Send events from one service to another; e.g., a web app publishes user events to a topic for processing by backend services.
- **Subscription Handling**: Set up pull subscriptions for batch processing or push subscriptions to deliver messages to HTTP endpoints.
- **Fan-out Patterns**: Publish to a topic and have multiple subscribers react independently, such as logging and analytics services.
- Always authenticate first using `$GOOGLE_APPLICATION_CREDENTIALS` env var pointing to a service account JSON key.

## Common Commands/API
Use the gcloud CLI or Pub/Sub REST API. For authentication, set `$GOOGLE_APPLICATION_CREDENTIALS` to your service account key file.

- **CLI Commands**:
  - Create a topic: `gcloud pubsub topics create my-topic --project=my-project-id`
  - Publish a message: `gcloud pubsub topics publish my-topic --message="Hello, Pub/Sub" --attribute=key=value`
  - Create a subscription: `gcloud pubsub subscriptions create my-sub --topic=my-topic --ack-deadline=10`
  - Pull messages: `gcloud pubsub subscriptions pull my-sub --auto-ack`

- **API Endpoints**:
  - Publish: POST https://pubsub.googleapis.com/v1/projects/{project-id}/topics/{topic-id}:publish with JSON body: `{"messages": [{"data": base64_encoded_message}]}` 
  - Get subscription: GET https://pubsub.googleapis.com/v1/projects/{project-id}/subscriptions/{subscription-id}

- **Code Snippets (Python)**:
  - Publish a message:
    ```python
    from google.cloud import pubsub_v1
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path('my-project-id', 'my-topic')
    publisher.publish(topic_path, b'Hello, Pub/Sub')
    ```
  - Pull messages:
    ```python
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path('my-project-id', 'my-sub')
    response = subscriber.pull(subscription_path, max_messages=1)
    for msg in response.received_messages: print(msg.message.data)
    ```

## Integration Notes
- **Authentication**: Always export `$GOOGLE_APPLICATION_CREDENTIALS` as the path to your JSON key, e.g., `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"`. Use IAM roles for least privilege access.
- **Config Formats**: Topics and subscriptions are defined in JSON via API; for example, create a topic with: `{"name": "projects/my-project-id/topics/my-topic"}`. In code, use the google-cloud-pubsub library (install via `pip install google-cloud-pubsub`).
- **Integrations**: Link with Cloud Storage for message archiving or BigQuery for analytics. For push subscriptions, provide an HTTPS endpoint that can handle POST requests with message payloads.
- **Environment Setup**: Ensure the GCP project is set via `gcloud config set project my-project-id` before running commands.

## Error Handling
- Common errors: "Permission denied" (check IAM roles), "Resource not found" (verify topic/subscription exists), or "Deadline exceeded" (increase ack deadline).
- In code, use try-except blocks: 
  ```python
  try:
      publisher.publish(topic_path, b'Message')
  except Exception as e:
      print(f"Error: {e}");  # Log and retry if transient
  ```
- For CLI, check exit codes and use `--quiet` to suppress output, then parse errors. Retry transient errors like 503 with exponential backoff. Always validate inputs, e.g., ensure topic names follow the format `projects/{project}/topics/{topic}`.

## Concrete Usage Examples
1. **Publish a user event**: To notify a logging service, first create a topic if needed (`gcloud pubsub topics create user-events`), then publish: `gcloud pubsub topics publish user-events --message='User logged in' --attribute=event_type=login`. In code: Use the snippet above to publish from an app when a user action occurs.
2. **Subscribe to process orders**: Create a subscription (`gcloud pubsub subscriptions create order-sub --topic=orders`), then pull messages in a loop: Use the pull snippet to process e-commerce orders, e.g., in a Cloud Function triggered by the subscription.

## Graph Relationships
- Related to cluster: "cloud-gcp" (e.g., links to gcp-storage, gcp-compute for integrated workflows).
- Tags connections: "gcp" (shares with gcp-firestore), "pubsub" (unique), "messaging" (links to aws-sqs for cross-cloud comparisons).
