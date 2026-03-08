# Architecture Overview
Date: 2026-03-08

## Tech Stack
- **Frontend App**: React Native with Expo. React Navigation v6, React Query, Context API, Tailwind/StyleSheet mixed components.
- **Frontend Web**: Vercel deployed SPA based on the exact same Expo base config built contextually for the web.
- **Backend API**: Node.js, Express, TypeScript, PM2.
- **Database**: Supabase (PostgreSQL).

## Project Structure
- `gomhangpro-app/`: Mobile application source code.
- `backend/`: Node.js API interacting directly with Supabase via `@supabase/supabase-js`.

## Key Roles & Patterns
- **User Roles**: Two core navigators `ManagerNavigator` (Admin) and `WorkerNavigator` (Staff). Access logic dynamically routes users on auth validation.
- **Shift Management**: Strict cash drawer implementation. All transactions are logged towards a shift. Employees must start a shift to write transactions.
- **Offline / Caching**: Handled via React Query for improved App tab transition performance.
