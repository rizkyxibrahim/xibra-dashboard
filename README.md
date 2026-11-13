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

## UI Shell

The visual shell is adapted from the Tailwick Nuxt template (Themesdesign), reduced to the parts the dashboard actually uses. The template is not open source; review the purchased template license before publishing or redistributing this repository.

Deliberate changes from the template:

- Demo pages, mock data, charts, calendar, mail, chat, e-commerce, HR, and invoice modules are not included.
- Preline, Pinia, `pinia-plugin-persistedstate`, ApexCharts, Chart.js, FullCalendar, Swiper, Flatpickr, Dropzone, and Simplebar are not installed.
- Icons are a small inline SVG set in `app/utils/icons.ts`; no runtime icon lookups over the network.
- Fonts use the system font stack; there is no Google Fonts request.
- The theme is stored in the readable `xibra_theme` cookie so the `data-theme` attribute can be rendered on the server without a flash. It contains no secrets.
- Authentication state stays in the sealed httpOnly `xibra_session` cookie. Nothing auth-related is written to `localStorage`, Pinia, or a JavaScript-readable cookie.

## Request Flow (BFF)

```text
Browser  --same-origin /api/**-->  Nuxt server  --Bearer token-->  Xibra API
```

- The browser never receives the API token.
- `server/api/auth/*` reads and writes the sealed session cookie.
- Non-GET BFF requests require an `Origin` header that matches `Host`.
- Only the API is authoritative for authentication, authorization, and ownership.

## Public Auth & Onboarding Pages

The invitation-only onboarding flow and the account recovery flows are served by the dashboard, so every link the API sends points here.

| Route | Purpose | Token source |
|---|---|---|
| `/invite/[token]` | Validates an invitation link or code and opens an onboarding session. | Path segment from the invitation link. |
| `/onboarding` | Collects name, username, optional email and phone, and the password; then creates the account and signs in. | Onboarding cookie. |
| `/forgot-password` | Requests a password reset link. | None. |
| `/reset-password?token=…` | Consumes the reset token and sets a new password. | Query string from the email link. |
| `/verify-email?token=…` | Consumes an email verification token. | Query string from the email link. |

The onboarding session token returned by `POST /invitations/redeem` never reaches the browser. It lives in a second sealed httpOnly cookie (`xibra_onboarding`, 15 minutes) that only `server/api/onboarding/complete.post.ts` reads. The cookie is cleared on success and whenever the API reports the session as invalid, expired, or consumed, so the page settles on its expired state instead of looping.

API configuration that must point at these routes:

```env
XIBRA_INVITATION_LINK_BASE_URL=http://localhost:3000
XIBRA_PASSWORD_RESET_URL=http://localhost:3000/reset-password
XIBRA_EMAIL_VERIFICATION_URL=http://localhost:3000/verify-email
```

The invitation URL is `{XIBRA_INVITATION_LINK_BASE_URL}/invite/{token}`; the reset and verification URLs receive `?token=` appended by the API.

Password recovery only works for accounts with a verified email address. Unverified accounts can request a new verification link from the overview page.

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
NUXT_XIBRA_API_BASE_URL=http://127.0.0.1:8000
```

`NUXT_XIBRA_API_BASE_URL` is server-only. The BFF appends `/api/v1`, so the value must not include it. Do not rename it to a `NUXT_PUBLIC_*` variable: public runtime config is serialized into the HTML payload, and the browser never needs to know or reach the API directly.

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
│   ├── assets/css/          # Tailwind entry, design tokens, component classes
│   ├── components/          # App* UI primitives
│   ├── composables/         # useAuth, useShell, useNavigation
│   ├── layouts/             # default (private shell), auth (public card)
│   ├── middleware/          # auth, guest
│   ├── pages/               # index, login, invite/[token], onboarding,
│   │                        # forgot-password, reset-password, verify-email
│   ├── utils/               # api error helpers, formatting, icon set
│   ├── app.vue
│   └── error.vue
├── public/
├── server/
│   ├── api/auth/            # login, me, logout, forgot/reset password,
│   │                        # email verify + resend BFF routes
│   ├── api/invitations/     # invitation redemption BFF route
│   ├── api/onboarding/      # onboarding session + completion BFF routes
│   └── utils/               # xibra-api client, session, onboarding session, BFF helpers
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