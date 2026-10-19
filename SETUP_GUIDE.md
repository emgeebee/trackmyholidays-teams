# Team Holiday Tracker - Setup Guide

## 🎯 What You Have

A complete, production-ready Team Holiday Tracker SPA with:

- ✅ Modern Next.js 16 application
- ✅ Google OAuth authentication
- ✅ Team management with hierarchical teams
- ✅ Gantt chart holiday visualization
- ✅ Responsive UI with dark mode
- ✅ GitHub Pages deployment workflow
- ✅ Complete API specification

## 🔧 Setup Steps

### 1. Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Configure the OAuth consent screen
6. Create credentials:
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:43123` (for local dev)
     - `https://teams.trackmyholidays.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:43123` (for local dev)
     - `https://teams.trackmyholidays.com` (for production)
7. Copy the Client ID

### 2. Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local and add:
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
# NEXT_PUBLIC_API_URL=http://localhost:3001  # Your API backend

# Run development server
npm run dev
```

### 3. Backend API Implementation

See `API_SPEC.md` for the complete specification. You need to implement these 8 endpoints in the trackmyholidays API:

**Essential endpoints:**
- `GET /api/teams` - List all teams
- `GET /api/teams/holidays` - Get team holidays (main data endpoint)
- `POST /api/teams/invite` - Invite team members
- `POST /api/teams` - Create teams
- `PATCH /api/teams/:teamId` - Update team
- `DELETE /api/teams/:teamId` - Delete team
- `GET /api/teams/:teamId/members` - Get team members
- `DELETE /api/teams/:teamId/members/:memberId` - Remove member

**Key requirement:** The `/api/teams/holidays` endpoint must:
- Accept `teamId` and `memberId` query parameters for filtering
- Return ALL relevant data in one payload (members, teams, holidays)
- Filter out personal information (only return holiday-related data)
- Include bank holidays in the response

### 4. GitHub Pages Deployment

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Source: Select "GitHub Actions"
4. Go to Settings → Secrets and variables → Actions
5. Add repository secrets:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `NEXT_PUBLIC_API_URL`: Your production API URL (e.g., https://api.trackmyholidays.com)
6. Push to main branch - deployment happens automatically!

### 5. Custom Domain Setup (teams.trackmyholidays.com)

**DNS Configuration:**
1. Add a CNAME record in your DNS:
   ```
   teams.trackmyholidays.com → your-github-username.github.io
   ```

**GitHub Configuration:**
1. Go to repository Settings → Pages
2. Custom domain: Enter `teams.trackmyholidays.com`
3. Check "Enforce HTTPS" (after DNS propagates)

The `public/CNAME` file is already included in the project.

### 6. OAuth Redirect URI Update

After deploying, update your Google OAuth settings:
- Add `https://teams.trackmyholidays.com` to Authorized JavaScript origins
- Add `https://teams.trackmyholidays.com` to Authorized redirect URIs

## 🎨 UI Overview

### Login Screen
- Clean, centered design
- "Sign in with Google" button
- Gradient background

### Main Application
- **Header:** Logo, app name, user info, logout button
- **Tabs:** Switch between Holiday Schedule and Team Management
- **Holiday Schedule Tab:**
  - 3-month gantt chart view
  - Filter by person or team
  - Color-coded holidays (blue = holiday, purple = bank holiday)
  - Navigation controls to move through months
- **Team Management Tab:**
  - Hierarchical team display
  - Create root teams and sub-teams
  - Invite members with role selection
  - Remove members and delete teams
  - View all team members with their details

## 📦 Project Structure

```
/workspace/
├── app/                    # Next.js app directory
│   ├── globals.css        # Styles with CSS variables
│   ├── layout.tsx         # Root layout with auth provider
│   ├── page.tsx           # Main page wrapper
│   └── home-content.tsx   # Main application component
├── components/
│   ├── ui/                # Reusable UI components
│   ├── holiday-gantt.tsx  # Gantt chart view
│   └── team-management.tsx # Team management UI
├── lib/
│   ├── types.ts           # TypeScript types
│   ├── auth-context.tsx   # Authentication context
│   ├── api.ts             # API client
│   └── utils.ts           # Utility functions
├── public/
│   ├── .nojekyll          # For GitHub Pages
│   └── CNAME              # Custom domain config
├── .github/workflows/
│   └── deploy.yml         # Deployment workflow
├── API_SPEC.md            # Backend API specification
└── README.md              # Main documentation
```

## 🔐 Security Notes

1. **Never commit** `.env.local` (it's in `.gitignore`)
2. Store secrets in GitHub Secrets for deployment
3. The API should validate user permissions before returning data
4. Use HTTPS in production
5. Rate limit the invite endpoint to prevent abuse

## 🐛 Troubleshooting

**Build fails:**
- Check that all environment variables are set
- Ensure Node.js 20+ is installed
- Run `npm install` to ensure dependencies are up to date

**Google OAuth not working:**
- Verify client ID is correct
- Check authorized origins match exactly (including http/https)
- Ensure OAuth consent screen is configured

**API calls failing:**
- Check that `NEXT_PUBLIC_API_URL` is correct
- Verify CORS is enabled on your API
- Check browser console for error messages
- Ensure API endpoints match the specification

**GitHub Pages not deploying:**
- Check Actions tab for build errors
- Verify secrets are set correctly
- Ensure GitHub Pages is enabled in repository settings

## 📞 Next Steps

1. ✅ Code is committed and pushed
2. ⏭️ Set up Google OAuth credentials
3. ⏭️ Implement backend API endpoints (see API_SPEC.md)
4. ⏭️ Configure GitHub repository and secrets
5. ⏭️ Set up DNS for custom domain
6. ⏭️ Deploy and test!

## 🎉 You're Ready!

The application is now ready to be deployed. Once you:
1. Configure Google OAuth
2. Implement the backend API
3. Set up GitHub Pages

Your team will have a beautiful, modern holiday tracking system at `teams.trackmyholidays.com`!
