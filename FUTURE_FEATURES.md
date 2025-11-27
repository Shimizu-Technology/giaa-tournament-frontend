# Future Features & Ideas

A simple list of features to consider for future versions of the Golf Tournament Registration System.

---

## ✅ Recently Completed

### Activity Logging / Audit Trail ✅
- ✅ Track which admin checked in each player
- ✅ Track which admin recorded payments
- ✅ Track which admin assigned players to groups
- ✅ Display audit trail in player details modal
- ✅ Reports page to view all activity logs

### Email Notifications ✅
- ✅ Confirmation email when player registers
- ✅ Email when promoted from waitlist to confirmed
- ✅ Admin notification on new registration
- ✅ Payment confirmation emails

### Reports Page ✅
- ✅ View all reports without downloading
- ✅ Tabs: Registrations, Check-In, Payments, Groups, Contacts
- ✅ Mobile-optimized card layouts
- ✅ Export to Excel

### Hidden Admin Login ✅
- ✅ Moved admin login to subtle "Staff Portal" button in footer
- ✅ Less prominent for security

---

## High Priority (Next Up)

### Multi-Tournament System ⭐⭐⭐
Transform the app from a single-tournament tool into a reusable platform for annual/recurring events.

#### Data Model
```
Tournament (new model)
├── id
├── name: "2025 Edward A.P. Muna II Memorial"
├── date: "2025-06-07"
├── status: "draft" | "open" | "closed" | "archived"
├── registration_opens_at
├── registration_closes_at
├── capacity (moved from Settings)
├── entry_fee
├── created_at
│
├── Golfers (belong_to :tournament)
├── Groups (belong_to :tournament)
└── TournamentAdmins (join table for access control)
```

#### Backend Changes
- Create `Tournament` model and migration
- Add `tournament_id` to `golfers` and `groups` tables
- Scope all queries to current tournament
- Update API endpoints: `/api/v1/tournaments/:tournament_id/golfers`
- Migrate existing data to a default tournament

#### Frontend Changes
- **Tournament Selector** - Dropdown in header to switch between tournaments
- **Tournament Management Page** - Create, edit, archive tournaments
- **Tournament Dashboard** - Overview of all tournaments with quick stats
- **Copy Tournament** - Clone settings from previous year
- **Archive Flow** - Close registration, mark as archived, hide from active list

#### UI Flow
1. Admin logs in → sees list of tournaments (or last active one)
2. Selects tournament → all pages scoped to that tournament
3. Can switch tournaments anytime via header dropdown
4. "Create New Tournament" button to set up next year's event
5. "Archive Tournament" to close out completed events

#### Nice-to-Have Extensions
- **Returning Players** - Auto-suggest players who registered last year
- **Year-over-Year Comparison** - Compare registration numbers, revenue
- **Tournament Templates** - Save settings as template for quick setup

#### Estimated Effort
- Backend: 2-3 days
- Frontend: 2-3 days  
- Testing & Migration: 1 day
- **Total: ~1 week**

---

## Medium Priority

### Bulk Actions
- Select multiple players and assign to a group
- Bulk check-in for pre-registered groups
- Bulk payment recording

### Player Edit
- Allow admins to edit player information from the dashboard
- Update email, phone, company, etc.

### Tournament Day Features
- Live score tracking
- Hole-by-hole results entry
- Leaderboard display

### Enhanced Reporting
- Revenue report (paid vs expected, totals)
- Check-in progress over time (chart/graph)
- Historical comparison with previous tournaments

---

## Low Priority / Future Versions

### Online Payment (Stripe Integration)
- Complete Stripe checkout flow
- Automatic payment confirmation
- Refund processing

### Player Portal
- Players can view their registration status
- Update their own information
- See group assignment before tournament day

### Sponsor Management
- Track hole sponsors
- Sponsor logos on materials
- Sponsor acknowledgment system

---

## Technical Improvements

### Performance
- Add pagination to dashboard (currently loads all at once)
- Implement caching for frequently accessed data
- Optimize API queries

### Real-time Updates
- Enable ActionCable for live updates
- Show check-in progress in real-time across devices

### Testing
- Add comprehensive test suite
- E2E tests for critical flows

---

## Notes

- ✅ Core functionality complete (registration, check-in, groups, payments)
- ✅ Activity logging and reports implemented
- Get feedback from actual tournament day usage
- Prioritize based on pain points discovered during events
- **After first tournament:** Gather feedback, then build multi-tournament support before next year
- **Priority for next development cycle:** Multi-Tournament System
