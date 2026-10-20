# 🎯 Implementation Roadmap

Now that you have both the frontend and the API specification, here's your step-by-step guide to get the Team Holiday Tracker live.

## ✅ What's Complete

### Frontend (This Repository)
- ✅ Full Next.js 16 application with TypeScript
- ✅ Google OAuth authentication
- ✅ Team management UI
- ✅ Pending invitations UI (view and accept)
- ✅ Holiday gantt chart view
- ✅ GitHub Pages deployment workflow
- ✅ All documentation

### Backend Documentation
- ✅ Complete API specification
- ✅ Detailed implementation guide for your serverless API
- ✅ DynamoDB schemas
- ✅ Lambda handler examples
- ✅ Local development setup

## 🚀 Implementation Steps

### Phase 1: Local Development Setup (30 minutes)

#### 1. Google OAuth Setup
```bash
# Go to: https://console.cloud.google.com/
# 1. Select your project (or create one)
# 2. APIs & Services → Credentials
# 3. Create OAuth 2.0 Client ID
# 4. Add authorized origins:
#    - http://localhost:43123
#    - http://localhost:3001
# 5. Copy the client ID
```

#### 2. Configure Frontend
```bash
cd /path/to/this/repo
cp .env.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
# NEXT_PUBLIC_API_URL=http://localhost:3001

npm install
npm run dev  # Runs on http://localhost:43123
```

#### 3. Start API (In Another Terminal)
```bash
cd /path/to/trackmyholidays-api
npm install
npm start  # Runs on http://localhost:3001
```

At this point, you can test the existing API endpoints, but team endpoints won't work yet.

### Phase 2: Implement Team API (2-4 hours)

Follow `TEAM_API_IMPLEMENTATION.md` in this repo:

#### 1. Update serverless.yml
```bash
cd /path/to/trackmyholidays-api

# Add to serverless.yml:
# - 3 DynamoDB table definitions (teams, teamMembers, teamInvites)
# - 8 Lambda function definitions
# - Environment variables
# - IAM permissions
```

#### 2. Create Teams Directory
```bash
mkdir teams
cd teams

# Create these files:
touch teamStore.js memberStore.js inviteStore.js
touch create.js list.js update.js delete.js
touch getMembers.js removeMember.js invite.js getHolidays.js
```

#### 3. Implement Stores
Copy the store implementations from `TEAM_API_IMPLEMENTATION.md`:
- `teamStore.js` - Team CRUD operations
- `memberStore.js` - Membership operations  
- `inviteStore.js` - Invitation operations

#### 4. Implement Handlers
Copy the handler examples from `TEAM_API_IMPLEMENTATION.md`:
- Start with `list.js` (simple)
- Then `create.js`, `update.js`, `delete.js`
- Then `invite.js`, `getMembers.js`, `removeMember.js`
- Finally `getHolidays.js` (most complex - integrates with existing holidays)

#### 5. Add Offline Migrations
```bash
cd offline/migrations
# Create teams.json, teamMembers.json, teamInvites.json
# (Copy from TEAM_API_IMPLEMENTATION.md)
```

#### 6. Update Allowed Origins
```bash
cd config
# Edit allowedOrigins.json to add:
# "http://localhost:43123"
# "https://teams.trackmyholidays.com"
```

#### 7. Test Locally
```bash
npm start

# In another terminal:
# Generate a token and test endpoints (see TEAM_API_IMPLEMENTATION.md)
TOKEN=$(curl -X POST http://localhost:3001/generateToken \
  -H "Authorization: Bearer <your-google-token>" | jq -r .token)

curl -X POST http://localhost:3001/api/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Engineering"}'
```

### Phase 3: Deploy to Dev (15 minutes)

```bash
cd /path/to/trackmyholidays-api

# Create a PR - this auto-deploys to dev via GitHub Actions
git checkout -b add-team-endpoints
git add .
git commit -m "feat: add team management endpoints"
git push origin add-team-endpoints

# Create PR on GitHub
# GitHub Actions will:
# 1. Deploy to dev stage
# 2. Run live tests
# 3. Comment with the dev API URL
```

### Phase 4: Deploy Frontend to GitHub Pages (15 minutes)

```bash
cd /path/to/this/repo

# 1. Push to GitHub (if not already done)
git remote add origin <your-github-repo-url>
git push -u origin main

# 2. Configure GitHub Pages
# - Settings → Pages → Source: GitHub Actions

# 3. Add GitHub Secrets
# - Settings → Secrets and variables → Actions
# - Add: NEXT_PUBLIC_GOOGLE_CLIENT_ID
# - Add: NEXT_PUBLIC_API_URL (dev API URL from step 3)

# 4. Trigger deployment
git commit --allow-empty -m "trigger deploy"
git push
```

### Phase 5: Production Deployment (10 minutes)

#### 1. Deploy API to Prod
```bash
cd /path/to/trackmyholidays-api

# Merge PR to main - auto-deploys to prod
# API will be at: https://1q1v3hm1n2.execute-api.us-west-2.amazonaws.com/prod
```

#### 2. Update Frontend for Prod
```bash
cd /path/to/this/repo

# Update GitHub Secret:
# NEXT_PUBLIC_API_URL = https://1q1v3hm1n2.execute-api.us-west-2.amazonaws.com/prod

# Redeploy
git commit --allow-empty -m "update prod API URL"
git push
```

#### 3. Configure Custom Domain
```bash
# DNS (at your domain provider):
# CNAME: teams.trackmyholidays.com → your-username.github.io

# GitHub:
# Settings → Pages → Custom domain: teams.trackmyholidays.com
# Check "Enforce HTTPS"

# Google OAuth:
# Add to authorized origins: https://teams.trackmyholidays.com
```

## 📊 Testing Checklist

### Local Testing
- [ ] Can sign in with Google
- [ ] Can create a team
- [ ] Can invite a member (email sent if configured)
- [ ] Can view pending invitations
- [ ] Can accept invitations
- [ ] Can create sub-teams
- [ ] Can remove members
- [ ] Can delete teams
- [ ] Gantt chart loads with mock data
- [ ] Filters work (by person, by team)
- [ ] URL updates when filtering

### Production Testing
- [ ] Sign in works at teams.trackmyholidays.com
- [ ] All CRUD operations work
- [ ] Data persists correctly
- [ ] Invitations work
- [ ] Invitation acceptance works
- [ ] Real holidays display correctly
- [ ] Bank holidays show in gantt chart
- [ ] Mobile responsive
- [ ] Dark mode works

## 🐛 Common Issues

### "CORS error"
- Check `config/allowedOrigins.json` in API
- Ensure API is running
- Check browser console for exact origin

### "Unauthorized"
- Check Google OAuth client ID is correct
- Verify token is being sent in headers
- Check `authFunc` in API is working

### "Can't connect to API"
- Verify API is running (serverless-offline or deployed)
- Check API URL in .env.local
- Check network tab for actual URL being called

### "Holidays not showing"
- Verify `/api/teams/holidays` endpoint returns data
- Check existing holidays table has data
- Look at parseHolidaysFromUserData function

## 📚 Reference Documents

1. **INTEGRATION.md** - Overview and quick reference
2. **TEAM_API_IMPLEMENTATION.md** - Complete API implementation guide
3. **API_SPEC.md** - API endpoint specifications
4. **SETUP_GUIDE.md** - Frontend setup and deployment
5. **README.md** - Project overview and architecture

## 🎉 Launch Checklist

Before announcing to your team:

- [ ] Frontend deployed at teams.trackmyholidays.com
- [ ] API deployed to prod and working
- [ ] Google OAuth configured for production
- [ ] DNS configured and HTTPS working
- [ ] Invited yourself and tested full flow
- [ ] Created sample teams and data
- [ ] Tested on mobile device
- [ ] Tested with multiple users
- [ ] Bank holidays displaying correctly
- [ ] Error states look good (empty state, loading, errors)

## 🆘 Need Help?

If you get stuck:
1. Check the relevant documentation file
2. Look at the example code in TEAM_API_IMPLEMENTATION.md
3. Check the existing trackmyholidays-api patterns
4. Test with curl commands to isolate issues
5. Check CloudWatch logs (for API issues)
6. Check browser console (for frontend issues)

## 📈 Future Enhancements

Once the MVP is working, consider:

- [ ] Email notifications for invites (AWS SES)
- [ ] Team hierarchy visualization
- [ ] Export to calendar (ICS files)
- [ ] Slack integration
- [ ] Approval workflow for holiday requests
- [ ] Capacity planning (% of team away)
- [ ] Multi-day holiday blocks in gantt
- [ ] Holiday history and analytics
- [ ] Mobile app (React Native)

---

**Ready to start?** Begin with Phase 1 (Local Development Setup) above! 🚀
