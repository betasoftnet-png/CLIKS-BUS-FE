# 📚 Books & Finance - Frontend Documentation

> **Personal Finance Management Web Application**
> A modern, responsive React-based web application for managing personal finances, budgets, investments, and financial planning.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#️-technology-stack)
3. [Project Structure](#-project-structure)
4. [Getting Started](#-getting-started)
5. [Architecture](#-architecture)
6. [Routing](#-routing)
7. [Components](#-components)
8. [Pages](#-pages)
9. [Styling](#-styling)
10. [Design System](#-design-system)
11. [Icons](#-icons)
12. [Animations](#-animations)
13. [Utilities](#️-utilities)
14. [Build & Deployment](#-build--deployment)

---

## 🎯 Project Overview

**Books & Finance** is a comprehensive personal finance management application designed for:
- Tracking accounts, budgets, debts, and investments
- Managing financial contacts and people-related transactions
- Planning financial goals and reminders
- Splitting expenses and tracking stock
- Providing a social/public view for financial updates

### Key Features Overview
- **Dashboard Home**: Overview of accounts, income, expenses, and quick transfers
- **Books Module**: Stock management, financial planning, people tracking
- **Finance Module**: Detailed financial analysis
- **Social Module**: Public financial updates and community features
- **User Profile & Settings**: Account management and app configuration

---

## 📊 Detailed Modules & Features Breakdown

### 1. Finance Module (`/finance`)
The core personal finance tracking and management system.
**Key Features:**
- **Income Tracking (`/finance/income`)**: Log and analyze incoming revenue streams with visual charts.
- **Expense Tracking (`/finance/expenses`)**: Categorize and monitor outgoing payments to control spending.
- **Budgets (`/finance/budgets`)**: Create budgeting goals per category and track adherence to these limits.
- **Accounts (`/finance/accounts`)**: Consolidate views of multiple financial accounts (e.g., bank accounts, cash wallets) and monitor overall liquidity.
- **Transactions (`/finance/transactions`)**: Comprehensive, sortable, and filterable ledger of all financial activities.
- **Planned Payments (`/finance/planned-payments`)**: Schedule and track recurring or future obligations to prevent missed payments.
- **Savings (`/finance/savings`)**: Setup and monitor savings goals and track progression over time.
- **Investments (`/finance/investments`)**: Maintain a portfolio view of different investment assets.
- **Debts (`/finance/debts`)**: Track money owed to others or by others, managing loan lifecycles.

### 2. Books Module (`/books`)
A structured environment for detailed planning, inventory, and shared financial responsibilities.
**Key Features:**
- **Books Dashboard (`/books/dashboard`)**: A dedicated hub providing high-level metrics across all books-related resources.
- **Stock Management (`/books/stock`)**: Inventory control and tracking for businesses or personal assets.
- **Financial Planning (`/books/financial-plan`)**: A comprehensive toolset for drafting financial futures:
  - *Plan Budget, Income, & Expense*: Granular forecasting for different revenue and cost buckets.
  - *Financial Calendar*: Timeline-based view of forecasted transactions.
  - *Goals & Reminders*: Setting milestones and alerts to stay on track.
  - *Plan Analysis*: Analytical breakdown validating the feasibility of the financial plan.
- **People Management (`/books/people`)**: Tracking financial relationships.
  - *Transactions & Records*: Log every exchange associated with a specific person.
  - *Reminders*: Alerts connected to specific individuals (e.g., follow-ups for split bills).
- **Financial Contacts (`/books/contacts`)**: Specialized directory storing payment handlers and bank details of relevant counterparties.
- **Segregation (`/books/segregation`)**: Advanced tagging and separation of funds for specialized accounting logic.
- **Split Expenses (`/books/split-expense`)**: A utility to evenly or proportionally divide group bills, calculating balances and settlements.

### 3. Public/Social Module (`/public`)
Community interactions and public milestones.
**Key Features:**
- **Public Feed**: A social-media-style page for financial updates, sharing progress, and viewing leaderboards or community events.

### 4. Auditor Module (`/auditor`)
Oversight and compliance features.
**Key Features:**
- **Auditor Dashboard**: Dedicated layout and tools (`AuditPanel`, `AuditorSidebar`) for reviewing financial anomalies, auditing transaction logs, and ensuring records' integrity.

### 5. Core Platform Features
Underlying capabilities applied universally across the application.
**Key Features:**
- **Authentication & Profiles (`/auth`, `/books/profile`)**: Secure user onboarding, session persistence, and account settings orchestration.
- **Theme & Settings (`/books/settings`)**: Personalization of the app experience and notification preferences.

---

## ⚙️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI Framework |
| **Vite** | 7.2.4 | Build Tool & Dev Server |
| **React Router DOM** | 7.12.0 | Client-side Routing |
| **TanStack Query** | 5.90.20 | Server State Management |
| **Framer Motion** | 12.29.0 | Animations & Transitions |
| **Lucide React** | 0.562.0 | Icon Library |
| **clsx** | 2.1.1 | Conditional CSS Classes |
| **tailwind-merge** | 3.4.0 | Tailwind Class Merging |
| **ESLint** | 9.39.1 | Code Linting |

### Development Dependencies
- `@vitejs/plugin-react` - React plugin for Vite
- `eslint-plugin-react-hooks` - ESLint rules for React Hooks
- `eslint-plugin-react-refresh` - ESLint rules for React Refresh
- `@types/react` & `@types/react-dom` - TypeScript definitions

---

## 📁 Project Structure

```
📦 Books/
├── 📄 index.html              # App entry point
├── 📄 package.json            # Dependencies & scripts
├── 📄 vite.config.js          # Vite configuration
├── 📄 eslint.config.js        # ESLint configuration
├── 📂 public/                 # Static assets
│   └── vite.svg
├── 📂 dist/                   # Production build output
└── 📂 src/                    # Source code
    ├── 📄 main.jsx            # React entry point
    ├── 📄 App.jsx             # App root component with routing
    ├── 📄 App.css             # Global styles (1220 lines)
    ├── 📄 index.css           # Base styles & landing page (547 lines)
    ├── 📂 api/                # API client configuration
    │   ├── client.js          # Centralized Axios/Fetch wrapper
    │   └── errors.js          # Unified error handling
    ├── 📂 services/           # Business logic & API calls
    │   └── stockService.js    # Stock management API services
    ├── 📂 assets/             # Static assets
    │   └── react.svg
    ├── 📂 components/         # Reusable components
    │   ├── AnalyticsSection.jsx
    │   ├── AuditPanel.jsx
    │   ├── AuditorSidebar.jsx
    │   ├── Breadcrumbs.jsx
    │   ├── ProfileDropdown.jsx
    │   ├── Sidebar.jsx
    │   ├── Topbar.jsx
    │   ├── 📂 common/         # Common UI components
    │   │   ├── EmptyState.jsx
    │   │   ├── ErrorBoundary.jsx
    │   │   ├── ErrorState.jsx
    │   │   └── Tooltip.jsx
    │   ├── 📂 dashboard/      # Dashboard tiles
    │   │   ├── BudgetMixTile.jsx
    │   │   ├── MarketPulseTile.jsx
    │   │   ├── MoneyGoalsTile.jsx
    │   │   ├── SplitBillsTile.jsx
    │   │   └── TheSquadTile.jsx
    │   └── 📂 ui/             # UI primitives
    │       ├── accordion.jsx
    │       ├── spotlight.tsx
    │       └── toggle.jsx
    ├── 📂 layouts/            # Layout components
    │   ├── AuditorLayout.jsx
    │   └── MainLayout.jsx
    ├── 📂 lib/                # Utility functions
    │   ├── config.js          # Environment configuration
    │   ├── queryClient.js     # TanStack Query setup
    │   └── utils.js
    └── 📂 pages/              # Page components
        ├── 📂 books/          # Books pages
        │   └── Dashboard.jsx
        ├── 📂 finance/        # Finance pages
        │   ├── Accounts.jsx
        │   ├── Bills.jsx
        │   ├── Rewards.jsx
        │   ├── Savings.jsx
        │   └── Transfers.jsx
        ├── 📂 financial-plan/ # Financial planning pages
        │   ├── FinancialCalendar.jsx
        │   ├── FinancialPlan.jsx
        │   ├── PlanAnalysis.jsx
        │   ├── PlanBudget.jsx
        │   ├── PlanExpense.jsx
        │   ├── PlanGoals.jsx
        │   ├── PlanIncome.jsx
        │   └── PlanReminders.jsx
        ├── 📂 people/         # People management pages
        │   ├── PeopleOverview.jsx
        │   ├── PeopleRecords.jsx
        │   ├── PeopleReminders.jsx
        │   └── PeopleTransactions.jsx
        ├── Accounts.jsx
        ├── Audit.css
        ├── Audit.jsx
        ├── Auditor.css
        ├── Auditor.jsx
        ├── Books.jsx
        ├── Budgets.jsx
        ├── Debts.jsx
        ├── Expenses.jsx
        ├── FAQ.jsx
        ├── Finance.jsx
        ├── FinancialContacts.jsx
        ├── Income.jsx
        ├── Investments.jsx
        ├── Landing.jsx
        ├── Login.jsx
        ├── PlannedPayments.jsx
        ├── Profile.jsx
        ├── Public.jsx
        ├── Savings.jsx
        ├── Segregation.jsx
        ├── Settings.jsx
        ├── SplitExpense.jsx
        ├── Stock.jsx
        ├── Transactions.jsx
        └── Transactions.css
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
cd a:\Books

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start development server with HMR |
| `build` | `vite build` | Create production build |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint .` | Run ESLint on the codebase |

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1  # URL of the backend API
VITE_ENABLE_DEV_TOOLS=true                      # Enable/disable dev tools
```

---

## 🏗 Architecture

### Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                            │
│  └── main.jsx (React entry)                                  │
│      └── App.jsx (Router + Routes)                           │
│          ├── Landing.jsx (/ - Login/Landing page)            │
│          ├── Profile.jsx (/books/profile - Standalone)       │
│          └── MainLayout.jsx (Topbar + Sidebar + Content)     │
│              ├── Home.jsx (/home)                            │
│              ├── Books.jsx (/books)                          │
│              ├── Finance.jsx (/finance)                      │
│              └── Public.jsx (/public)                        │
└─────────────────────────────────────────────────────────────┘
```

### Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│                         TOPBAR                            │
│  [Logo] [Toggle]     [Home] [Books] [Finance] [Social]   [Profile Dropdown]
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  SIDEBAR   │              MAIN CONTENT AREA              │
│            │                                             │
│  - Stock   │  ┌─────────────────────────────────────┐   │
│  - Plan    │  │         Breadcrumbs                  │   │
│    ▸Budget │  ├─────────────────────────────────────┤   │
│    ▸Income │  │                                     │   │
│    ▸Goals  │  │         Page Content                │   │
│  - People  │  │         (Scrollable)                │   │
│    ▸Overview  │                                     │   │
│  - Contacts    │                                     │   │
│  - Settings    │                                     │   │
│            │  └─────────────────────────────────────┘   │
└────────────┴─────────────────────────────────────────────┘
```

---

## 🗺 Routing

### Route Configuration

The application uses **React Router v7** with the following route structure:

#### Top-Level Routes

| Path | Component | Layout | Description |
|------|-----------|--------|-------------|
| `/` | `Landing` | None | Login/Landing page |
| `/books/profile` | `Profile` | None | User profile (standalone) |
| `/*` | `MainLayout` | Full | All other routes |

#### Home Routes (MainLayout)

| Path | Component | Description |
|------|-----------|-------------|
| `/home` | `Home` | Dashboard overview |
| `/home/income` | `Income` | Income tracking |
| `/home/expenses` | `Expenses` | Expense tracking |
| `/home/budgets` | `Budgets` | Budget management |
| `/home/accounts` | `Accounts` | Account management |
| `/home/transactions` | `Transactions` | Transaction history |
| `/home/planned-payments` | `PlannedPayments` | Scheduled payments |
| `/home/savings` | `Savings` | Savings tracking |
| `/home/investments` | `Investments` | Investment portfolio |
| `/home/debts` | `Debts` | Debt management |

#### Books Routes (MainLayout)

| Path | Component | Description |
|------|-----------|-------------|
| `/books` | `Books` | Books overview |
| `/books/stock` | `Stock` | Stock/inventory management |
| `/books/financial-plan` | `FinancialPlan` | Financial planning overview |
| `/books/plan/budget` | `PlanBudget` | Budget planning |
| `/books/plan/income` | `PlanIncome` | Income planning |
| `/books/plan/expense` | `PlanExpense` | Expense planning |
| `/books/plan/calendar` | `FinancialCalendar` | Financial calendar |
| `/books/plan/goals` | `PlanGoals` | Goal tracking |
| `/books/plan/reminders` | `PlanReminders` | Payment reminders |
| `/books/plan/analysis` | `PlanAnalysis` | Financial analysis |
| `/books/people/overview` | `PeopleOverview` | People overview |
| `/books/people/transactions` | `PeopleTransactions` | People transactions |
| `/books/people/reminders` | `PeopleReminders` | People reminders |
| `/books/people/records` | `PeopleRecords` | People records |
| `/books/contacts` | `FinancialContacts` | Financial contacts |
| `/books/segregation` | `Segregation` | Category segregation |
| `/books/split-expense` | `SplitExpense` | Expense splitting |
| `/books/settings` | `Settings` | App settings |
| `/books/faq` | `FAQ` | FAQ page |

#### Other Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/finance` | `Finance` | Finance module |
| `/public` | `Public` | Social/Public feed |

---

## 🧩 Components

### Core Components

#### 1. **MainLayout** (`src/layouts/MainLayout.jsx`)
The primary layout wrapper that provides consistent structure.

```jsx
// Props
MainLayout({ children }) // Wraps page content

// Features
- Manages sidebar open/collapsed state
- Renders Topbar, Sidebar, Breadcrumbs
- Provides scrollable content area
```

#### 2. **Topbar** (`src/components/Topbar.jsx`)
The top navigation bar with branding and primary navigation.

```jsx
// Props
Topbar({ onToggleSidebar })

// Features
- Logo with sidebar toggle
- Primary navigation: Home, Books, Finance, Social
- QR code button
- Profile dropdown with account actions
- Hamburger menu for mobile
- Glass-morphic design with blur effect
```

**Navigation Items:**
| Name | Path | Icon |
|------|------|------|
| Home | `/home` | `Home` |
| Books | `/books` | `BookOpen` |
| Finance | `/finance` | `Calculator` |
| Social | `/public` | `Users` |

#### 3. **Sidebar** (`src/components/Sidebar.jsx`)
The contextual sidebar navigation with tree-view structure.

```jsx
// Props
Sidebar({ isOpen })

// Features
- Tree-view navigation with dropdowns
- Collapsible sections
- Active state highlighting (#195BAC)
- Branch connectors for child items
- Responsive: slides off on mobile
```

**Sidebar Sections:**
- **Stock** - Direct link
- **Financial Plan** (Dropdown)
  - Budget, Income, Expense, Calendar, Goals, Reminders, Analysis
- **People** (Dropdown)
  - Overview, Transactions, Reminders, Records
- **Financial Contacts** - Direct link
- **Segregation** - Direct link
- **Split Expense** - Direct link
- **Settings** - Footer item
- **FAQ** - Footer item

#### 4. **Breadcrumbs** (`src/components/Breadcrumbs.jsx`)
Dynamic breadcrumb navigation based on current path.

```jsx
// Props
Breadcrumbs({ items, dividerType = 'slash' })

// Features
- Auto-generates from URL path
- Label mapping for route segments
- Path redirects for intermediate routes
- Clickable navigation links
```

#### 5. **ProfileDropdown** (`src/components/ProfileDropdown.jsx`)
Animated dropdown for user profile actions.

```jsx
// Props
ProfileDropdown({ onAccount, onSettings, onFAQ, onLogout })

// Features
- Displays current user (BTC007)
- Account, Settings, FAQ actions
- Animated with Framer Motion
- Auto-closes on mouse leave
```

### UI Primitives (`src/components/ui/`)

#### **Accordion** (`accordion.jsx`)
Collapsible content sections with animation.

```jsx
// Components
<AccordionRoot>       // Container
<AccordionItem>       // Individual item with state
<AccordionTrigger>    // Clickable header
<AccordionContent>    // Animated content

// Features
- Smooth height animation
- Chevron rotation indicator
- Framer Motion integration
```

#### **Toggle** (`toggle.jsx`)
Animated switch/toggle component.

```jsx
// Props
Toggle({ checked, onChange, size = 'md', label, disabled = false })

// Sizes
- sm: 36x20px, handle 16px
- md: 44x24px, handle 20px (default)
- lg: 52x28px, handle 24px

// Features
- Spring animation on toggle
- Primary color (#195BAC) when active
- Accessible with aria-label
```

#### **Spotlight** (`spotlight.tsx`)
Decorative background spotlight effect for landing page.

```jsx
// Props
Spotlight({ className, fill = '#3b82f6' })

// Features
- SVG-based gradient spotlight
- Animated pulsing effect
- Customizable fill color
```

---

## 📄 Pages

### Landing Page (`Landing.jsx`)
The entry point with login functionality.

**Features:**
- Split layout: Hero + Auth form
- Animated background blobs
- Spotlight effect
- Email login form
- Guest access option
- Feature highlights

### Home Page (`Home.jsx`)
Dashboard with financial overview.

**Sub-components:**
- `AccountCard` - Displays account with balance
- `DonutChart` - Circular progress chart
- `DashboardTile` - Tile container with header/footer
- `ActivityItem` - Transaction list item

**Sections:**
- Accounts grid
- Month selector
- Gauges (Goals, Savings, Debts)
- Recent Activity
- Quick Transfer

### Books Page (`Books.jsx`)
Overview of all Books module features.

**Sub-component:**
- `OverviewCard` - Clickable card with stats

**Cards displayed:**
- Stock, Financial Plan, People
- Financial Contacts, Segregation, Split Expenses

### Other Notable Pages

| Page | Description |
|------|-------------|
| `Income.jsx` | Income tracking with charts |
| `Expenses.jsx` | Expense categorization |
| `Accounts.jsx` | Account management |
| `Budgets.jsx` | Budget creation and tracking |
| `Investments.jsx` | Investment portfolio |
| `Debts.jsx` | Debt tracking |
| `Savings.jsx` | Savings goals |
| `Stock.jsx` | Inventory/stock management |
| `Profile.jsx` | User profile with settings |
| `Settings.jsx` | App configuration |
| `FAQ.jsx` | Frequently asked questions |
| `Public.jsx` | Social feed (84KB - largest page) |

---

## 🎨 Styling

### CSS Architecture

The application uses **vanilla CSS** with CSS custom properties (variables) for theming.

#### Global Stylesheets

| File | Lines | Purpose |
|------|-------|---------|
| `index.css` | 547 | Base styles, landing page |
| `App.css` | 1220 | App layout, components |
| `Transactions.css` | ~450 | Transactions page specific |

### CSS Custom Properties (`index.css`)

```css
:root {
  /* Primary Colors */
  --primary: #195BAC;
  --primary-hover: #144a8f;
  --secondary: #2563EB;
  
  /* Background */
  --bg-color: #E9F4FF;
  
  /* Text Colors */
  --text-main: #1E293B;
  --text-muted: #64748B;
  
  /* Surface Colors */
  --card-bg: #FFFFFF;
  --border-color: #DAE4F0;
  
  /* Card Accents */
  --card-blue: #0EA5E9;
  --card-dark-blue: #1E3A8A;
  
  /* Gauge Colors */
  --gauge-red: #EF4444;
  --gauge-yellow: #EAB308;
  --gauge-green: #22C55E;
  
  /* Typography */
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}
```

### Key CSS Classes

#### Layout Classes
```css
.app-root          /* Root container */
.app-body          /* Sidebar + content wrapper */
.main-content-area /* Main content container */
.content-scrollable /* Scrollable content area */
.content-wrapper   /* Content width limiter (max 1600px) */
```

#### Component Classes
```css
.topbar           /* Top navigation bar */
.sidebar          /* Left sidebar */
.sidebar-item     /* Sidebar navigation item */
.sidebar-item.active /* Active nav item (#195BAC bg) */
.sidebar-subgroup /* Tree-view children container */
```

#### UI Classes
```css
.card              /* Basic card styling */
.dashboard-tile    /* Glass-morphic tile */
.tile-header       /* Tile header section */
.tile-content      /* Tile body section */
.btn-primary       /* Primary button */
.icon-btn          /* Icon-only button */
```

#### Utility Classes
```css
.flex, .items-center, .justify-between
.gap-2, .gap-3, .gap-4
.w-full
.font-bold, .font-medium
.text-sm, .text-xs, .text-muted
.grid, .grid-cols-2, .grid-cols-3
.p-4, .gap-6
```

---

## 🎭 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary Blue** | `#195BAC` | Actions, active states, buttons |
| **Primary Hover** | `#144a8f` | Button hover states |
| **Secondary Blue** | `#2563EB` | Accents |
| **Background** | `#E9F4FF` | App background |
| **Card Background** | `#FFFFFF` | Cards and surfaces |
| **Text Main** | `#1E293B` | Primary text |
| **Text Muted** | `#64748B` | Secondary text |
| **Border** | `#DAE4F0` | Borders and dividers |

### Status Colors

| Status | Hex | Usage |
|--------|-----|-------|
| **Success/Green** | `#22C55E` | Positive values, income |
| **Warning/Yellow** | `#EAB308` | Warnings |
| **Danger/Red** | `#EF4444` | Errors, negative values |
| **Info/Teal** | `#0EA5E9` | Info, highlights |

### Accent Colors (Cards)

| Usage | Hex |
|-------|-----|
| Stock | `#0EA5E9` |
| Financial Plan | `#8B5CF6` |
| People | `#F59E0B` |
| Contacts | `#10B981` |
| Segregation | `#EC4899` |
| Split Expense | `#6366F1` |

### Typography

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;

/* Font Weights */
Regular: 400
Medium: 500
Semi-bold: 600
Bold: 700
Extra-bold: 800 (Landing titles)

/* Font Sizes */
xs: 0.75rem (12px)
sm: 0.875rem (14px)
base: 1rem (16px)
lg: 1.1rem (17.6px)
xl: 1.25rem (20px)
2xl: 1.5rem (24px)
```

### Spacing

Based on rem units:
- `0.25rem` (4px)
- `0.5rem` (8px)
- `0.75rem` (12px)
- `1rem` (16px)
- `1.25rem` (20px)
- `1.5rem` (24px)
- `2rem` (32px)

### Border Radius

| Name | Value | Usage |
|------|-------|-------|
| Small | `4px` | Icon buttons |
| Medium | `8px` | Buttons, inputs |
| Large | `12px` | Cards, tiles |
| XL | `16px` | Dashboard tiles |
| Full | `999px` | Pills, toggles |

### Shadows

```css
/* Light shadow */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

/* Card shadow */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

/* Elevated shadow */
box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);

/* Tile hover shadow */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);

/* Button shadow */
box-shadow: 0 2px 4px rgba(25, 91, 172, 0.2);

/* Landing button shadow */
box-shadow: 0 16px 35px rgba(37, 99, 235, 0.4);
```

---

## 🎭 Icons

The application uses **Lucide React** for all icons.

### Commonly Used Icons

| Icon | Usage |
|------|-------|
| `Home` | Home navigation |
| `BookOpen` | Books navigation |
| `Calculator` | Finance navigation |
| `Users` | Social navigation |
| `Wallet` | Logo, accounts |
| `TrendingUp` | Stock, growth |
| `TrendingDown` | Expenses, decline |
| `ChevronLeft/Right` | Navigation arrows |
| `ChevronDown` | Dropdown indicators |
| `Plus` | Add actions |
| `User` | Profile, people |
| `Settings` | Settings |
| `QrCode` | QR scanning |
| `Calendar` | Calendar features |
| `Target` | Goals |
| `PiggyBank` | Savings |
| `CreditCard` | Cards, accounts |
| `Banknote` | Money, transactions |

### Icon Usage Example

```jsx
import { Home, Settings, ChevronRight } from 'lucide-react';

// Inline usage
<Home size={20} />

// With color
<Settings size={18} color="#195BAC" />

// In button
<button>
  <ChevronRight size={16} />
</button>
```

---

## ✨ Animations

### Framer Motion Animations

#### Profile Dropdown

```jsx
initial={{ opacity: 0, scale: 0.95, y: -5 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: -5 }}
transition={{ duration: 0.1, ease: "easeOut" }}
```

#### Accordion Content

```jsx
initial={{ height: 0, opacity: 0 }}
animate={{ height: 'auto', opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ duration: 0.2, ease: 'easeInOut' }}
```

#### Toggle Switch

```jsx
animate={{ x: checked ? endPosition : startPosition }}
transition={{ type: "spring", stiffness: 500, damping: 30 }}
```

### CSS Animations

#### Landing Page Fade Up

```css
@keyframes landing-fade-up {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.99);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

#### Spotlight Pulse

```css
@keyframes spotlight-pulse {
  0% { opacity: 0.6; transform: translate3d(-20px, 10px, 0) scale(1); }
  50% { opacity: 0.9; transform: translate3d(10px, -10px, 0) scale(1.04); }
  100% { opacity: 0.7; transform: translate3d(0, 0, 0) scale(1.02); }
}
```

#### Background Blob Animation

```css
@keyframes landing-blob {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  30% { transform: translate3d(24px, -40px, 0) scale(1.05); }
  60% { transform: translate3d(-30px, 30px, 0) scale(0.96); }
  100% { transform: translate3d(10px, -8px, 0) scale(1.02); }
}
```

#### Spinner

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

---

## 🛠️ Utilities

### `src/lib/utils.js`

```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

**Usage:**
```jsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" && "primary-variant"
)}>
```

### `src/lib/config.js`

Centralized configuration management using `import.meta.env`.

```javascript
import { config } from '@/lib/config';

const apiUrl = config.api.baseUrl; // Access validated env var
```

### `src/lib/queryClient.js`

Exports the configured `QueryClient` instance and the `queryKeys` factory for consistent cache key management.
```

### Path Alias

Configured in `vite.config.js`:

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
}
```

**Usage:**
```jsx
import { Spotlight } from '@/components/ui/spotlight';
import { cn } from '@/lib/utils';
```

---

## ⚙️ Environment Configuration

The application uses environment variables for configuration across different deployments.

### Environment Files

| File | Purpose |
|------|---------|
| `.env.example` | Template file with documented variables. Should be copied to create local configurations. |
| `.env.development` | Configuration for local development (`npm run dev`). |
| `.env.production` | Configuration for production builds (`npm run build`). |

### Key Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL for backend API requests. |
| `VITE_ENABLE_DEV_TOOLS` | Boolean feature flag to enable/disable development tools. |

*Note: Never commit `.env.local` or environment files containing real secrets to version control.*

---

## 📦 Build & Deployment

### Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
```

### Production Build

```bash
# Create optimized build
npm run build

# Output in /dist folder
# - index.html
# - assets/
#   - *.js (bundled JavaScript)
#   - *.css (bundled CSS)
```

### Preview Production Build

```bash
npm run preview
# Opens preview server at http://localhost:4173
```

---

## 📱 Responsive Design

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | < 768px | Single column, hamburger menu |
| Tablet | 768px - 1024px | 2-column grid |
| Desktop | > 1024px | Full layout, 3-column grid |
| Large Desktop | > 1400px | Extended content width |

### Key Responsive Behaviors

1. **Sidebar**: Slides off-screen on mobile, toggle via hamburger
2. **Navigation**: Converts to full-screen mobile menu
3. **Dashboard Grid**: 1 → 2 → 3 columns based on width
4. **Content Width**: Max 1600px with auto margins

```css
/* Grid breakpoints example */
.dashboard-grid {
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 🔄 State Management

The application uses a hybrid approach for state management:

### 1. Server State (TanStack Query)
Managed via `@tanstack/react-query` (v5). This handles data fetching, caching, synchronization, and server state updates.

- **Configuration**: `src/lib/queryClient.js`
- **Features**:
  - Automatic background refetching (stale-while-revalidate)
  - Exponential backoff for retries
  - Centralized query key factory for type safety
  - Optimistic updates for mutations

**Example Usage:**
```jsx
// Fetching data
const { data, isLoading } = useQuery({
  queryKey: queryKeys.stock.list(filters),
  queryFn: () => fetchStockItems(filters)
});

// Mutating data
const mutation = useMutation({
  mutationFn: updateStockItem,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
  }
});
```

### 2. Client State
- **Local State**: `useState` / `useReducer` for component-level UI state (modals, form inputs).
- **URL State**: `react-router-dom` for shareable state (filters, pagination, tabs).
- **Context API**: Used for global app configuration (e.g., AuthContext, ThemeContext).

### Future Considerations
- **Zustand**: If complex client-side global state (non-server) is needed in the future.

---

## 📝 Coding Conventions

### File Naming
- Components: `PascalCase.jsx`
- CSS: `kebab-case.css` or matches component name
- Utilities: `camelCase.js`

### Component Structure
```jsx
// 1. Imports
import React from 'react';
import { Icon } from 'lucide-react';

// 2. Sub-components (if any)
const SubComponent = () => { ... };

// 3. Main component
const MainComponent = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState();
  
  // Handlers
  const handleAction = () => { ... };
  
  // Render
  return (
    <div>...</div>
  );
};

// 4. Export
export default MainComponent;
```

### Style Patterns
- CSS classes for reusable styles
- Inline styles for dynamic/one-off styles
- CSS custom properties for theming

---

## 🤝 Contributing

1. Follow existing code style and conventions
2. Use meaningful component and variable names
3. Add comments for complex logic
4. Test responsive behavior before committing
5. Keep CSS organized and avoid duplication

---

## 📞 Support

For questions or issues with the frontend codebase, refer to:
- This documentation
- Component comments and JSDoc
- Existing component patterns

---

*Documentation generated: March 7, 2026*
*Version: 0.0.0 (as per package.json)*
