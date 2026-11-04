# Feature: Prepare payment details

## 1. User goal
Allow pet owners to review the selected service details and price before proceeding to payment.

## 2. Scope
- What it will do: Return payment details for a valid service using a server-side mock catalogue.
- What it will NOT do: Process actual payments, integrate payment gateways, access a real database, or require user login.

## 3. Request
- HTTP Method: GET
- Endpoint URL: /payments/prepare/:serviceId
- Input: serviceId (passed as a URL path parameter)

## 4. Service catalogue
| ID | Service Name | Price (SGD) |
|---|---|---|
| 1 | Vaccination | 35 |
| 2 | Pet Grooming | 50 |
| 3 | Boarding | 80 |

## 5. Successful response
- HTTP Status: 200 OK
- Response Format: JSON
- Response Body:
{
  "serviceId": 1,
  "serviceName": "Vaccination",
  "amount": 35,
  "currency": "sgd",
  "status": "READY_FOR_PAYMENT"
}

## 6. Unsuccessful response
- HTTP Status: 404 Not Found
- Returned when requested service ID does not exist in the catalogue.

Example:
{
  "error": "Service not found"
}

## 7. Acceptance criteria
- AC1: GET /payments/prepare/1 returns HTTP status 200 with serviceId 1, serviceName "Vaccination", amount 35, currency "sgd", and status "READY_FOR_PAYMENT".
- AC2: GET /payments/prepare/2 returns HTTP status 200 with serviceId 2, serviceName "Pet Grooming", amount 50, currency "sgd", and status "READY_FOR_PAYMENT".
- AC3: GET /payments/prepare/3 returns HTTP status 200 with serviceId 3, serviceName "Boarding", amount 80, currency "sgd", and status "READY_FOR_PAYMENT".
- AC4: GET /payments/prepare/999 returns HTTP status 404 with JSON {"error": "Service not found"}.
- AC5: Any successful response returns exactly 5 fields with correct data types (numbers for serviceId/amount; strings for others) and exact values for currency and status.

## 8. Open questions
- None (Scope is strictly limited to the classroom mock endpoint with no authentication or real payment gateway).