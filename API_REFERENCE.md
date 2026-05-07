# 📡 API Reference

This document outlines the API endpoints and contracts used by the Books & Finance frontend application. The application communicates with a backend service via REST API.

## Base URL

All requests are prefixed with the base URL configured in `.env`:
`VITE_API_BASE_URL` (e.g., `http://localhost:8000/api/v1`)

## Authentication

(Authentication mechanism TBD - likely JWT or Session based, handled via headers in `src/api/client.js`)

## Stock / Assets

Manage inventory and assets.

### Get Stock Items
Retrieve a list of all stock items with optional filtering.

- **Endpoint**: `GET /stock`
- **Query Parameters**:
  - `search` (string): Search term for name or category.
  - `category` (string): Filter by category name.
  - `status` (string): Filter by status (e.g., 'In Stock', 'Low Stock').

**Response**:
```json
[
  {
    "id": 1,
    "name": "Office Paper A4",
    "category": "Stationery",
    "quantity": 15,
    "unit": "Reams",
    "value": "4,500",
    "status": "In Stock"
  },
  ...
]
```

### Get Stock Item Detail
Retrieve details for a single stock item.

- **Endpoint**: `GET /stock/:id`
- **Path Parameters**:
  - `id` (string|number): Unique identifier of the stock item.

**Response**:
```json
{
  "id": 1,
  "name": "Office Paper A4",
  "category": "Stationery",
  "quantity": 15,
  "unit": "Reams",
  "value": "4,500",
  "status": "In Stock",
  "description": "Premium A4 paper for daily use.",
  "lastUpdated": "2023-10-25T10:00:00Z"
}
```

### Get Stock Statistics
Retrieve aggregate statistics for the inventory.

- **Endpoint**: `GET /stock/stats`

**Response**:
```json
{
  "totalValue": "2,60,500",
  "totalItems": 26,
  "lowStockCount": 1,
  "inUseCount": 5,
  "categories": ["Stationery", "Electronics", "Pantry", "Furniture"]
}
```

## Error Handling

The API uses standard HTTP status codes.

- `200 OK`: Request succeeded.
- `204 No Content`: Request succeeded but no content returned.
- `400 Bad Request`: Invalid parameters or request body.
- `401 Unauthorized`: Authentication failed or missing.
- `403 Forbidden`: Authenticated user does not have permission.
- `404 Not Found`: Resource not found.
- `500 Internal Server Error`: Server-side error.

**Error Response Structure**:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```
