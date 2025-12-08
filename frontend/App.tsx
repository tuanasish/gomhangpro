import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoutePath } from './types';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ProtectedRoute } from './src/components/auth/ProtectedRoute';
import NotificationContainer from './src/components/common/NotificationContainer';
import PageLoader from './src/components/common/PageLoader';

// Pages that need fast load (no lazy loading)
import LoginPage from './pages/Login';
import RoleSelectionPage from './pages/RoleSelection';

// Lazy loaded pages
const StartShiftPage = lazy(() => import('./pages/worker/StartShift'));
const WorkerHomePage = lazy(() => import('./pages/worker/WorkerHome'));
const CreateOrderPage = lazy(() => import('./pages/worker/CreateOrder'));
const OrderDetailPage = lazy(() => import('./pages/worker/OrderDetail'));
const EndShiftPage = lazy(() => import('./pages/worker/EndShift'));
const WorkerHistoryPage = lazy(() => import('./pages/worker/WorkerHistory'));
const WorkerAccountPage = lazy(() => import('./pages/worker/WorkerAccount'));
const ManagerDashboardPage = lazy(() => import('./pages/manager/ManagerDashboard'));
const ManagerOrdersPage = lazy(() => import('./pages/manager/ManagerOrders'));
const AdminShiftsPage = lazy(() => import('./pages/manager/AdminShifts'));
const AdminStaffPage = lazy(() => import('./pages/manager/AdminStaff'));
const AdminCustomersPage = lazy(() => import('./pages/manager/AdminCustomers'));
const AdminCountersPage = lazy(() => import('./pages/manager/AdminCounters'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <HashRouter>
          <NotificationContainer />
          <Routes>
          <Route path={RoutePath.LOGIN} element={<LoginPage />} />
          <Route path={RoutePath.ROLE_SELECTION} element={<RoleSelectionPage />} />
          
          {/* Worker Routes */}
          <Route
            path={RoutePath.WORKER_START_SHIFT}
            element={
              <ProtectedRoute requiredRole="worker">
                <Suspense fallback={<PageLoader />}>
                  <StartShiftPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.WORKER_HOME}
            element={
              <ProtectedRoute requiredRole="worker">
                <Suspense fallback={<PageLoader />}>
                  <WorkerHomePage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.WORKER_CREATE_ORDER}
            element={
              <ProtectedRoute requiredRole="worker">
                <Suspense fallback={<PageLoader />}>
                  <CreateOrderPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.WORKER_ORDER_DETAIL}
            element={
              <ProtectedRoute requiredRole="worker">
                <Suspense fallback={<PageLoader />}>
                  <OrderDetailPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.WORKER_END_SHIFT}
            element={
              <ProtectedRoute requiredRole="worker">
                <Suspense fallback={<PageLoader />}>
                  <EndShiftPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.WORKER_HISTORY}
            element={
              <ProtectedRoute requiredRole="worker">
                <Suspense fallback={<PageLoader />}>
                  <WorkerHistoryPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.WORKER_ACCOUNT}
            element={
              <ProtectedRoute requiredRole="worker">
                <Suspense fallback={<PageLoader />}>
                  <WorkerAccountPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.WORKER_CUSTOMERS}
            element={
              <ProtectedRoute requiredRole="worker">
                <Suspense fallback={<PageLoader />}>
                  <AdminCustomersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.WORKER_COUNTERS}
            element={
              <ProtectedRoute requiredRole="worker">
                <Suspense fallback={<PageLoader />}>
                  <AdminCountersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          {/* Manager/Admin Routes */}
          <Route
            path={RoutePath.MANAGER_DASHBOARD}
            element={
              <ProtectedRoute requiredRole="manager">
                <Suspense fallback={<PageLoader />}>
                  <ManagerDashboardPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.MANAGER_ORDERS}
            element={
              <ProtectedRoute requiredRole="manager">
                <Suspense fallback={<PageLoader />}>
                  <ManagerOrdersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.ADMIN_SHIFTS}
            element={
              <ProtectedRoute requiredRole="manager">
                <Suspense fallback={<PageLoader />}>
                  <AdminShiftsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.ADMIN_STAFF}
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminStaffPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.ADMIN_CUSTOMERS}
            element={
              <ProtectedRoute requiredRole="manager">
                <Suspense fallback={<PageLoader />}>
                  <AdminCustomersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutePath.ADMIN_COUNTERS}
            element={
              <ProtectedRoute requiredRole="manager">
                <Suspense fallback={<PageLoader />}>
                  <AdminCountersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to={RoutePath.LOGIN} replace />} />
          </Routes>
        </HashRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;