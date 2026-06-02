# Rythu Connect AI API Documentation

This file documents the backend API endpoints available in `server.js`.

## Authentication

### POST /api/auth/register
Register a new user (farmer or buyer).

Request body:
- `fullName` (string, required)
- `email` (string, required)
- `password` (string, required)
- `phone` (string, optional)
- `role` (string, required, `farmer` or `buyer`)
- `village` (string, optional)
- `state` (string, optional)

Response:
- success: user metadata without password
- error: validation or duplicate email message

### POST /api/auth/login
Login and receive a JWT token.

Request body:
- `email` (string, required)
- `password` (string, required)

Response:
- `token` (JWT)
- `user` object

## Crops

### POST /api/crops
Create a crop listing.

Authorization: `Bearer <token>` for farmer role.

Form data:
- `cropName` (string)
- `description` (string)
- `quantity` (number)
- `unit` (string)
- `pricePerUnit` (number)
- `village` (string)
- `state` (string)
- `harvestDate` (date string)
- `certifications` (comma-separated string)
- `cropImage` (file)

### GET /api/crops
Get all crop listings with optional filters.

Query string parameters:
- `search` (string)
- `minPrice` (number)
- `maxPrice` (number)
- `state` (string)
- `farmerId` (string)

### GET /api/crops/:id
Get a single crop listing by ID.

### PUT /api/crops/:id
Update a crop. Farmer authorization required.

### DELETE /api/crops/:id
Delete a crop. Farmer authorization required.

## Orders

### POST /api/orders
Place an order for a crop.

Authorization: `Bearer <token>` for buyer role.

Request body:
- `cropId` (string)
- `cropName` (string)
- `farmerId` (string)
- `farmerName` (string)
- `quantity` (number)
- `totalPrice` (number)
- `deliveryAddress` (string)
- `expectedDelivery` (date string)

### GET /api/orders
Get orders for the authenticated user.
- Buyers see their own orders.
- Farmers see orders for their crops.

### GET /api/orders/:id
Get a specific order by ID with access control.

### PUT /api/orders/:id
Update order details. Farmer authorization required.

## Users

### GET /api/me
Get current authenticated user profile.

### GET /api/users/:id
Get profile for the authenticated user by ID.

### PUT /api/users/:id
Update own profile.

## Notes for contributors

- The server is currently implemented in `server.js`.
- Consider splitting routes into separate modules for maintainability.
- Improve request validation and error handling.
- Add API tests using `jest` and `supertest`.
- Add Swagger or OpenAPI documentation for better developer onboarding.
