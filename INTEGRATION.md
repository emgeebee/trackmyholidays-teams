# Integration Summary

## API Repository
https://github.com/emgeebee/trackmyholidays-api

## What You Have

Your existing API is a **Serverless Framework** application with:
- AWS Lambda + API Gateway
- Node.js 22 runtime
- DynamoDB for data storage
- S3 for document storage  
- Google OAuth authentication
- Local development via `serverless-offline` on port 3001

## What Needs to Be Added

The team functionality requires:

### 1. Three New DynamoDB Tables
- `teams-{stage}` - Team hierarchy
- `teamMembers-{stage}` - User-team relationships
- `teamInvites-{stage}` - Pending invitations

### 2. Eight New Lambda Functions
All in a new `teams/` directory:
- `GET /api/teams` - List user's teams
- `POST /api/teams` - Create team
- `PATCH /api/teams/{id}` - Update team
- `DELETE /api/teams/{id}` - Delete team
- `GET /api/teams/{id}/members` - List team members
- `DELETE /api/teams/{id}/members/{memberId}` - Remove member
- `POST /api/teams/invite` - Invite member
- **`GET /api/teams/holidays`** - Main endpoint (returns all data)

### 3. Integration with Existing Holidays

The `/api/teams/holidays` endpoint needs to:
- Query your existing `holidays-{stage}` DynamoDB table
- Parse the existing holiday format (currently stored as `text` field)
- Combine with team membership data
- Return in the format the frontend expects

## Local Development Setup

### Terminal 1: Run the API
```bash
cd /path/to/trackmyholidays-api
npm start  # Starts serverless-offline on http://localhost:3001
```

### Terminal 2: Run the Frontend
```bash
cd /workspace
npm run dev  # Starts Next.js on http://localhost:43123
```

Both will connect automatically since `.env.local` is configured for `http://localhost:3001`.

## Implementation Approach

I've created `TEAM_API_IMPLEMENTATION.md` with:

✅ Complete DynamoDB table schemas for `serverless.yml`  
✅ Lambda function definitions  
✅ Store module examples (teamStore.js, memberStore.js)  
✅ Handler implementation examples  
✅ Integration with your existing auth and holidays data  
✅ Offline migration files for local DynamoDB  
✅ Testing examples  

## Production URLs

After deployment:
- **Dev API**: Auto-deployed on PR, URL in GitHub Actions logs
- **Prod API**: `https://1q1v3hm1n2.execute-api.us-west-2.amazonaws.com/prod`
- **Frontend**: `https://teams.trackmyholidays.com` (after DNS setup)

## Key Files to Update

In `trackmyholidays-api` repository:

1. **serverless.yml**
   - Add 3 DynamoDB table definitions
   - Add 8 Lambda function definitions
   - Add environment variables
   - Update IAM permissions

2. **config/allowedOrigins.json**
   ```json
   [
     "http://localhost:43123",
     "https://teams.trackmyholidays.com",
     "https://trackmyholidays.com",
     "https://famtree.buzz"
   ]
   ```

3. **Create teams/ directory**
   - teamStore.js
   - memberStore.js
   - inviteStore.js
   - 8 handler files (create.js, list.js, etc.)

4. **offline/migrations/**
   - teams.json
   - teamMembers.json
   - teamInvites.json

See `TEAM_API_IMPLEMENTATION.md` for complete code examples!

## Questions?

- **Holiday format**: Check your existing `holidays-{stage}` table to see the exact schema
- **Bank holidays**: Decide if you want to fetch from an external API or store in DynamoDB
- **Email invitations**: Consider AWS SES for production invite emails
- **Authorization**: The existing `authFunc` handles everything - just use `event.requestContext.authorizer.uid`
