import ClientsPage from '../pages/ClientsPage';
import AssetPassesPage from '../pages/AssetPassesPage';
import EmployeePassesPage from '../pages/EmployeePassesPage';
import BusinessTripPage from '../pages/BusinessTripPage';
import ViewTripPage from '../pages/ViewTripPage';
import GeneralLedgerPage from '../pages/GeneralLedgerPage';
import ChartOfAccountsPage from '../pages/ChartOfAccountsPage';
import { Route } from 'react-router-dom';

const routes = [
  <Route path="/clients" element={<ClientsPage />} />,
  <Route path="/asset-passes" element={<AssetPassesPage />} />,
  <Route path="/employee-passes" element={<EmployeePassesPage />} />,
  <Route path="/business-trips" element={<BusinessTripPage />} />,
  <Route path="/business-trips/:id" element={<ViewTripPage />} />,
  <Route path="/general-ledger" element={<GeneralLedgerPage />} />,
  <Route path="/chart-of-accounts" element={<ChartOfAccountsPage />} />,
];

export default routes; 