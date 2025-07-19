import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import InvoicesPage from './pages/InvoicesPage';
import RegisterPage from './pages/RegisterPage';
import IncomePage from './pages/IncomePage';
import BudgetsPage from './pages/BudgetsPage';
import NavBar from './components/NavBar';
import ChartOfAccountsPage from './pages/ChartOfAccountsPage';
import JournalEntriesPage from './pages/JournalEntriesPage';
import TrialBalancePage from './pages/TrialBalancePage';
import GeneralLedgerPage from './pages/GeneralLedgerPage';
import PeriodsPage from './pages/PeriodsPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import PayrollPage from './pages/PayrollPage';
import ReimbursementsPage from './pages/ReimbursementsPage';
import LeavePage from './pages/LeavePage';
import FuelLogsPage from './pages/FuelLogsPage';
import DriverHoursPage from './pages/DriverHoursPage';
import ProjectsPage from './pages/ProjectsPage';
import AssetsPage from './pages/AssetsPage';
import MaintenancePage from './pages/MaintenancePage';
import DepreciationPage from './pages/DepreciationPage';
import AssetDetailPage from './pages/AssetDetailPage';
import InventoryRegisterPage from './pages/InventoryRegisterPage';
import InventoryTransactionsPage from './pages/InventoryTransactionsPage';
import ProfilePage from './pages/ProfilePage';
import DebugAuthPage from './pages/DebugAuthPage';
import HSEPage from './pages/HSEPage';
import AdminPage from './pages/AdminPage';
import ProcurementPage from './pages/ProcurementPage';
import TariffPage from './pages/TariffPage';
import FoodAllowancePage from './pages/FoodAllowancePage';
import ClientsPage from './pages/ClientsPage';
import TrackerPage from './pages/TrackerPage';
import AssetPassesPage from './pages/AssetPassesPage';
import EmployeePassesPage from './pages/EmployeePassesPage';
import OvertimePage from './pages/OvertimePage';
import TripAllowancePage from './pages/TripAllowancePage';
import SalesPage from './pages/SalesPage';
import WaterLogPage from './pages/WaterLogPage';
import './custom.css';
// Add imports for new context and components
import { FiscalYearProvider } from './context/FiscalYearContext';
import Sidebar from './components/Sidebar';
import FiscalYearSelector from './components/FiscalYearSelector';
import BudgetAssumptions from './pages/BudgetAssumptions';
import BudgetRevenue from './pages/BudgetRevenue';
import BudgetOpex from './pages/BudgetOpex';
import BudgetStaffing from './pages/BudgetStaffing';
import BudgetLoans from './pages/BudgetLoans';
import BudgetCapex from './pages/BudgetCapex';
import BudgetVariance from './pages/BudgetVariance';
import BudgetContracts from './pages/BudgetContracts';
import BudgetDashboard from './pages/BudgetDashboard';

const App: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');
  const showSidebar = location.pathname.startsWith('/budget');

  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
    return <Navigate to="/login" replace />;
  }
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <FiscalYearProvider>
      {isAuthenticated && <NavBar />}
      {isAuthenticated && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {showSidebar && <Sidebar />}
          <main style={{ flex: 1, padding: '24px', marginLeft: showSidebar ? 220 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <FiscalYearSelector />
            </div>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/income" element={<IncomePage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/budget/assumptions" element={<BudgetAssumptions />} />
              <Route path="/budget/revenue" element={<BudgetRevenue />} />
              <Route path="/budget/opex" element={<BudgetOpex />} />
              <Route path="/budget/staffing" element={<BudgetStaffing />} />
              <Route path="/budget/loans" element={<BudgetLoans />} />
              <Route path="/budget/capex" element={<BudgetCapex />} />
              <Route path="/budget/variance" element={<BudgetVariance />} />
              <Route path="/budget/contracts" element={<BudgetContracts />} />
              <Route path="/budget/reports" element={<BudgetDashboard />} />
              <Route path="/accounts" element={<ChartOfAccountsPage />} />
              <Route path="/journal-entries" element={<JournalEntriesPage />} />
              <Route path="/trial-balance" element={<TrialBalancePage />} />
              <Route path="/general-ledger" element={<GeneralLedgerPage />} />
              <Route path="/periods" element={<PeriodsPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/employees/:id" element={<EmployeeProfilePage />} />
              <Route path="/payroll" element={<PayrollPage />} />
              <Route path="/reimbursements" element={<ReimbursementsPage />} />
              <Route path="/leave" element={<LeavePage />} />
              <Route path="/fuel-logs" element={<FuelLogsPage />} />
              <Route path="/driver-hours" element={<DriverHoursPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/depreciation" element={<DepreciationPage />} />
              <Route path="/assets/:id" element={<AssetDetailPage />} />
              <Route path="/inventory" element={<InventoryRegisterPage />} />
              <Route path="/inventory/transactions" element={<InventoryTransactionsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/debug-auth" element={<DebugAuthPage />} />
              <Route path="/hse" element={<HSEPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/procurement" element={<ProcurementPage />} />
              <Route path="/tariffs" element={<TariffPage />} />
              <Route path="/food-allowance" element={<FoodAllowancePage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/tracker" element={<TrackerPage />} />
              <Route path="/asset-passes" element={<AssetPassesPage />} />
              <Route path="/employee-passes" element={<EmployeePassesPage />} />
              <Route path="/overtime" element={<OvertimePage />} />
              <Route path="/trip-allowance" element={<TripAllowancePage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/water-log" element={<WaterLogPage />} />
              <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            </Routes>
          </main>
        </div>
      )}
      {!isAuthenticated && (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </FiscalYearProvider>
  );
};

export default App;
