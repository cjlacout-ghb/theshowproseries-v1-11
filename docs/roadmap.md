# Product Roadmap

## Recent Accomplishments (v1.9.0)
### Admin Authentication System
- **Secure Access Control**: Implemented `useAdminAuth` hook and `AdminAuthPanel` component for multi-layered security.
- **Hidden Management Portal**: Administrators can access the login interface via the `?admin=true` URL parameter.
- **Role-Based Restrictions (RBAC)**: Sensitive operations like Tournament Reset, Game Management, and Roster Editing are now strictly gated behind admin verification.
- **Supabase Integration**: Fully integrated with Supabase Auth for session persistence and secure credentials.

### Architectural Refinement
- **Logic Decoupling**: Extracted business logic from view components into specialized hooks (`useTournamentState`, `useBoxScoreStats`, `useStandings`).
- **Component Modularization**: Refactored large monolith components into a clean, hierarchical structure for improved maintainability.

### Premium UI/UX Implementation
- **Visual Feedback**: Integrated real-time indicators for "Admin Mode" and refined micro-interactions.
- **Responsive Management**: Standardized administrative controls across both mobile and desktop views.

## Q1 2026: Refinement & Data Logic
- **Advanced Standings**: Strength of Schedule (SoS) and automated Tie-breaker rules.
- **Enhanced Box Scores**: Add fielding stats (errors, putouts, assists).
- **Data Export**: PDF/CSV exports for tournament summaries and official results.
- **Spray Charts**: Preliminary visual representation of hits.

## Q2 2026: Performance & Depth
- **Pitch Tracking**: Velocity and pitch type tracking in the Box Score.
- **Historical Analysis**: Season-over-season player comparison tools.
- **Bracket Visualization**: Dynamic visual representation of tournament progression.

