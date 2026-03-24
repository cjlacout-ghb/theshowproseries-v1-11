# Changelog

## [1.9.0] - 2026-01-22
### Added
- **Admin Authentication System**: Implemented a secure login system using Supabase Auth.
- **Admin Control Panel**: Added a hidden entry point (`?admin=true`) for administrators.
- **Restricted Access**: Sensitive features like Tournament Reset and Game Management are now gated behind admin privileges.
- **Admin UI Badge**: Visual indicators to show when management mode is active.

## [1.8.0] - 2026-01-21
### Changed
- **Architectural Refactor**: Decoupled complex logic from `TournamentManager`, `BoxScoreDialog`, and `LeaderBoard` into dedicated custom hooks (`useTournamentState`, `useBoxScoreStats`, `useStandings`).
- **State Management**: Standardized real-time synchronization between local UI state and Supabase database.
- **Performance Optimization**: Reduced re-renders by modularizing component architecture.

## [1.7.0] - 2026-01-20
### Fixed
- **UI Consistency**: Standardized button colors and typography across all views.
- **Responsive Layout**: Improved mobile navigation and card layouts for better field visibility.
- **Data Integrity**: Enforced stricter types for batting and pitching statistics.


## [1.5.0] - 2026-03-20
### Added
- **Supabase Integration**: Full database persistence for teams, players, games, and statistics.
- **Tournament Reset**: Critical feature to clear all scores and stats while preserving team rosters.
- **Improved Leaderboard**: Aggregated data processing for better performance on high volume of stats.
- **Optimistic Updates**: Scoring updates now reflect in the UI instantly before DB confirmation.
- **Swap Teams Button**: Quickly toggle Home/Visitor status in the game schedule.

### Changed
- **UI Refresh**: Migrated to a specialized Sports Dark Mode with improved typography and spacing.
- **Inning Logic**: Automated score summing from inning-by-inning inputs.
- **Navigation**: New Tab-based Menu system for better organization on mobile and desktop.

### Fixed
- **Hydration Errors**: Resolved React hydration issues during page reloads.
- **Data Race Conditions**: Fixed potential overwriting of data during rapid score entry.

## [1.0.0] - Initial Release
- Core tournament tracking system with local storage.
- Basic standings calculation.
- Manual team setup.
