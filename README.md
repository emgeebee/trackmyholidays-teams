# Team Holiday Tracker

A modern team holiday management and visualization application built with Next.js, designed to help teams coordinate and view holiday schedules at a glance.

## 🌟 Features

- **Google OAuth Authentication**: Secure sign-in with Google accounts
- **Team Management**: Create hierarchical teams and sub-teams, invite members, and manage access
- **Holiday Gantt Chart**: Visual timeline showing all team members' holidays
- **Smart Filtering**: Filter by person or team, with shareable URLs via query strings
- **Bank Holiday Support**: Distinguish between personal holidays and bank holidays
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn
- Google OAuth Client ID (from [Google Cloud Console](https://console.cloud.google.com/))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd teams-trackmyholidays
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=https://api.trackmyholidays.com
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

This is a static SPA (Single Page Application) built with:

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components built with shadcn/ui patterns
- **Authentication**: Google OAuth via @react-oauth/google
- **Date Handling**: date-fns
- **Deployment**: GitHub Pages (static export)

## 📡 API Integration

This application requires a backend API. See [API_SPEC.md](./API_SPEC.md) for the complete specification of required endpoints.

Key endpoints needed:
- `GET /api/teams` - List all teams
- `GET /api/teams/holidays` - Get team holidays (with filtering)
- `POST /api/teams/invite` - Invite team members
- `POST /api/teams` - Create teams
- `DELETE /api/teams/:id/members/:memberId` - Remove members

## 🎨 UI Components

The application uses a modern, accessible component library including:

- **Button**: Multiple variants (default, outline, ghost, etc.)
- **Input**: Form inputs with validation
- **Card**: Container components
- **Dialog**: Modal dialogs for forms
- **Select**: Dropdown selections

All components support dark mode and are fully responsive.

## 🔐 Authentication Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User authorizes the application
4. Access token and user info are stored in localStorage
5. All API requests include the Bearer token

## 📊 Holiday Gantt Chart

The gantt chart displays:
- **3-month view**: Current month plus next 2 months
- **Person rows**: Each team member gets a row
- **Day columns**: Each day in the period
- **Color coding**:
  - Blue: Personal holidays
  - Purple: Bank holidays
  - Gray: Weekends

## 👥 Team Management

Features:
- Create root teams and nested sub-teams
- Invite members via email
- Assign roles (admin/member)
- Add members to multiple teams
- Remove members from teams
- Delete teams (with confirmation)

## 🚢 Deployment

### GitHub Pages

1. Configure your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. Set up secrets:
   - Go to Settings → Secrets and variables → Actions
   - Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Add `NEXT_PUBLIC_API_URL`

3. Push to main branch:
```bash
git push origin main
```

The GitHub Actions workflow will automatically build and deploy.

### Custom Domain

To use a custom domain (e.g., teams.trackmyholidays.com):

1. Add a CNAME file in the `public` directory:
```
teams.trackmyholidays.com
```

2. Configure DNS:
   - Add a CNAME record pointing to `<username>.github.io`

3. Update `next.config.ts`:
```typescript
basePath: '' // Remove basePath for custom domain
```

## 🛠️ Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

## 📁 Project Structure

```
.
├── app/
│   ├── globals.css       # Global styles and CSS variables
│   ├── layout.tsx        # Root layout with auth provider
│   └── page.tsx          # Main application page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── team-management.tsx
│   └── holiday-gantt.tsx
├── lib/
│   ├── types.ts          # TypeScript type definitions
│   ├── auth-context.tsx  # Authentication context
│   ├── api.ts            # API client functions
│   └── utils.ts          # Utility functions
├── public/
│   └── .nojekyll         # For GitHub Pages
└── API_SPEC.md           # Backend API specification
```

## 🤝 Contributing

This is a private project. If you need to add features:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## 📄 License

Private - All rights reserved

## 🆘 Support

For issues or questions, contact the development team.
