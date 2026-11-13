# Xibra Dashboard

Private multi-user dashboard for the **Xibra Platform** ecosystem.

`xibra-dashboard` is the central web interface where authenticated users access and manage their personal workspace, platform features, and connected services through the Xibra API.

## Overview

Xibra Dashboard is designed as a universal dashboard for multiple users. Each user accesses the same application while receiving an isolated workspace and data based on their authenticated identity and permissions.

The dashboard communicates exclusively with `xibra-api`. It does not connect directly to the database or independently manage business data.

## Core Principles

- **Multi-user architecture** — one dashboard application serves multiple users.
- **Private by default** — authenticated access is required for private features.
- **Data isolation** — users can only access resources they are authorized to access.
- **Centralized backend** — all business logic and data operations are handled by `xibra-api`.
- **API-driven** — the dashboard consumes versioned REST API endpoints.
- **Permission-aware** — access to features is controlled by server-side authorization.
- **Consistent experience** — a unified interface across the Xibra Platform ecosystem.

## Technology Stack

| Component | Technology |
|---|---|
| Framework | Nuxt |
| UI Framework | Vue 3 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Laravel REST API |
| Authentication | Xibra API authentication |
| Database | PostgreSQL (accessed exclusively through `xibra-api`) |

> Exact package versions and additional dependencies are defined in `package.json`.

## Architecture

```text
                  Xibra Platform
                         |
              +----------+----------+
              |                     |
       Xibra Dashboard        Xibra Portfolio
              |
         HTTPS / REST
              |
          Xibra API
              |
         PostgreSQL
```

The dashboard is responsible for presentation, user interaction, and client-side state.

The API is responsible for authentication, authorization, validation, business logic, ownership enforcement, and database operations.

## Planned Modules

The following modules represent the intended dashboard scope. Their implementation status is tracked in the project TODO.

- **Overview** — workspace summary and activity.
- **Profile** — personal account information.
- **Workspace** — user-specific workspace and preferences.
- **Productivity** — tasks, schedules, reminders, and routines.
- **Integrations** — connected services and external applications.
- **AI Assistant** — access to Xibra AI capabilities.
- **Account & Security** — account settings and security controls.

Additional modules may be introduced as the platform evolves.

## Authentication & Authorization

- No public registration.
- User accounts are provisioned through the platform's invitation and onboarding process.
- Authentication is handled by `xibra-api`.
- Protected routes require a valid authenticated session.
- Feature access follows server-side permissions.
- Resource ownership is enforced by the API.
- Client-supplied user identifiers must never be treated as proof of ownership.
- Owner privileges do not automatically grant unrestricted access to private user data.

## Development Setup

### Requirements

- Node.js (LTS recommended)
- npm
- Access to the `xibra-api` development environment

### Installation

```powershell
npm install
```

### Environment Configuration

Create a local `.env` file based on the environment example:

```powershell
Copy-Item .env.example .env
```

Configure the API base URL:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
```

Use the actual environment variable names defined by the application configuration. Never commit secrets or environment-specific credentials.

### Development Server

```powershell
npm run dev
```

The development server is available at:

```text
http://localhost:3000
```

### Production Build

```powershell
npm run build
```

### Production Preview

```powershell
npm run preview
```

## Project Structure

The following is the intended organizational structure. Actual directories may evolve during implementation.

```text
xibra-dashboard/
├── app/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── layouts/
│   ├── middleware/
│   ├── pages/
│   └── types/
├── public/
├── server/
├── .env.example
├── .gitignore
├── nuxt.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Security Guidelines

- Never store secrets in client-side code.
- Never connect directly to PostgreSQL from the dashboard.
- Never bypass API authorization or ownership checks.
- Avoid exposing sensitive information in logs, URLs, or browser storage.
- Validate API responses before using them in the interface.
- Handle expired sessions and unauthorized responses safely.
- Do not trust user identifiers or permissions supplied by the client.
- Require explicit approval for sensitive operations where applicable.

## Related Repositories

| Repository | Responsibility |
|---|---|
| `xibra-api` | Central backend, authentication, authorization, and data management |
| `xibra-portfolio` | Public portfolio website |
| `xibra-dashboard` | Private multi-user dashboard |
| `xibra-bot` | Telegram interface |
| `hermes-config` | Xibra AI runtime configuration |

## Development Status

Xibra Dashboard is part of the ongoing Xibra Platform development.

Features, implementation progress, and upcoming work are tracked in the platform's central `TODO.md`.

---

**Xibra Platform**  
*A unified digital ecosystem.*