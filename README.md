# 📚 Books & Finance Dashboard

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB.svg)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF.svg)
![TanStack Query](https://img.shields.io/badge/Query-v5-FF4154.svg)

**Books & Finance** is a comprehensive personal finance and dashboard application designed to give you complete control over your financial life. It combines powerful tracking tools for budgets, stocks, and expenses with a modern, responsive interface.

---

## 🚀 Project Overview

This Single Page Application (SPA) helps users manage:
- **Personal Finances**: Track accounts, income, expenses, and transfer funds.
- **Budgeting**: Create and monitor budgets with visual breakdowns.
- **Stock Inventory**: Manage assets and inventory items (e.g., stationary, electronics).
- **People Ledger**: Track debts, split bills, and financial interactions with contacts.
- **Social**: Share updates and engage with a community feed.

The application features a **Bento-grid style dashboard**, smooth animations, and a focus on data visualization.

## ✨ Key Features

### 📊 Finance Dashboard
- **Real-time Overview**: Instant view of total balance, income, and expenses.
- **Visual Analytics**: Interactive donut charts for spending breakdown.
- **Budget Tracking**: Progress bars for category-specific budgets.
- **Quick Actions**: Fast transfer and transaction logging.

### 📦 Books & Inventory
- **Stock Management**: Track item quantities, values, and status (In Stock, Low Stock).
- **Filtering**: Search and filter by category or status.
- **Detailed Views**: Drill down into specific item details.
- **Financial Planning**: Tools for long-term goals and calendar-based planning.

### 👥 People & Contacts
- **Ledger System**: Record transactions with specific individuals.
- **Split Expenses**: Tools to divide costs among groups.
- **Contact Management**: Maintain a list of financial contacts.

## 🛠 Technology Stack

- **Frontend Core**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **State Management**: [TanStack Query (React Query v5)](https://tanstack.com/query) for server state; Context API for app state.
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: Vanilla CSS with [Tailwind Merge](https://github.com/dcastil/tailwind-merge) and [CLSX](https://github.com/lukeed/clsx) for utility management.
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📂 Project Documentation

For detailed technical documentation, please refer to:

- [Frontend Documentation](./FRONTEND_DOCUMENTATION.md): In-depth guide to architecture, components, and routing.
- [API Reference](./API_REFERENCE.md): Details on API endpoints and data contracts.

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd Books
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory (copy `.env.example` if available):
    ```env
    VITE_API_BASE_URL=http://localhost:8000/api/v1
    VITE_ENABLE_DEV_TOOLS=true
    ```

4.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

### Production Build

To create an optimized production build:
```bash
npm run build
```
Preview the build locally:
```bash
npm run preview
```

## 🗺 Roadmap

- [x] **Frontend Architecture**: Setup React, Vite, and Router.
- [x] **Core UI Components**: Bento grid, Sidebar, Topbar.
- [x] **Stock Module**: Basic inventory listing and details (Mock/API ready).
- [ ] **Backend Integration**: Fully implement API endpoints for Accounts and People.
- [ ] **Authentication**: Implement JWT-based auth flow.
- [ ] **Advanced Analytics**: Add historical trend charts.

## 🤝 Contributing

1.  Create a feature branch (`git checkout -b feature/NewFeature`).
2.  Commit your changes.
3.  Push to the branch.
4.  Open a Pull Request.

---
*Maintained by the Antigravity Team*
