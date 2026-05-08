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


🚀 15. API Endpoints
Create BOM
POST /manufacturing/bom
Create Production Order
POST /manufacturing/orders
Complete Production
POST /manufacturing/complete
Manufacturing Reports
GET /manufacturing/reports

🚀 15. API Endpoints
Process Payroll
POST /payroll/process
Generate Payslip
POST /payroll/payslip
Payroll Reports
GET /payroll/reports
Employee Salary History
GET /employees/:id/payroll

🚀 16. API Endpoints
Check-In
POST /attendance/check-in
Check-Out
POST /attendance/check-out
Attendance Reports
GET /attendance/reports
Attendance Correction
POST /attendance/correction

🚀 14. API Endpoints
Create Employee
POST /employees
Upload Documents
POST /employees/:id/documents
Employee Directory
GET /employees
Employee Profile
GET /employees/:id

🚀 14. API Endpoints
Create Staff
POST /employees
Assign Role
POST /employees/:id/role
Staff Activity Logs
GET /employees/activity
Performance Reports
GET /employees/performance

🚀 14. API Endpoints
Generate GST Invoice
POST /gst/invoice
Generate e-Way Bill
POST /gst/eway-bill
GST Summary
GET /gst/summary
GST Return Data
GET /gst/returns

🚀 14. API Endpoints
Create Expense
POST /expenses
Upload Receipt
POST /expenses/:id/attachment
Expense Reports
GET /expenses/reports
Monthly Expense Summary
GET /expenses/monthly-summary


🚀 13. API Endpoints
Receive Payment
POST /payments/receive
Make Supplier Payment
POST /payments/pay
Payment Reports
GET /payments/reports
Outstanding Balances
GET /payments/outstanding

13. API Endpoints
Create Warehouse
POST /warehouses
Transfer Stock
POST /warehouses/transfer
Get Warehouse Stock
GET /warehouses/:id/stock
Warehouse Reports
GET /warehouses/reports

🚀 14. API Endpoints
Get Current Stock
GET /stock
Update Stock
PATCH /stock/:id
Transfer Stock
POST /stock/transfer
Stock Movement History
GET /stock/movements

🚀 11. API Endpoints
Create Return
POST /returns
Approve Return
PATCH /returns/:id/approve
Process Refund
POST /returns/:id/refund
Return Reports
GET /returns/reports


🚀 10. API Endpoints
Create Supplier
POST /suppliers
Get Supplier Ledger
GET /suppliers/:id/ledger
Record Payment
POST /suppliers/:id/payment
Outstanding Payables
GET /suppliers/outstanding

