# RabbitShip-
An event-driven Node.js microservice for courier shipment management using RabbitMQ. Handles asynchronous booking, cancellation, tracking, and status retrieval for shipments by consuming messages from RabbitMQ exchanges and interacting with courier APIs.
📦 Courier RabbitMQ Service
An event-driven Node.js microservice for courier shipment management using RabbitMQ.
Handles asynchronous booking, cancellation, tracking, and status retrieval for shipments by consuming messages from RabbitMQ exchanges and interacting with courier APIs.

# 🚀 Features
Booking — Create shipments from order data.

Cancellation — Void shipments via courier API.

Tracking — Retrieve real-time tracking updates.

Status — Get the latest shipment status.

Fanout Exchange — Multiple consumers for different shipment operations.

MongoDB Storage — Persistent storage of tracking details.

# 🔄 System Flow
API Request (Postman)

User sends a request with an order payload (JSON) to your Express API endpoint.

Payload Preparation

The API maps incoming order data to the courier API payload format.

RabbitMQ (Fanout Exchange)

The prepared payload is published to a RabbitMQ exchange.

Relevant consumers (Booking, Cancel, Track, Status) receive messages via bound queues.

Courier API Call

The respective consumer sends an API request to the courier service (e.g., create shipment, cancel shipment, get status, get tracking).

MongoDB Database

Stores tracking ID and shipment details for later use in tracking/status calls.
