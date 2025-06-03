# Reports and Exports API

This module provides endpoints for generating custom reports and exporting data from the Care Point system.

## Endpoints

### 1. Generate Custom Report
**POST** `/api/v1/reports/generate`

Generate a custom report with specified parameters.

#### Request Body
```json
{
  "title": "Monthly Appointments Report",
  "type": "appointments",
  "dateRange": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.000Z"
  },
  "filters": {
    "status": "completed",
    "doctorId": "507f1f77bcf86cd799439011"
  },
  "format": "pdf",
  "includeDetails": true,
  "groupBy": "date"
}
```

#### Response
```json
{
  "statusCode": "10000",
  "message": "Report generation initiated successfully",
  "data": {
    "id": "report_1703776800000",
    "title": "Monthly Appointments Report",
    "type": "appointments",
    "generatedAt": "2024-01-01T12:00:00.000Z",
    "format": "pdf",
    "filters": {...},
    "dateRange": {...},
    "status": "completed",
    "downloadUrl": "/api/reports/download/report_1703776800000"
  }
}
```

### 2. List Report Templates
**GET** `/api/v1/reports/templates`

Get a list of predefined report templates.

#### Response
```json
{
  "statusCode": "10000",
  "message": "Report templates retrieved successfully",
  "data": [
    {
      "id": "appointments-daily",
      "name": "Daily Appointments Report",
      "description": "Daily summary of appointments with status breakdown",
      "type": "appointments",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### 3. Export Appointments Data
**GET** `/api/v1/exports/appointments`

Export appointments data in various formats.

#### Query Parameters
- `format` (optional): Export format - csv, excel, json (default: csv)
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `status` (optional): Filter by appointment status
- `doctorId` (optional): Filter by doctor ID
- `patientId` (optional): Filter by patient ID
- `limit` (optional): Maximum number of records (default: 1000)

#### Example
```
GET /api/v1/exports/appointments?format=csv&status=completed&limit=500
```

#### Response
Returns the exported data as a file download with appropriate headers:
- `Content-Type`: Depends on format (text/csv, application/json, etc.)
- `Content-Disposition`: attachment; filename="export_timestamp.ext"

### 4. Export Patient Data
**GET** `/api/v1/exports/patients`

Export patient data in various formats.

#### Query Parameters
- `format` (optional): Export format - csv, excel, json (default: csv)
- `startDate` (optional): Start date for filtering (based on creation date)
- `endDate` (optional): End date for filtering (based on creation date)
- `status` (optional): Filter by patient status
- `limit` (optional): Maximum number of records (default: 1000)

#### Example
```
GET /api/v1/exports/patients?format=json&status=active
```

### 5. Export Inventory Data
**GET** `/api/v1/exports/inventory`

Export inventory data in various formats.

#### Query Parameters
- `format` (optional): Export format - csv, excel, json (default: csv)
- `pharmacyId` (optional): Filter by pharmacy ID
- `limit` (optional): Maximum number of records (default: 1000)

#### Example
```
GET /api/v1/exports/inventory?format=csv&pharmacyId=507f1f77bcf86cd799439011
```

### 6. Export Sales Data
**GET** `/api/v1/exports/sales`

Export sales/orders data in various formats.

#### Query Parameters
- `format` (optional): Export format - csv, excel, json (default: csv)
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `status` (optional): Filter by order status
- `pharmacyId` (optional): Filter by pharmacy ID
- `limit` (optional): Maximum number of records (default: 1000)

#### Example
```
GET /api/v1/exports/sales?format=excel&status=COMPLETED&startDate=2024-01-01&endDate=2024-01-31
```

## Authentication

All endpoints require authentication. Include the authorization header:
```
Authorization: Bearer <your-access-token>
```

## Data Formats

### CSV
- Headers are automatically generated from data keys
- String values containing commas are quoted
- File extension: `.csv`

### JSON
- Pretty-printed JSON format
- File extension: `.json`

### Excel (Placeholder)
- Currently returns JSON format (placeholder for future Excel implementation)
- File extension: `.xlsx`
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

## Report Types

Available report types for custom report generation:
- `appointments`: Appointment-related reports
- `patients`: Patient data reports
- `inventory`: Inventory and stock reports
- `sales`: Sales and revenue reports
- `custom`: Custom report configurations

## Error Handling

All endpoints follow the standard API error response format:
```json
{
  "statusCode": "10001",
  "message": "Error description"
}
```

Common error scenarios:
- Invalid date ranges
- Unauthorized access
- Invalid filter parameters
- Resource not found

## Future Enhancements

- PDF report generation with charts and graphs
- Excel export with proper formatting and multiple sheets
- Scheduled report generation
- Report caching and storage
- Advanced filtering and aggregation options
- Email delivery of generated reports 