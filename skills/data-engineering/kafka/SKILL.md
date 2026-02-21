---
name: kafka
cluster: data-engineering
description: "Apache Kafka is a distributed event streaming platform for real-time data pipelines and streaming applications."
tags: ["kafka","event-streaming","data-pipelines"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "kafka apache streaming data pipelines real-time events"
---

## kafka

## Purpose
Apache Kafka is a distributed event streaming platform used for building real-time data pipelines and streaming apps, enabling high-throughput, fault-tolerant messaging.

## When to Use
Use Kafka for scenarios requiring real-time data ingestion and processing, such as log aggregation, event-driven architectures, or microservices communication; avoid it for simple queueing needs where lighter tools like RabbitMQ suffice.

## Key Capabilities
- Supports distributed streaming with topics, partitions, and replicas for scalability and durability.
- Offers exactly-once semantics via transactional APIs to prevent data loss or duplication.
- Handles high volumes with configurable retention policies, e.g., retaining messages for 7 days using `log.retention.hours=168` in broker config.
- Provides consumer groups for load balancing, where multiple consumers share a group ID to partition topic consumption.
- Integrates streaming processing via Kafka Streams API for stateful transformations, like aggregating events with `KTable` objects.

## Usage Patterns
To produce messages, create a topic first, then use a producer client; for consumption, subscribe to a topic and process messages in a loop. Always handle offsets manually or via auto-commit to avoid reprocessing. For batch processing, use Kafka Connect to ingest data from sources like databases. Pattern: Use idempotent producers for at-least-once delivery by setting `enable.idempotence=true` in producer configs.

## Common Commands/API
Use Kafka CLI for quick operations:
- Create a topic: `kafka-topics.sh --create --topic mytopic --bootstrap-server localhost:9092 --partitions 3 --replication-factor 2`
- Produce messages: `kafka-console-producer.sh --topic mytopic --bootstrap-server localhost:9092` (type messages and press Ctrl+D to send)
- Consume messages: `kafka-console-consumer.sh --topic mytopic --from-beginning --bootstrap-server localhost:9092 --group mygroup`
For API usage in Java:
- Producer example:
  ```java
  Properties props = new Properties(); props.put("bootstrap.servers", "localhost:9092");
  props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
  KafkaProducer<String, String> producer = new KafkaProducer<>(props);
  producer.send(new ProducerRecord<>("mytopic", "key", "value"));
  ```
- Consumer example:
  ```java
  Properties props = new Properties(); props.put("bootstrap.servers", "localhost:9092");
  props.put("group.id", "mygroup"); props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
  KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
  consumer.subscribe(Collections.singletonList("mytopic"));
  ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
  ```
Authenticate with SASL using env var: Set `$KAFKA_SASL_JAAS_CONFIG` to "org.apache.kafka.common.security.plain.PlainLoginModule required username='$SERVICE_API_KEY';".

## Integration Notes
Integrate Kafka with other systems via Kafka Connect for sources/sinks, e.g., JDBC connector for databases. For authentication, use SSL or SASL with keys from env vars like `$KAFKA_CLIENT_API_KEY`. When linking to Spark, configure Spark Streaming with `spark.kafka.bootstrap.servers` and include dependencies like `spark-sql-kafka-0-10_2.12`. For microservices, use Kafka as a backbone with producers sending events to topics and consumers reacting via webhooks. Always specify exact versions, e.g., Kafka 3.4.0 with Confluent Schema Registry at endpoint `http://localhost:8081/subjects`.

## Error Handling
Handle common errors like connection failures by checking broker availability and retrying with exponential backoff; for example, in code, wrap `producer.send()` in a try-catch and retry up to 3 times. If offsets are out of range, use `auto.offset.reset=earliest` in consumer configs to start from the beginning. For authentication errors (e.g., 401 Unauthorized), verify env vars like `$SERVICE_API_KEY` and ensure SASL mechanisms match. Log errors with details, e.g., in Java: `catch (KafkaException e) { log.error("Kafka error: {}", e.getMessage()); }`. Address broker crashes by monitoring replicas and using `min.insync.replicas=2` to enforce acknowledgment.

## Graph Relationships
- Belongs to cluster: data-engineering
- Related tags: event-streaming, data-pipelines, kafka
- Potential links: integrates with skills in data-engineering cluster, such as spark or hadoop for data processing pipelines.
