import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ErrorBoundary } from './components/common';
import MainLayout from './layouts/MainLayout';
import { FeatureGate } from './components/common/FeatureGate';
import Landing from './pages/Landing';

// Standard Imports for critical pathways to prevent chunk load failures
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import FAQ from './pages/FAQ';

// Admin Section Imports
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminModeration from './pages/admin/AdminModeration';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSales from './pages/admin/AdminSales';
import AdminSalesTeam from './pages/admin/AdminSalesTeam';
import AdminSalesLeads from './pages/admin/AdminSalesLeads';

// Platform Marketing Reps Section Imports
import SalesLogin from './pages/salesAgent/SalesLogin';
import SalesDashboard from './pages/salesAgent/SalesDashboard';
import SalesLeads from './pages/salesAgent/SalesLeads';

// Customer Support Section Imports
import SupportLogin from './pages/support/SupportLogin';
import SupportDashboard from './pages/support/SupportDashboard';
import AdminSupportTeam from './pages/admin/AdminSupportTeam';

import BusinessDashboard from './pages/BusinessDashboard';
import BusinessCA from './pages/BusinessCA';
import BusinessPlaceholder from './pages/BusinessPlaceholder';
import BusinessInventory from './pages/BusinessInventory';
import BusinessBilling from './pages/BusinessBilling';
import BusinessSalesOrders from './pages/BusinessSalesOrders';
import BusinessPurchases from './pages/BusinessPurchases';
import BusinessCRM from './pages/BusinessCRM';
import BusinessStaffing from './pages/BusinessStaffing';
import BusinessFinancialPlan from './pages/BusinessFinancialPlan';
import BusinessSegregation from './pages/BusinessSegregation';
import BusinessSplitCollect from './pages/BusinessSplitCollect';
import BusinessCompare from './pages/BusinessCompare';

import BusinessAccounting from './pages/BusinessAccounting';
import BusinessMarketing from './pages/BusinessMarketing';
import BusinessReports from './pages/BusinessReports';
import BusinessSuppliers from './pages/BusinessSuppliers';
import BusinessReturns from './pages/BusinessReturns';
import BusinessStock from './pages/BusinessStock';
import BusinessWarehouse from './pages/BusinessWarehouse';
import BusinessPayments from './pages/BusinessPayments';
import BusinessWallet from './pages/BusinessWallet';
import BusinessBankAccounts from './pages/BusinessBankAccounts';
import BusinessExpenses from './pages/BusinessExpenses';
import BusinessGST from './pages/BusinessGST';
import BusinessAttendance from './pages/BusinessAttendance';
import BusinessPayroll from './pages/BusinessPayroll';
import BusinessDelivery from './pages/BusinessDelivery';
import BusinessManufacturing from './pages/BusinessManufacturing';
import BusinessSubscription from './pages/BusinessSubscription';
import BusinessBarcode from './pages/BusinessBarcode';
import BusinessCustomization from './pages/BusinessCustomization';
import BusinessPOS from './pages/BusinessPOS';
import BusinessPurposeWallet from './pages/BusinessPurposeWallet';
import BusinessReferral from './pages/BusinessReferral';
import BusinessRewards from './pages/BusinessRewards';
import BusinessTrading from './pages/BusinessTrading';
import BusinessPeople from './pages/BusinessPeople';
import BusinessPaymentPlan from './pages/BusinessPaymentPlan';
import BusinessMeetup from './pages/BusinessMeetup';
import BusinessPitches from './pages/BusinessPitches';
import VerifyPass from './pages/VerifyPass';

import './App.css';



const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px', color: '#64748B' }}>
    Loading...
  </div>
);

const GlobalAlert = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      setMessage(msg);
      setIsOpen(true);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', padding: '2rem', animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E2E8F0',
        transform: 'translateY(0)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: '0.75rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
          {String(message)}
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          style={{
            width: '100%', padding: '0.85rem', marginTop: '1.5rem', borderRadius: '14px', border: 'none',
            background: '#3B82F6', color: 'white', fontWeight: '800', fontSize: '1rem', cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
          }}
        >
          Got it
        </button>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

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
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={
          <Suspense fallback={<PageLoader />}>
            <AdminLogin />
          </Suspense>
        } />

        <Route path="/sales/login" element={
          <Suspense fallback={<PageLoader />}>
            <SalesLogin />
          </Suspense>
        } />

        <Route path="/support/login" element={
          <Suspense fallback={<PageLoader />}>
            <SupportLogin />
          </Suspense>
        } />

        {/* Public Pass Verification Gate */}
        <Route path="/verify-pass" element={<VerifyPass />} />
        
        {/* Protected Routes - All routes within MainLayout require authentication */}
        <Route path="*" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MainLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Root Redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/faq" element={<FAQ />} />

                    {/* Admin Control Center */}
                    <Route path="/admin/*" element={
                      <ProtectedRoute role="admin">
                        <Routes>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="users" element={<AdminUsers />} />
                          <Route path="moderation" element={<AdminModeration />} />
                          <Route path="logs" element={<AdminAuditLogs />} />
                          <Route path="settings" element={<AdminSettings />} />
                          <Route path="sales" element={<AdminSales />} />
                          <Route path="sales-team" element={<AdminSalesTeam />} />
                          <Route path="sales-leads" element={<AdminSalesLeads />} />
                          <Route path="support-team" element={<AdminSupportTeam />} />
                          <Route path="faq" element={<FAQ />} />
                        </Routes>
                      </ProtectedRoute>
                    } />

                    {/* Sales Representative Workspaces */}
                    <Route path="/sales-portal/*" element={
                      <ProtectedRoute role="sales_agent">
                        <Routes>
                          <Route path="dashboard" element={<SalesDashboard />} />
                          <Route path="leads" element={<SalesLeads />} />
                          <Route path="faq" element={<FAQ />} />
                        </Routes>
                      </ProtectedRoute>
                    } />

                    {/* Customer Support Representative Workspaces */}
                    <Route path="/support-portal/*" element={
                      <ProtectedRoute role="support_agent">
                        <Routes>
                          <Route path="dashboard" element={<SupportDashboard />} />
                          <Route path="faq" element={<FAQ />} />
                        </Routes>
                      </ProtectedRoute>
                    } />

                    {/* Restructured Business Modules */}
                    <Route path="/dashboard" element={<BusinessDashboard />} />
                    <Route path="/inventory/products" element={<BusinessInventory />} />
                    <Route path="/barcode" element={<BusinessBarcode />} />
                    <Route path="/inventory/barcode" element={<Navigate to="/barcode" replace />} />
                    <Route path="/sales/invoice" element={<BusinessBilling />} />
                    <Route path="/sales/orders" element={<BusinessSalesOrders />} />
                    <Route path="/purchases/purchases" element={<BusinessPurchases />} />
                    <Route path="/finance/plan" element={<BusinessFinancialPlan />} />
                    <Route path="/finance/compare" element={<BusinessCompare />} />
                    <Route path="/hr/staff" element={<FeatureGate feature="payroll-attendance" requiredPlanName="Starter Plan"><BusinessStaffing /></FeatureGate>} />
                    <Route path="/hr/attendance" element={<FeatureGate feature="payroll-attendance" requiredPlanName="Starter Plan"><BusinessAttendance /></FeatureGate>} />
                    <Route path="/hr/payroll" element={<FeatureGate feature="payroll-attendance" requiredPlanName="Starter Plan"><BusinessPayroll /></FeatureGate>} />
                    <Route path="/payments/split-collect" element={<BusinessSplitCollect />} />
                    <Route path="/sales/customers" element={<BusinessCRM />} />

                    <Route path="/sales/returns" element={<BusinessReturns />} />
                    <Route path="/inventory/stock" element={<BusinessStock />} />
                    <Route path="/purchases/suppliers" element={<BusinessSuppliers />} />
                    <Route path="/payments/transaction" element={<BusinessPayments key="transaction" />} />
                    <Route path="/payments/wallet" element={<BusinessWallet />} />
                    <Route path="/payments/segregation" element={<BusinessPurposeWallet />} />
                    <Route path="/payments/rewards" element={<BusinessRewards />} />
                    {/* <Route path="/payments/bank-accounts" element={<BusinessBankAccounts />} /> */} {/* Will do in future */}
                    <Route path="/payments/people" element={<BusinessPeople />} />
                    <Route path="/payments/plan" element={<BusinessPaymentPlan />} />

                    <Route path="/finance/expenses" element={<BusinessExpenses />} />
                    <Route path="/inventory/warehouse" element={<FeatureGate feature="basic-warehousing" requiredPlanName="Starter Plan"><BusinessWarehouse /></FeatureGate>} />
                    <Route path="/finance/accounting" element={<FeatureGate feature="accounting" requiredPlanName="Starter Plan"><BusinessAccounting /></FeatureGate>} />
                    <Route path="/finance/gst" element={<FeatureGate feature="gst-filings" requiredPlanName="Starter Plan"><BusinessGST /></FeatureGate>} />
                    <Route path="/marketing" element={<BusinessMarketing />} />
                    <Route path="/ca" element={<BusinessCA />} />
                    <Route path="/sales/delivery" element={<BusinessDelivery />} />
                    <Route path="/manufacturing" element={<BusinessManufacturing />} />
                    <Route path="/reports" element={<BusinessReports />} />
                    <Route path="/pos" element={<BusinessPOS />} />
                    <Route path="/sales/pos" element={<Navigate to="/pos" replace />} />
                    <Route path="/customization" element={<BusinessCustomization />} />
                    <Route path="/subscription" element={<BusinessSubscription />} />
                    <Route path="/social/meetup" element={<BusinessMeetup />} />
                    <Route path="/social/betaclub" element={<BusinessPitches />} />
                    <Route path="/social/investors" element={<Navigate to="/social/betaclub" replace />} />
                    <Route path="/social/trading" element={<BusinessTrading />} />
                    <Route path="/referral" element={<BusinessReferral />} />

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
    <>
      <GlobalAlert />
      <AppContent />
    </>
  );
}

export default App;
