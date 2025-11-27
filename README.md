# GIAA Tournament Frontend

React frontend for the Golf Tournament Registration System. Features public registration, admin dashboard, group management, check-in, and multi-tournament support.

## Tech Stack

- **React 18** with TypeScript
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **Clerk** (authentication)
- **React Router** (navigation)
- **React Hot Toast** (notifications)
- **@dnd-kit** (drag-and-drop)
- **xlsx** (Excel export)
- **PWA** (installable app)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Edit .env with your values

# 3. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# PostHog Analytics (optional)
VITE_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## How It Works

### Public Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with tournament info |
| `/register` | Multi-step registration form |
| `/registration/success` | Confirmation page |
| `/payment/success` | Stripe payment success |
| `/payment/cancel` | Stripe payment cancelled |

### Admin Pages (Protected)

| Route | Description |
|-------|-------------|
| `/admin/login` | Clerk sign-in (also via "Staff Portal" in footer) |
| `/admin/dashboard` | Golfer list, stats, quick actions |
| `/admin/groups` | Drag-and-drop group management |
| `/admin/checkin` | Tournament day check-in |
| `/admin/reports` | View and export reports |
| `/admin/tournaments` | Create, edit, archive tournaments |
| `/admin/settings` | Global settings, Stripe config, admins |

### Multi-Tournament System

- **Tournament Selector**: Dropdown in admin header to switch tournaments
- **Historical View**: Switch to archived tournaments to view past data
- **Tournament Management**: Create new tournaments, copy from previous year
- **Scoped Data**: Dashboard, groups, check-in all show data for selected tournament

### Key Features

1. **Registration Flow**
   - Personal info → Payment selection → Waiver → Confirmation
   - Automatic waitlist when at capacity
   - Email confirmation sent on registration

2. **Admin Dashboard**
   - Search and filter golfers
   - Click golfer for detail modal with full history
   - Manage status (registration, payment, check-in)
   - Export to Excel

3. **Group Management**
   - Drag-and-drop golfers between groups
   - Assign starting holes
   - Auto-assign unassigned golfers
   - Bulk add players to groups

4. **Check-In**
   - Three tabs: Paid, Not Paid, Waitlist
   - Quick payment recording
   - Promote waitlist with one click
   - Capacity indicator

5. **Reports**
   - Interactive data tables
   - Registrations, Check-In, Payments, Groups, Contacts
   - Export each report to Excel

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── AdminLayout.tsx  # Admin page wrapper with nav
│   └── ProtectedRoute.tsx
├── contexts/
│   └── TournamentContext.tsx  # Current tournament state
├── pages/
│   ├── LandingPage.tsx
│   ├── RegistrationPage.tsx
│   ├── AdminDashboard.tsx
│   ├── GroupManagementPage.tsx
│   ├── CheckInPage.tsx
│   ├── ReportsPage.tsx
│   ├── TournamentManagementPage.tsx
│   └── AdminSettingsPage.tsx
├── services/
│   └── api.ts           # API client with all endpoints
└── App.tsx              # Routes
```

## Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy to Netlify:
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variables: Add all `VITE_*` vars

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

## Mobile Support

The app is fully responsive and works as a PWA:
- Install on iOS/Android home screen
- Bottom navigation on mobile
- Touch-optimized interfaces
- Offline-capable (static assets)

