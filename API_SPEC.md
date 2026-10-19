# Team Holiday Tracker API Specification

This document outlines the API endpoints needed in the trackmyholidays backend to support the team management functionality.

## Base URL

```
https://api.trackmyholidays.com/api
```

## Authentication

All endpoints require Google OAuth authentication or a long-lived token from the trackmyholidays API. The access token should be included in the Authorization header:

```
Authorization: Bearer <google-id-token-or-long-lived-token>
```

The user ID is extracted from the token by the existing `authFunc` authorizer and available as `event.requestContext.authorizer.uid` in Lambda handlers.

## Endpoints

### 1. Get All Teams

```
GET /teams
```

Returns all teams the authenticated user has access to.

**Response:**
```json
{
  "teams": [
    {
      "id": "string",
      "name": "string",
      "parentId": "string | null",
      "memberIds": ["string"]
    }
  ]
}
```

### 2. Get Team Members

```
GET /teams/:teamId/members
```

Returns all members of a specific team.

**Response:**
```json
{
  "members": [
    {
      "id": "string",
      "email": "string",
      "name": "string",
      "picture": "string",
      "role": "admin | member",
      "teamIds": ["string"]
    }
  ]
}
```

### 3. Get Team Holidays

```
GET /teams/holidays?teamId=<id>&memberId=<id>
```

Returns all holidays for specified teams and/or members. This is the main endpoint that should filter out personal information and return only holiday data.

**Query Parameters:**
- `teamId` (optional, multiple): Team IDs to filter by
- `memberId` (optional, multiple): Member IDs to filter by

**Response:**
```json
{
  "members": [
    {
      "id": "string",
      "email": "string",
      "name": "string",
      "picture": "string",
      "role": "admin | member",
      "teamIds": ["string"]
    }
  ],
  "teams": [
    {
      "id": "string",
      "name": "string",
      "parentId": "string | null",
      "memberIds": ["string"]
    }
  ],
  "holidays": [
    {
      "id": "string",
      "userId": "string",
      "startDate": "ISO 8601 date string",
      "endDate": "ISO 8601 date string",
      "type": "holiday | bank-holiday",
      "title": "string"
    }
  ]
}
```

**Important:** This endpoint should return ONLY holiday-related information. Do not include other personal data like addresses, phone numbers, salary info, etc.

### 4. Invite Team Member

```
POST /teams/invite
```

Sends an invitation email to join one or more teams.

**Request Body:**
```json
{
  "email": "string",
  "teamIds": ["string"],
  "role": "admin | member"
}
```

**Response:**
```json
{
  "success": true,
  "inviteId": "string"
}
```

### 5. Remove Team Member

```
DELETE /teams/:teamId/members/:memberId
```

Removes a member from a team. Only admins can perform this action.

**Response:**
```json
{
  "success": true
}
```

### 6. Create Team

```
POST /teams
```

Creates a new team or sub-team.

**Request Body:**
```json
{
  "name": "string",
  "parentId": "string | null"
}
```

**Response:**
```json
{
  "team": {
    "id": "string",
    "name": "string",
    "parentId": "string | null",
    "memberIds": ["string"]
  }
}
```

### 7. Update Team

```
PATCH /teams/:teamId
```

Updates team information.

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:**
```json
{
  "team": {
    "id": "string",
    "name": "string",
    "parentId": "string | null",
    "memberIds": ["string"]
  }
}
```

### 8. Delete Team

```
DELETE /teams/:teamId
```

Deletes a team. Only admins can perform this action.

**Response:**
```json
{
  "success": true
}
```

## Data Models

### Team
```typescript
interface Team {
  id: string;
  name: string;
  parentId?: string;  // null for root teams
  memberIds: string[];
}
```

### TeamMember
```typescript
interface TeamMember {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'admin' | 'member';
  teamIds: string[];  // All teams this member belongs to
}
```

### Holiday
```typescript
interface Holiday {
  id: string;
  userId: string;
  startDate: string;  // ISO 8601 format
  endDate: string;    // ISO 8601 format
  type: 'holiday' | 'bank-holiday';
  title: string;
}
```

## Error Responses

All endpoints should return appropriate HTTP status codes and error messages:

```json
{
  "error": "string",
  "message": "string"
}
```

Common status codes:
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User doesn't have permission for this action
- `404 Not Found`: Resource not found
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Server error

## Security Considerations

1. **Privacy**: The `/teams/holidays` endpoint should filter out all personal information except what's needed for the holiday view
2. **Authorization**: Verify that users can only access teams they belong to
3. **Role-based Access**: Only admins should be able to invite, remove members, and delete teams
4. **Rate Limiting**: Implement rate limiting on invite endpoints to prevent abuse
5. **Input Validation**: Validate all inputs, especially email addresses
