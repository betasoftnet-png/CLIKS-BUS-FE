# Project Documentation

---

## 1. Project Purpose
The application is a web-based client dashboard designed for business record management, customer support ticket logging, and administrative oversight. 

Based on the implemented routes, components, and pages:
*   **Business Dashboard Operations:** Users can compile invoices, log products and inventory quantities across godowns, record expense entries, and calculate GST metrics (CGST, SGST, ITC allocations).
*   **CA Tabbed Panel:** Provides interactive tools for switching between IFRS and US GAAP guidelines, running client-side checks over expense transactions, managing a tabular corporate resolutions list, and recording contact annotations.
*   **Customer Support Desk:** Provides a double-column layout where standard portal users file support tickets, view active support ticket status updates, read FAQs, and obtain direct support contact details.
*   **Administrative Dashboard:** Enables administrators to moderate feed items, inspect audit history logs, manage portal users, and track sales agents.
*   **Agent Portals:** Provides sales agents with a prospects tracker and support agents with a dashboard.

---

## 2. Tech Stack

The system utilizes the following verified framework and packages:

### Frontend Stack
*   **React (`^19.2.0`):** Core UI library using state hooks, standard effects, and contextual layouts.
*   **React DOM (`^19.2.0`):** Renders React trees into viewport DOM nodes in `src/main.jsx`.
*   **Vite (`^7.2.4`):** Local hot-reload development server and production static asset builder.
*   **React Router DOM (`^7.12.0`):** Handles client routing and path transitions in `src/App.jsx`.
*   **TanStack Query (`^5.90.20`):** Caches server data in memory, managing refresh states.
*   **Framer Motion (`^12.29.0`):** Animates side panels and modal pop-ups.
*   **Tailwind Merge (`^3.4.0`):** Combines utility styling classes in `src/lib/utils.js`.
*   **XLSX (`^0.18.5`):** Processes spreadsheet exports.
*   **React Barcode & QRCode.react:** Generate barcodes and QR matrices.

### Backend Stack
*   **Express (`^4.18.2`):** Web server framework driving endpoint routing logic.
*   **JSON Web Token (`^9.0.2`):** Issues, signs, and decodes authentication payloads.
*   **BcryptJS (`^2.4.3`):** Hashes refresh tokens before database storage.
*   **Zod (`^4.3.6`) & Express Validator (`^7.0.1`):** Enforces input schema validations.
*   **Sentry Node (`^10.48.0`):** Handles errors, logs, and trace telemetry reporting.
*   **Redis (`^5.11.0`):** Provides rapid memory key-value caching (optional configuration).
*   **Pino (`^10.3.1`):** Structured standard JSON logger.

---

## 3. Folder Structure

### Folder Responsibilities
*   **`src/api/`**: Coordinates low-level API queries, fetch configuration clients, and error normalizations.
*   **`src/components/`**: Modular presentation primitives, calculators, sidebars, and overlays.
*   **`src/context/`**: Declares React Context contexts managing session token lifecycles.
*   **`src/layouts/`**: Dynamic wrappers providing structure and viewport boundaries.
*   **`src/lib/`**: Handles environment validation, query client parameters, and formats.
*   **`src/pages/`**: Page views loaded directly by App router paths.
*   **`src/routes/`**: Secures paths via role and validation gates.
*   **`src/styles/`**: Custom HSL CSS sheets and static styling rules.
*   **`src/utils/`**: Shared algorithms and confirmation handlers.

### Scalable Feature-Based Module Architecture Roadmap
As the application expands, a flat structure (separating all services, pages, and components) can lead to fragmentation. To maintain scalability, the codebase is recommended to transition to a **Feature-Based Architecture**:

```text
src/
├── features/
│   ├── accounting/         # Consolidated general ledgers, journals, P&L
│   ├── gst/                # Tax engine calculations and GSTR filings
│   ├── support/            # Ticketing logs, FAQ accordions, help cards
│   └── admin/              # Impersonation handlers, moderations, audit logs
│       ├── components/     # Feature-scoped presentational widgets
│       ├── hooks/          # Custom feature Hooks (e.g. useComplianceScanner.js)
│       ├── pages/          # Feature viewports mounted by the router
│       ├── services/       # Feature API service definitions
│       └── types/          # Feature typescript type interfaces
```

---

## 4. Architecture Principles & State Ownership

To maintain a clean separation of concerns and prevent technical debt, developers must adhere to the following architecture principles:

### Core Architecture Rules
1.  **Isolate API Requests:** All network calls must reside within dedicated service files under `src/services/` (e.g. `caService.js`). Pages and components must never trigger `fetch` directly.
2.  **Server State Caching:** All asynchronous data fetched from the backend must be managed by **TanStack Query**. Do not duplicate server data in local `useState` variables.
3.  **Strict Context Constraints:** The Context API (`AuthContext.jsx`) is reserved solely for system configuration flags, tokens, and active user session states.
4.  **No Direct Cache Mutation:** Components must never mutate the TanStack Query cache directly. All updates must use invalidations (`queryClient.invalidateQueries`) or mutation hooks.
5.  **Pure CSS & Utility Toggles:** Avoid heavy inline style repetitions. Implement reusable style rules inside `src/styles/` using HSL variables, and use `cn` to merge dynamic styling classes.
6.  **Chunk Optimization:** Lazy load heavy dashboard panels using `React.lazy` to keep the initial bundle size small.

### State Ownership Matrix

| State Type | Technology | Scope | Lifetime | Example |
| :--- | :--- | :--- | :--- | :--- |
| **Server Cache** | TanStack Query | Global | Managed by Stale Time | `liveExpenses` (Query Key: `['caExpenses']`) |
| **Session Context** | Context API | Global | Browser Tab Session | `user`, `token` (Auth Context) |
| **Local Transient** | `useState` | Component | Component Mount Cycle | `activeTab`, `isScanning` (BusinessCA.jsx) |
| **Offline Logs** | LocalStorage | Browser | Persistent | `cliks_cs_resolutions`, `books_auth_token` |
| **Ephemeral Session**| SessionStorage | Browser Tab | Window Lifecycle | `active_cliks_module` (Sidebar navigation state) |

---

## 5. Application Flow & Lifecycle

The lifecycle of the application spans three phases: startup, request transit, and local synchronization.

### 1. App Startup & Routing Guard
1.  `main.jsx` mounts `App.jsx` under standard strict frameworks.
2.  `AuthContext.jsx` scans `localStorage` for `books_auth_token`.
3.  If a token exists, the application displays a loader and fetches the user's profile to initialize the session. If the token is missing, the loading state is set to `false`.
4.  `ProtectedRoute.jsx` intercepts route changes:
    *   If `isAuthenticated === false`, it redirects the user to the landing page (`/`).
    *   If a route requires a specific role (e.g., `role="admin"`) and the user lacks it, the route guard redirects them to `/dashboard`.

### 2. Request Transit & Cache Lifecycle
```text
User action (e.g., Click "Run Compliance Scanner" in BusinessCA.jsx)
  │
  ▼
Mutation triggers (e.g., scanMutation.mutate())
  │
  ▼
Service invokes apiClient endpoint (e.g., caService.runComplianceScan())
  │
  ▼
apiClient validates the token, configures AbortController (30s), and initiates fetch
  ├── Dev Mock Check: If books_auth_token === 'mock-test-token' AND import.meta.env.DEV is true:
  │     └── Interceptor returns static mock mock objects directly (network requests are bypassed)
  └── Live Server:
        └── Appends Authorization: Bearer <books_auth_token> header and transits request to backend
              │
              ▼
Backend processes request and returns success payload or normalized ApiError
              │
              ▼
apiClient resolves fetch promise, updates query cache, and triggers onSuccess hooks
              │
              ▼
onSuccess invalidates queries, TanStack Query refetches data, and React rerenders pages
```

---

## 6. Routing & Navigation Structure

Routes are declared in `src/App.jsx` using `BrowserRouter` and nested `<Routes>`.

### Route Mapping Grid

| Client Route | Component Mounted | Route Guard Wrapper | Allowed Roles | Layout Wrapper |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `Landing` | None | Public | None |
| `/auth` | `Auth` | None | Public | None |
| `/verify-pass`| `VerifyPass` | None | Public | None |
| `/dashboard` | `BusinessDashboard` | `ProtectedRoute` | `'business'` | `MainLayout` |
| `/ca` | `BusinessCA` | `ProtectedRoute` | `'business'` | `MainLayout` |
| `/customization` | `BusinessCustomization` | `ProtectedRoute` | `'business'` | `MainLayout` |
| `/faq` | `FAQ` | `ProtectedRoute` | `'business'` | `MainLayout` |
| `/admin/*` | `AdminDashboard` | `ProtectedRoute` | `'admin'` | `MainLayout` |
| `/sales-portal/*` | `SalesDashboard` | `ProtectedRoute` | `'sales_agent'` | `MainLayout` |
| `/support-portal/*` | `SupportDashboard` | `ProtectedRoute` | `'support_agent'` | `MainLayout` |

*Note: The active navigation sidebar highlights links dynamically by reading the browser tab's `location.pathname` and tracks module groups using `sessionStorage.getItem('active_cliks_module')`.*

---

## 7. Authentication Flow & Security Warnings

Authentication is managed globally in `src/context/AuthContext.jsx`.

### Verified Authentication Methods
*   `ssoLogin(bnxToken)`: Submits tokens to `/auth/sso-login` and writes access tokens to `books_auth_token` and `bnx_auth_token`.
*   `adminLogin(email, password)`: Sends credentials to `/admin/login` and initializes the admin session.
*   `supportAgentLogin(email, password)`: Sends credentials to `/support/login` and initializes the support agent session.
*   `impersonateLogin(userId)`: Triggers administrative user impersonation, immediately **clearing the query cache** (`queryClient.clear()`) to prevent support personnel from viewing stale admin data before loading the impersonated session.
*   `logout()`: Deletes all local session storage keys and flushes the query client cache.

### 🛡️ Critical Security Warnings & Mitigation Roadmap

#### 1. LocalStorage Token Vulnerability (Critical)
*   **Current Practice:** The frontend stores JWT access tokens directly in `localStorage` under `books_auth_token`.
*   **Vulnerability:** This approach is vulnerable to Cross-Site Scripting (XSS) attacks. If a malicious script runs, it can easily read and steal the token.
*   **Production Hardening Plan:**
    1.  **Access Token:** Store the JWT Access Token in memory only (e.g. inside the React context state variable).
    2.  **Refresh Token:** Configure the backend to return the Refresh Token inside an **HttpOnly, Secure, SameSite=Strict cookie**. The browser will automatically attach this cookie to `/auth/refresh` requests, keeping it inaccessible to malicious JavaScript.

#### 2. Local Mock Bypass Guard (Critical)
*   **Practice:** The codebase implements a mock token bypass (`'mock-test-token'`) to aid local development inside `src/api/client.js`.
*   **Vulnerability:** If left unguarded, this bypass could be exploited in production.
*   **Production Hardening Rule:** Developers must restrict this bypass to local development environments using environment guards:
```diff
-if (token === 'mock-test-token') {
+if (import.meta.env.DEV && token === 'mock-test-token') {
     // Only allow local mock testing during development
 }
```

---

## 8. Backend Architecture & API Standards

The backend service is located in the `CLIKS-BE` workspace. It processes client requests, manages user authentication, and provides data.

### 1. Database Architecture
The backend uses a hybrid database configuration to support SQLite in development and PostgreSQL in production:
*   **Development Database:** Local SQLite database file located at `./db/books_finance.db`, powered by `better-sqlite3`.
*   **Production Database:** PostgreSQL pool configuration driven by the `pg` module's `Pool` object.
*   **SQL Query Translation Layer (`db/connection.js`):** Intercepts SQL queries at runtime, automatically translating SQLite-specific syntax (such as `strftime('%Y-%m')` and `?` parameters) into valid PostgreSQL equivalents (such as `TO_CHAR(date, 'YYYY-MM')` and `$1` parameter markers).

### 2. JWT Lifespan & Token Rotation Flow
Authentication uses a double-token approach:
*   **Access Token (JWT):** Signed using the `JWT_SECRET` key, carrying user session variables (user ID, username, email, role) with an expiration lifespan set to **`24h`**.
*   **Refresh Token:** An opaque token consisting of a Base64-encoded user ID prefix joined with secure random bytes (e.g. `b64UserId.randomString`). Validated using bcrypt (`bcrypt.compareSync`), checked against expiration limits set to **`7 days`**, and saved in the database `refresh_tokens` table.
*   **Rotation Flow (`TokenService.rotateRefreshToken`):** When the client calls the refresh endpoint, the backend decodes the token's Base64 user ID, retrieves all active tokens for that user ID from the database, and validates the match using `bcrypt`. Once validated, the database **deletes the old refresh token record** (strict single-use rotation rule to prevent replay attacks) and issues a new pair of access and refresh tokens.

### 3. Backend RBAC Middleware Enforcement (Critical Protection)
While the frontend uses client-side routing guards (`ProtectedRoute.jsx`), **all backend endpoints must enforce role-based access control (RBAC) validations**. The backend implements role restriction middleware to secure administrative and service endpoints:

```javascript
// Verification middleware found in CLIKS-BE/middleware/auth.js
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden: Lacks permission', 403, 'FORBIDDEN');
    }
    next();
  };
}

// Example usage in CLIKS-BE/routes/admin.js:
router.get('/audit-logs', auth, allowRoles('admin'), adminController.getAuditLogs);
```

### 4. Rate Limiting & Brute-Force Protection
To protect API endpoints from brute-force attempts and denial-of-service (DoS) attacks, the backend registers a rate-limiting layer:
*   **Throttling Middleware:** Implemented using `express-rate-limit` to restrict the number of requests per window.
*   **Redis Caching Integration:** The rate limiter can be integrated with Redis (`redis` library) to share rate-limit states across multiple server instances in production environments.

### 5. API Response Standards

#### Success Response Structure
```json
{
  "success": true,
  "message": "Fetched successfully",
  "data": {
    "id": 12,
    "invoice_number": "INV-89100",
    "total": 12500
  }
}
```

#### Error Response Structure
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The invoice price must exceed zero."
  }
}
```

---

## 9. Code Verification & Key Files

This section maps verified import/export structures, operational responsibilities, and consumers for every critical file in the codebase.

### `src/main.jsx`
*   **Why it exists:** Gateway bootloader file that binds the React single-page framework to the physical DOM viewport container.
*   **Dependencies/Imports:**
    *   `react`
    *   `react-dom/client` (`createRoot`)
    *   `./App.jsx`
    *   `./index.css`
*   **Provided Exports:** None.
*   **Direct Consumers:** Browser client (loaded directly by `index.html`).

### `src/App.jsx`
*   **Why it exists:** Declares global router structures, maps root elements, wraps page components in static `Suspense` containers, and handles layout rendering rules.
*   **Dependencies/Imports:**
    *   `react` (`lazy`, `Suspense`)
    *   `react-router-dom` (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
    *   `@tanstack/react-query` (`QueryClientProvider`)
    *   `./lib/queryClient` (`queryClient`)
    *   `./context` (`AuthProvider`)
    *   `./routes/ProtectedRoute`
    *   `./layouts/MainLayout`
    *   `./pages/Landing`, `./pages/Auth` (and all lazy-loaded dashboard components)
*   **Provided Exports:** `App` (default).
*   **Direct Consumers:** `src/main.jsx`.

### `src/routes/ProtectedRoute.jsx`
*   **Why it exists:** Secures internal dashboard pages by validating the user's login status and role before mounting route viewports.
*   **Dependencies/Imports:**
    *   `react`
    *   `react-router-dom` (`Navigate`, `useLocation`)
    *   `../context` (`useAuth`)
*   **Provided Exports:** `ProtectedRoute` (named/default).
*   **Direct Consumers:** `src/App.jsx`.

### `src/context/AuthContext.jsx`
*   **Why it exists:** Exposes unified context controls for managing session tokens, administrative user impersonation parameters, and loading sequences.
*   **Dependencies/Imports:**
    *   `react` (`useState`, `useEffect`, `useCallback`)
    *   `@tanstack/react-query` (`useQueryClient`)
    *   `../services/authService`
    *   `../services/adminService`
    *   `../services/supportService`
    *   `./auth-context` (`AuthContext`)
*   **Provided Exports:** `AuthProvider` (named), `useAuth` hook (consumed by downstream components to read current user profiles).
*   **Direct Consumers:** `src/App.jsx`, `src/routes/ProtectedRoute.jsx`, `src/components/Sidebar.jsx`, `src/components/Topbar.jsx`.

### `src/api/client.js`
*   **Why it exists:** Low-level network fetch manager. Handles authorization headers, request timing parameters, and test mocks.
*   **Dependencies/Imports:**
    *   `../lib/config` (`config`)
    *   `./errors` (`normalizeError`)
*   **Provided Exports:** `apiClient` (handles standard operations: `get`, `post`, `put`, `patch`, `delete`).
*   **Direct Consumers:** All service files under `src/services/` (e.g. `caService.js`, `billingService.js`).

### `src/api/errors.js`
*   **Why it exists:** Normalizes API runtime failures, parsing status codes and converting network exceptions into structured exception models.
*   **Dependencies/Imports:** None.
*   **Provided Exports:** `ApiError` class, `normalizeError` function.
*   **Direct Consumers:** `src/api/client.js`.

### `src/lib/config.js`
*   **Why it exists:** Parses, validates, and acts as a central access point for system configuration variables loaded from the `.env` file.
*   **Dependencies/Imports:** None.
*   **Provided Exports:** `config` (object containing normalized properties for api base urls and debug toggles).
*   **Direct Consumers:** `src/api/client.js`.

### `src/lib/queryClient.js`
*   **Why it exists:** Instantiates the global TanStack `QueryClient` cache configuration used by components to manage server data lifecycle.
*   **Dependencies/Imports:**
    *   `@tanstack/react-query` (`QueryClient`)
*   **Provided Exports:** `queryClient` (instance).
*   **Direct Consumers:** `src/App.jsx`, `src/context/AuthContext.jsx`.

### `src/layouts/MainLayout.jsx`
*   **Why it exists:** Orchestrates global layout presentations, binding scroll containers, sidebars, headers, and floating side panels.
*   **Dependencies/Imports:**
    *   `react` (`useState`, `useEffect`)
    *   `@tanstack/react-query` (`useQuery`)
    *   `../components/Sidebar`, `../components/Topbar`
    *   `../components/AuditPanel`, `../components/ReferralModal`
    *   `../components/BroadcastBanner`
    *   `../services` (`settingsService`)
*   **Provided Exports:** `MainLayout` (default).
*   **Direct Consumers:** `src/App.jsx`.

### `src/pages/BusinessCA.jsx`
*   **Why it exists:** Tabbed page container providing tools for auditor workflows, tax engine estimations, resolution logs, and advisor notes.
*   **Dependencies/Imports:**
    *   `react` (`useState`, `useEffect`)
    *   `@tanstack/react-query` (`useQuery`, `useMutation`, `useQueryClient`)
    *   `../services` (`accountingService`, `gstService`, `contactsService`, `caService`)
    *   `lucide-react`
*   **Provided Exports:** `BusinessCA` (default).
*   **Direct Consumers:** `src/App.jsx`.

### `src/pages/FAQ.jsx`
*   **Why it exists:** Help center portal enabling FAQ browsing and support ticket filing.
*   **Dependencies/Imports:**
    *   `react` (`useState`, `useEffect`)
    *   `../components/ui/accordion`
    *   `../services/supportService`
    *   `lucide-react`
*   **Provided Exports:** `FAQ` (default).
*   **Direct Consumers:** `src/App.jsx`.

### `src/pages/BusinessCustomization.jsx`
*   **Why it exists:** Multi-tab layout configuration panel that lets users customize godown variables, invoice sequences, print dimensions, and UI themes.
*   **Dependencies/Imports:**
    *   `react` (`useState`, `useEffect`)
    *   `@tanstack/react-query` (`useQuery`, `useMutation`, `useQueryClient`)
    *   `../services` (`settingsService`)
*   **Provided Exports:** `BusinessCustomization` (default).
*   **Direct Consumers:** `src/App.jsx`.

---

## 10. Styling System

Vanila CSS files are organized in `src/styles/` and dynamic HSL color variables are defined in `src/index.css`.

### Technical Risks: Window Size Listeners
Components currently check screen size by listening directly to window resize events:
```javascript
// Found in MainLayout.jsx: Direct listener check
const [isSidebarOpen, setIsSidebarOpen] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
);
```

> [!WARNING]
> **Directly checking `window.innerWidth` in React components can lead to several issues:**
> 1.  **Hydration Mismatches:** Differences in screen size calculations between server and client environments can cause rendering glitches.
> 2.  **Memory Leaks:** Forgetting to clean up window resize listeners can cause memory leaks.
> 3.  **Performance Degradation:** Frequent updates to screen size states during active window resizes can degrade app performance.

#### Recommended Mitigation
Instead of direct event listeners, use standard media queries inside stylesheet classes. If Javascript-driven logic is necessary, use `window.matchMedia()`:
```javascript
// MatchMedia listener pattern
useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const listener = (e) => setIsSidebarOpen(e.matches);
    
    setIsSidebarOpen(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
}, []);
```

---

## 11. Testing Documentation

Unit and integration tests are located in the `src/test/` and `src/App.test.jsx` files.

### 1. Running Tests
Run client-side test suites using Jest or Vitest:
```bash
npm run test
```

### 2. Testing Framework & Mocks
*   **API Mocking:** Network requests are mocked using `jest.fn()` to isolate components during testing:
    ```javascript
    // Example mocking caService:
    jest.mock('./services/caService', () => ({
        runComplianceScan: jest.fn().mockResolvedValue({ success: true, riskCount: 0 })
    }));
    ```
*   **Query Client Mocks:** Wrap test components in a fresh `QueryClientProvider` to ensure a clean cache state for each test run:
    ```javascript
    const testQueryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    });
    ```
*   **Integration Tests:** Verify integration flows (such as SSO redirects and login forms) by validating DOM changes after mock inputs are submitted.

---

## 12. Type Safety & Migration Plan

The codebase currently uses standard JavaScript JSX. As the application grows, migrating to TypeScript will help prevent common bugs and make the code easier to maintain.

### Recommended TypeScript Migration Strategy
1.  **Add TypeScript Compiler:** Install the compiler and Vite plugins as dev dependencies:
    ```bash
    npm install -D typescript @types/react @types/react-dom @vitejs/plugin-react-ts
    ```
2.  **Add `tsconfig.json` Configuration:** Set strict checking rules, JSX configurations, and path aliases.
3.  **Phase 1 Migration (Types & Data Models):** Create a `src/types/` folder to declare data models (such as `Invoice` and `User` types):
    ```typescript
    export interface Invoice {
        id: string;
        invoice_number: string;
        total: number;
        status: 'Paid' | 'Unpaid' | 'Cancelled';
        created_at: string;
    }
    ```
4.  **Phase 2 Migration (API Client & Services):** Convert `src/api/client.js` and services to TS files, defining exact return models instead of generic promises.
5.  **Phase 3 Migration (UI Components):** Convert shared UI components and page files. Use TypeScript interfaces to enforce strict prop-types checks.

---

## 13. Complete Environment Variables List

Create a `.env` file in the root directory, listing the following environment variables:

```env
# ── API Connection ────────────────────────────────────────────────────────────
# Base URL for the backend API
VITE_API_BASE_URL=http://localhost:8000/api/v1

# ── Dynamic Observability ──────────────────────────────────────────────────────
# Sentry DSN key for tracking client errors
VITE_SENTRY_DSN=https://abc12345@o9999.ingest.sentry.io/45000

# Active application environment (development, staging, or production)
VITE_APP_ENV=development

# ── Live Realtime Channels ────────────────────────────────────────────────────
# WebSockets URL for real-time announcements and alerts
VITE_SOCKET_URL=ws://localhost:8000/ws

# ── Development Tools ─────────────────────────────────────────────────────────
# Enable or disable the in-app devtools panel
VITE_ENABLE_DEV_TOOLS=true
```

---

## 14. Deployment Guide

Follow these instructions to compile and deploy the frontend application:

### 1. Nginx Reverse Proxy Configuration
When deploying the compiled static build, configure Nginx to route API requests to the backend while serving `index.html` for all client-side routes:
```nginx
server {
    listen 80;
    server_name portal.example.com;

    # Static assets folder
    root /var/www/cliks-fe/dist;
    index index.html;

    # Fallback to index.html for React router paths
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy API requests to the backend server
    location /api/v1/ {
        proxy_pass http://127.0.0.1:3000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Multi-Stage Dockerfile Deployment & CI/CD Pipeline
Containerize the application using a multi-stage Docker build to build and serve static assets:
```dockerfile
# Stage 1: Build the static assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve compiled assets using Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### GitHub Actions CI/CD Pipeline Example
Create a `.github/workflows/deploy.yml` pipeline to automate linting, testing, and deployment:
```yaml
name: Deploy Frontend
on:
  push:
    branches: [ main ]
jobs:
  verify-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - name: Build Docker Image
        run: docker build -t books-finance-frontend .
```

---

## 15. Debugging Guide

Traces errors and locates bugs across components:

### 1. Inspecting API Failures
*   Open `src/api/client.js` and trace the native request handler. You can catch request anomalies by logging details inside the `try/catch` block:
```javascript
// Add a log inside the request handler in src/api/client.js to inspect payloads:
console.log(`[ApiClient Request] Method: ${method} URL: ${endpoint} Payload:`, body);
```
*   To trace errors normalized by the API layer, add a log inside the `normalizeError` function in `src/api/errors.js`:
```javascript
// Add a log inside errors.js to catch normalized exceptions:
console.warn(`[ApiError Normalized] Status: ${status} Code: ${code} Message: ${message}`);
```

### 2. Tracing State Updates
*   To trace state updates in `BusinessCA.jsx` (such as accounting standard toggles or compliance scanner runs), add logs inside state setters and handlers:
```javascript
// In src/pages/BusinessCA.jsx inside handleStandardChange:
console.log(`[CA AuditorHub] Switched accounting standard to: ${standard}`);
```

### 3. Debugging Authentication Transitions
*   Add logs inside the authentication context handlers in `src/context/AuthContext.jsx` to trace login issues:
```javascript
// In src/context/AuthContext.jsx inside ssoLogin:
console.log(`[Auth SSO] Triggered SSO login with token: ${bnxToken.substring(0, 8)}...`);
```

---

## 16. Change Impact Warnings

Be aware of how modifications to core files affect other areas of the application:

### 1. apiClient changes (`src/api/client.js`)
*   **Impact:** Modifying this file affects all services in the application (such as `caService.js` and `gstService.js`).
*   **Risk:** Changing headers, payload structures, or the token injection logic can cause all API requests to fail.

### 2. AuthContext updates (`src/context/AuthContext.jsx`)
*   **Impact:** Affects all protected routes and components that consume session context (like `Sidebar.jsx` and `ProtectedRoute.jsx`).
*   **Risk:** Mistakes in session initialization, state updates, or the `logout` callback can lock users out of their dashboards or lead to infinite loops.

### 3. Query Key modifications
*   **Impact:** Affects cache updates and cache invalidation.
*   **Risk:** Mismatches between query keys (such as `['caExpenses']` in `BusinessCA.jsx`) and cache invalidation keys will prevent components from updates with fresh data.

---

## 17. "How to Add New Feature" Guides

Follow these step-by-step guides to expand the codebase:

### 1. How to Add a New Page
1.  Create your page file in `src/pages/` (e.g. `src/pages/BusinessTaxRegister.jsx`).
2.  Define and export your component:
    ```javascript
    import React from 'react';
    export default function BusinessTaxRegister() {
        return <div style={{ padding: '2rem' }}>Tax Register Dashboard</div>;
    }
    ```
3.  Register the page in `src/App.jsx` by adding a dynamic lazy import:
    ```javascript
    const BusinessTaxRegister = React.lazy(() => import('./pages/BusinessTaxRegister'));
    ```
4.  Map the page to a route inside the wildcard `<Route>` wrapper:
    ```javascript
    <Route path="/finance/tax-register" element={<BusinessTaxRegister />} />
    ```
5.  Add the new navigation link to the sidebar array in `src/components/Sidebar.jsx`.

### 2. How to Add a New API Service
1.  Create a service file in `src/services/` (e.g. `src/services/taxRegisterService.js`).
2.  Export service methods using the core network client:
    ```javascript
    import { apiClient } from '../api/client';
    export const taxRegisterService = {
        getTaxRecords: () => apiClient.get('/tax-register/records').then(res => res.data.data || res.data)
    };
    export default taxRegisterService;
    ```
3.  Export the service from the barrel import file `src/services/index.js`:
    ```javascript
    export * from './taxRegisterService';
    ```

### 3. How to Add a New Query (TanStack Query)
1.  Import your service inside the component:
    ```javascript
    import { taxRegisterService } from '../services';
    ```
2.  Invoke the query hook inside the component, defining a unique query key:
    ```javascript
    const { data: records = [], isLoading } = useQuery({
        queryKey: ['taxRegisterRecords'],
        queryFn: taxRegisterService.getTaxRecords,
        retry: false
    });
    ```

---

## 18. Common Mistakes to Avoid

Avoid these patterns when writing code:

1.  **Directly mutating cached query state:**
    *   *Mistake:* Directly updating cached data arrays instead of invalidating the query cache.
    *   *Correction:* Always use query invalidation triggers (`queryClient.invalidateQueries({ queryKey })`) or custom mutation triggers.
2.  **Bypassing routing guards:**
    *   *Mistake:* Declaring routes outside the `<ProtectedRoute>` wrapper inside `App.jsx`.
    *   *Correction:* Always declare authenticated pages as nested children inside the protected wildcard route container.
3.  **Storing sensitive keys in Local Storage:**
    *   *Mistake:* Storing sensitive user data or API secrets in `localStorage`.
    *   *Correction:* Only store session tokens (`books_auth_token`) and temporary user configurations in local storage.
4.  **Duplicating API fetch logic inside components:**
    *   *Mistake:* Writing fetch calls directly inside page components.
    *   *Correction:* Always isolate network operations in dedicated service files (such as `caService.js`) and call them using the unified `apiClient` instance.

---

## 19. Learning Order

Suggesting reading order for new developers:

1.  **`src/App.jsx`**: Understand how paths, protected routes, and layouts are configured.
2.  **`src/routes/ProtectedRoute.jsx`**: Check how role permissions and session tokens are validated.
3.  **`src/context/AuthContext.jsx`**: Trace how active user states are loaded, updated, and cleared.
4.  **`src/api/client.js`**: Inspect how requests, headers, and the `'mock-test-token'` bypass are implemented.
5.  **`src/pages/BusinessCA.jsx`**: Study how queries, state updates, and tab views are wired together.

---

## 20. Advanced Production Roadmap

To transition the platform into a production-ready, enterprise-grade accounting and finance SaaS application, developers must implement the following enhancements:

### 1. Centralized Permission Matrix
Instead of hardcoding role checks, declare a central permission mapping matrix inside `src/constants/permissions.js` to manage feature access by role:
```javascript
export const permissions = {
  business: ['view_dashboards', 'manage_invoices', 'access_ca_workspace'],
  support_agent: ['view_dashboards', 'manage_tickets', 'resolve_tickets'],
  sales_agent: ['view_dashboards', 'manage_leads'],
  admin: ['view_dashboards', 'manage_users', 'view_audit_logs', 'impersonate_users']
};
```

### 2. Centralized Query Key Factory
To prevent invalidation mismatches and ensure clean key management, replace hardcoded strings with a structured Query Key Factory:
```javascript
export const queryKeys = {
  ca: {
    all: ['ca'],
    expenses: () => [...queryKeys.ca.all, 'expenses'],
    contacts: () => [...queryKeys.ca.all, 'contacts'],
    gst: () => [...queryKeys.ca.all, 'gst3b']
  },
  settings: () => ['settings']
};
```

### 3. Suspense & Skeleton Loading Architectures
Replace basic loading spinners with styled skeleton layouts and wrap components in `<Suspense>` containers to improve perceived performance:
```javascript
// Suspense boundary layout wrapping MainLayout inside App.jsx
<Suspense fallback={<SidebarSkeleton />}>
  <MainLayout>
    <Suspense fallback={<TableSkeleton rows={5} />}>
       <Routes>...</Routes>
    </Suspense>
  </MainLayout>
</Suspense>
```

### 4. Custom Feature Hooks Extraction
Keep page components clean by extracting layout logic and data mutations into custom React hooks (e.g. creating `src/features/accounting/hooks/useComplianceScanner.js`):
```javascript
export function useComplianceScanner() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: caService.runComplianceScan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ca.expenses() });
    }
  });
  return mutation;
}
```

### 5. Optimistic Mutations Updates
Provide immediate UI feedback for common user actions (such as changing support ticket statuses or saving resolution notes) by implementing optimistic updates in TanStack Query:
```javascript
const mutation = useMutation({
  mutationFn: supportService.updateTicketStatus,
  onMutate: async (newStatus) => {
    await queryClient.cancelQueries({ queryKey: ['tickets'] });
    const previousTickets = queryClient.getQueryData(['tickets']);
    // Optimistically update the UI status
    queryClient.setQueryData(['tickets'], (old) => 
       old.map(t => t.id === targetId ? { ...t, status: newStatus } : t)
    );
    return { previousTickets };
  },
  onError: (err, newStatus, context) => {
    // Rollback to previous state on failure
    queryClient.setQueryData(['tickets'], context.previousTickets);
  }
});
```

### 6. WebSocket Integration Architecture
Manage real-time features (such as live support notifications, admin alerts, and sales lead updates) through a centralized WebSocket manager:
```javascript
// Unified client manager inside src/realtime/socketClient.js
import { io } from 'socket-io-client';
import { config } from '../lib/config';

let socket = null;
export const getSocket = () => {
  if (!socket && config.features.socketsEnabled) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
       auth: { token: localStorage.getItem('books_auth_token') }
    });
  }
  return socket;
};
```
