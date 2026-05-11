import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ErrorBoundary } from './components/common';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';

// Lazy Load Pages to optimize bundle size
const Auth = React.lazy(() => import('./pages/Auth'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const FAQ = React.lazy(() => import('./pages/FAQ'));

import BusinessDashboard from './pages/BusinessDashboard';
import BusinessPlaceholder from './pages/BusinessPlaceholder';
import BusinessInventory from './pages/BusinessInventory';
import BusinessBilling from './pages/BusinessBilling';
import BusinessSalesOrders from './pages/BusinessSalesOrders';
import BusinessPurchases from './pages/BusinessPurchases';
import BusinessCRM from './pages/BusinessCRM';
import BusinessStaffing from './pages/BusinessStaffing';
import BusinessFinancialPlan from './pages/BusinessFinancialPlan';
import BusinessSegregation from './pages/BusinessSegregation';
import BusinessCompare from './pages/BusinessCompare';
import BusinessAccounting from './pages/BusinessAccounting';
import BusinessMarketing from './pages/BusinessMarketing';
import BusinessReports from './pages/BusinessReports';
import BusinessSuppliers from './pages/BusinessSuppliers';
import BusinessReturns from './pages/BusinessReturns';
import BusinessStock from './pages/BusinessStock';
import BusinessWarehouse from './pages/BusinessWarehouse';
import BusinessPayments from './pages/BusinessPayments';
import BusinessBankAccounts from './pages/BusinessBankAccounts';
import BusinessExpenses from './pages/BusinessExpenses';
import BusinessGST from './pages/BusinessGST';
import BusinessAttendance from './pages/BusinessAttendance';
import BusinessPayroll from './pages/BusinessPayroll';
import BusinessDelivery from './pages/BusinessDelivery';
import BusinessManufacturing from './pages/BusinessManufacturing';
import BusinessSubscription from './pages/BusinessSubscription';
import BusinessBarcode from './pages/BusinessBarcode';

import './App.css';

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px', color: '#64748B' }}>
    Loading...
  </div>
);

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={
          <Suspense fallback={<PageLoader />}>
            <Auth />
          </Suspense>
        } />
        
        {/* Protected Routes - All routes within MainLayout require authentication */}
        <Route path="*" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MainLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Root Redirect */}
                    <Route path="/" element={<Navigate to="/business/dashboard" replace />} />
                    
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/faq" element={<FAQ />} />

                    {/* Business Section */}
                    <Route path="/business/dashboard" element={<BusinessDashboard />} />
                    <Route path="/business/inventory" element={<BusinessInventory />} />
                    <Route path="/business/barcode" element={<BusinessBarcode />} />
                    <Route path="/business/billing" element={<BusinessBilling />} />
                    <Route path="/business/orders" element={<BusinessSalesOrders />} />
                    <Route path="/business/purchases" element={<BusinessPurchases />} />
                    <Route path="/business/plan" element={<BusinessFinancialPlan />} />
                    <Route path="/business/compare" element={<BusinessCompare />} />
                    <Route path="/business/staffing" element={<BusinessStaffing />} />
                    <Route path="/business/attendance" element={<BusinessAttendance />} />
                    <Route path="/business/payroll" element={<BusinessPayroll />} />
                    <Route path="/business/segregation" element={<BusinessSegregation />} />
                    <Route path="/business/crm" element={<BusinessCRM />} />
                    <Route path="/business/returns" element={<BusinessReturns />} />
                    <Route path="/business/stock" element={<BusinessStock />} />
                    <Route path="/business/suppliers" element={<BusinessSuppliers />} />
                    <Route path="/business/payments" element={<BusinessPayments />} />
                    <Route path="/business/bank-accounts" element={<BusinessBankAccounts />} />
                    <Route path="/business/expenses" element={<BusinessExpenses />} />
                    <Route path="/business/warehouse" element={<BusinessWarehouse />} />
                    <Route path="/business/accounting" element={<BusinessAccounting />} />
                    <Route path="/business/gst" element={<BusinessGST />} />
                    <Route path="/business/marketing" element={<BusinessMarketing />} />
                    <Route path="/business/delivery" element={<BusinessDelivery />} />
                    <Route path="/business/manufacturing" element={<BusinessManufacturing />} />
                    <Route path="/business/reports" element={<BusinessReports />} />
                    <Route path="/business/subscription" element={<BusinessSubscription />} />
                    <Route path="/business/meetup" element={<BusinessPlaceholder title="Business Meetup" />} />
                    <Route path="/business/investors" element={<BusinessPlaceholder title="Business Investors" />} />
                    <Route path="/business/referral" element={<BusinessPlaceholder title="Refer & Earn" />} />
                  </Routes>
                </Suspense>
              </MainLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
