# Team API Implementation Guide

This guide shows how to add team management functionality to the existing `trackmyholidays-api` serverless backend.

## Overview

The team API will follow the existing patterns in the trackmyholidays API:
- AWS Lambda handlers in the `holidays/` or new `teams/` directory
- DynamoDB for team and membership data
- Google OAuth authentication via the existing `authFunc` authorizer
- CORS configuration from `config/allowedOrigins.json`

## Database Schema

### New DynamoDB Tables

Add these table definitions to `serverless.yml` under `resources.Resources`:

#### 1. Teams Table

```yaml
teamsTable:
  Type: AWS::DynamoDB::Table
  DeletionPolicy: Retain
  UpdateReplacePolicy: Retain
  Properties:
    AttributeDefinitions:
      - AttributeName: id
        AttributeType: S
      - AttributeName: parentId
        AttributeType: S
    KeySchema:
      - AttributeName: id
        KeyType: HASH
    GlobalSecondaryIndexes:
      - IndexName: parentId-index
        KeySchema:
          - AttributeName: parentId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
    ProvisionedThroughput:
      ReadCapacityUnits: 1
      WriteCapacityUnits: 1
    TableName: teams-${self:custom.myStage}
```

#### 2. Team Members Table

```yaml
teamMembersTable:
  Type: AWS::DynamoDB::Table
  DeletionPolicy: Retain
  UpdateReplacePolicy: Retain
  Properties:
    AttributeDefinitions:
      - AttributeName: id
        AttributeType: S
      - AttributeName: userId
        AttributeType: S
      - AttributeName: teamId
        AttributeType: S
    KeySchema:
      - AttributeName: id
        KeyType: HASH
    GlobalSecondaryIndexes:
      - IndexName: userId-index
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
      - IndexName: teamId-index
        KeySchema:
          - AttributeName: teamId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
    ProvisionedThroughput:
      ReadCapacityUnits: 1
      WriteCapacityUnits: 1
    TableName: teamMembers-${self:custom.myStage}
```

#### 3. Team Invites Table

```yaml
teamInvitesTable:
  Type: AWS::DynamoDB::Table
  DeletionPolicy: Retain
  UpdateReplacePolicy: Retain
  Properties:
    AttributeDefinitions:
      - AttributeName: id
        AttributeType: S
      - AttributeName: email
        AttributeType: S
    KeySchema:
      - AttributeName: id
        KeyType: HASH
    GlobalSecondaryIndexes:
      - IndexName: email-index
        KeySchema:
          - AttributeName: email
            KeyType: HASH
        Projection:
          ProjectionType: ALL
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
    ProvisionedThroughput:
      ReadCapacityUnits: 1
      WriteCapacityUnits: 1
    TableName: teamInvites-${self:custom.myStage}
```

### Environment Variables

Add to `provider.environment` in `serverless.yml`:

```yaml
TEAMS_TABLE: teams
TEAM_MEMBERS_TABLE: teamMembers
TEAM_INVITES_TABLE: teamInvites
```

### IAM Permissions

Add these table ARNs to the existing `iamRoleStatements` DynamoDB permissions:

```yaml
- "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TEAMS_TABLE}-${self:custom.myStage}"
- "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TEAMS_TABLE}-${self:custom.myStage}/index/*"
- "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TEAM_MEMBERS_TABLE}-${self:custom.myStage}"
- "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TEAM_MEMBERS_TABLE}-${self:custom.myStage}/index/*"
- "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TEAM_INVITES_TABLE}-${self:custom.myStage}"
- "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TEAM_INVITES_TABLE}-${self:custom.myStage}/index/*"
```

## Directory Structure

Create a new `teams/` directory following the existing pattern:

```
teams/
├── teamStore.js          # DynamoDB operations for teams
├── memberStore.js        # DynamoDB operations for members
├── inviteStore.js        # DynamoDB operations for invites
├── create.js             # POST /api/teams
├── update.js             # PATCH /api/teams/{id}
├── delete.js             # DELETE /api/teams/{id}
├── list.js               # GET /api/teams
├── getMembers.js         # GET /api/teams/{id}/members
├── removeMember.js       # DELETE /api/teams/{id}/members/{memberId}
├── invite.js             # POST /api/teams/invite
└── getHolidays.js        # GET /api/teams/holidays (main endpoint)
```

## Lambda Functions

Add these functions to `serverless.yml` under `functions`:

```yaml
# Teams
teamsList:
  handler: teams/list.list
  events:
    - http:
        path: api/teams
        method: get
        cors: ${self:custom.cors}
        authorizer: ${self:custom.authorizers.auth}

teamsCreate:
  handler: teams/create.create
  events:
    - http:
        path: api/teams
        method: post
        cors: ${self:custom.cors}
        authorizer: ${self:custom.authorizers.auth}

teamsUpdate:
  handler: teams/update.update
  events:
    - http:
        path: api/teams/{id}
        method: patch
        cors: ${self:custom.cors}
        authorizer: ${self:custom.authorizers.auth}

teamsDelete:
  handler: teams/delete.delete
  events:
    - http:
        path: api/teams/{id}
        method: delete
        cors: ${self:custom.cors}
        authorizer: ${self:custom.authorizers.auth}

teamsGetMembers:
  handler: teams/getMembers.getMembers
  events:
    - http:
        path: api/teams/{id}/members
        method: get
        cors: ${self:custom.cors}
        authorizer: ${self:custom.authorizers.auth}

teamsRemoveMember:
  handler: teams/removeMember.removeMember
  events:
    - http:
        path: api/teams/{id}/members/{memberId}
        method: delete
        cors: ${self:custom.cors}
        authorizer: ${self:custom.authorizers.auth}

teamsInvite:
  handler: teams/invite.invite
  events:
    - http:
        path: api/teams/invite
        method: post
        cors: ${self:custom.cors}
        authorizer: ${self:custom.authorizers.auth}

teamsGetHolidays:
  handler: teams/getHolidays.getHolidays
  events:
    - http:
        path: api/teams/holidays
        method: get
        cors: ${self:custom.cors}
        authorizer: ${self:custom.authorizers.auth}
```

## Implementation Examples

### 1. teamStore.js

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, 
        DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = `${process.env.TEAMS_TABLE}-${process.env.STAGE}`;

async function createTeam(id, name, parentId = null, createdBy) {
  const now = new Date().toISOString();
  const team = {
    id,
    name,
    parentId: parentId || null,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };

  await client.send(new PutCommand({
    TableName: tableName,
    Item: team,
    ConditionExpression: 'attribute_not_exists(id)',
  }));

  return team;
}

async function getTeam(id) {
  const result = await client.send(new GetCommand({
    TableName: tableName,
    Key: { id },
  }));
  return result.Item;
}

async function updateTeam(id, name) {
  const result = await client.send(new UpdateCommand({
    TableName: tableName,
    Key: { id },
    UpdateExpression: 'SET #name = :name, updatedAt = :updatedAt',
    ExpressionAttributeNames: { '#name': 'name' },
    ExpressionAttributeValues: {
      ':name': name,
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  }));
  return result.Attributes;
}

async function deleteTeam(id) {
  await client.send(new DeleteCommand({
    TableName: tableName,
    Key: { id },
  }));
}

async function listTeamsByUser(userId) {
  // This would query the memberStore to find teams for this user
  // Then fetch those teams
  const memberStore = require('./memberStore');
  const memberships = await memberStore.getMembershipsByUser(userId);
  const teamIds = memberships.map(m => m.teamId);
  
  // Fetch all teams (you might want to batch this)
  const teams = await Promise.all(teamIds.map(id => getTeam(id)));
  return teams.filter(t => t != null);
}

module.exports = {
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
  listTeamsByUser,
};
```

### 2. teams/getHolidays.js (Main Endpoint)

This is the most important endpoint - it returns everything the frontend needs in one call.

```javascript
const teamStore = require('./teamStore');
const memberStore = require('./memberStore');

async function getHolidays(event) {
  const userId = event.requestContext.authorizer.uid;
  const teamIds = event.queryStringParameters?.teamId 
    ? (Array.isArray(event.queryStringParameters.teamId) 
        ? event.queryStringParameters.teamId 
        : [event.queryStringParameters.teamId])
    : [];
  const memberIds = event.queryStringParameters?.memberId
    ? (Array.isArray(event.queryStringParameters.memberId)
        ? event.queryStringParameters.memberId
        : [event.queryStringParameters.memberId])
    : [];

  try {
    // Get all teams the user has access to
    let teams = await teamStore.listTeamsByUser(userId);
    
    // Filter by requested teams if specified
    if (teamIds.length > 0) {
      teams = teams.filter(t => teamIds.includes(t.id));
    }

    // Get all members from these teams
    const allMembers = [];
    const memberMap = new Map();
    
    for (const team of teams) {
      const teamMembers = await memberStore.getMembersByTeam(team.id);
      for (const member of teamMembers) {
        if (!memberMap.has(member.userId)) {
          memberMap.set(member.userId, {
            id: member.userId,
            email: member.email,
            name: member.name,
            picture: member.picture,
            role: member.role,
            teamIds: [team.id],
          });
        } else {
          memberMap.get(member.userId).teamIds.push(team.id);
        }
      }
    }
    
    let members = Array.from(memberMap.values());
    
    // Filter by requested members if specified
    if (memberIds.length > 0) {
      members = members.filter(m => memberIds.includes(m.id));
    }

    // Get holidays for all members
    // This assumes you have an existing holidays table
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
    const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    
    const userIds = members.map(m => m.id);
    const holidays = [];
    
    // You'll need to adjust this based on your existing holidays schema
    for (const uid of userIds) {
      const result = await client.send(new GetCommand({
        TableName: `holidays-${process.env.STAGE}`,
        Key: { id: uid },
      }));
      
      if (result.Item && result.Item.text) {
        // Parse the holidays from the existing format
        const userHolidays = parseHolidaysFromUserData(result.Item.text, uid);
        holidays.push(...userHolidays);
      }
    }
    
    // Add bank holidays
    const bankHolidays = await getBankHolidays();
    holidays.push(...bankHolidays);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        members,
        teams,
        holidays,
      }),
    };
  } catch (error) {
    console.error('Error getting team holidays:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to get team holidays' }),
    };
  }
}

function parseHolidaysFromUserData(userData, userId) {
  // Parse your existing holiday format and convert to the standard format
  const holidays = [];
  
  if (userData.booked && Array.isArray(userData.booked)) {
    userData.booked.forEach((date, index) => {
      holidays.push({
        id: `${userId}-${index}`,
        userId,
        startDate: date,
        endDate: date,
        type: 'holiday',
        title: 'Holiday',
      });
    });
  }
  
  return holidays;
}

async function getBankHolidays() {
  // Fetch UK bank holidays or return hardcoded ones
  // You could store these in DynamoDB or fetch from an external API
  return [
    {
      id: 'bh-2026-12-25',
      userId: 'system',
      startDate: '2026-12-25',
      endDate: '2026-12-25',
      type: 'bank-holiday',
      title: 'Christmas Day',
    },
    {
      id: 'bh-2026-12-26',
      userId: 'system',
      startDate: '2026-12-26',
      endDate: '2026-12-26',
      type: 'bank-holiday',
      title: 'Boxing Day',
    },
    // Add more bank holidays...
  ];
}

module.exports = { getHolidays };
```

### 3. teams/invite.js

```javascript
const { randomUUID } = require('crypto');
const inviteStore = require('./inviteStore');
const { OAuth2Client } = require('google-auth-library');

async function invite(event) {
  const userId = event.requestContext.authorizer.uid;
  const body = JSON.parse(event.body);
  const { email, teamIds, role } = body;

  if (!email || !teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email and teamIds are required' }),
    };
  }

  try {
    // Check if user has admin access to all specified teams
    const memberStore = require('./memberStore');
    for (const teamId of teamIds) {
      const membership = await memberStore.getMembership(userId, teamId);
      if (!membership || membership.role !== 'admin') {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'You must be an admin to invite members' }),
        };
      }
    }

    // Create invite
    const inviteId = randomUUID();
    const invite = await inviteStore.createInvite({
      id: inviteId,
      email,
      teamIds,
      role: role || 'member',
      invitedBy: userId,
    });

    // TODO: Send email invitation
    // You could use AWS SES or another email service

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        inviteId: invite.id,
      }),
    };
  } catch (error) {
    console.error('Error creating invite:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create invite' }),
    };
  }
}

module.exports = { invite };
```

## Update Allowed Origins

Add the team tracker domain to `config/allowedOrigins.json`:

```json
[
  "http://localhost:43123",
  "https://teams.trackmyholidays.com",
  "https://trackmyholidays.com",
  "https://famtree.buzz"
]
```

## Offline Development

Add table definitions to `offline/migrations/` for local development:

**offline/migrations/teams.json:**
```json
{
  "TableName": "teams-dev",
  "KeySchema": [{"AttributeName": "id", "KeyType": "HASH"}],
  "AttributeDefinitions": [
    {"AttributeName": "id", "AttributeType": "S"},
    {"AttributeName": "parentId", "AttributeType": "S"}
  ],
  "GlobalSecondaryIndexes": [{
    "IndexName": "parentId-index",
    "KeySchema": [{"AttributeName": "parentId", "KeyType": "HASH"}],
    "Projection": {"ProjectionType": "ALL"}
  }],
  "BillingMode": "PAY_PER_REQUEST"
}
```

Similar files for `teamMembers.json` and `teamInvites.json`.

## Testing

The team endpoints can be tested locally:

```bash
# Start local API
npm start

# Test with a token
TOKEN=$(curl -X POST http://localhost:3001/generateToken \
  -H "Authorization: Bearer <your-google-id-token>" | jq -r .token)

# Create a team
curl -X POST http://localhost:3001/api/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Engineering"}'

# Get team holidays
curl http://localhost:3001/api/teams/holidays \
  -H "Authorization: Bearer $TOKEN"
```

## Deployment

After implementing:

1. Deploy to dev: Push to a PR (auto-deploys via GitHub Actions)
2. Test the endpoints
3. Merge to main to deploy to prod

## Key Integration Points

1. **Authentication**: Already handled by existing `authFunc` authorizer
2. **User Context**: Available via `event.requestContext.authorizer.uid`
3. **Existing Holidays**: Integrate with the existing `holidays` table data
4. **Bank Holidays**: Could be stored in DynamoDB or fetched from an external API
5. **Email Invitations**: Consider AWS SES for sending invite emails

## Next Steps

1. Create the `teams/` directory structure
2. Implement the store modules (teamStore.js, memberStore.js, inviteStore.js)
3. Implement the Lambda handlers
4. Update serverless.yml with tables, functions, and permissions
5. Add offline migration files
6. Test locally with `npm start`
7. Deploy to dev and test with live data
8. Deploy to prod
