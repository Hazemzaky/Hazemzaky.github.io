import ClientsPage from '../pages/ClientsPage';
import AssetPassesPage from '../pages/AssetPassesPage';
import EmployeePassesPage from '../pages/EmployeePassesPage';
import { Route } from 'react-router-dom';

const routes = [
  <Route path="/clients" element={<ClientsPage />} />,
  <Route path="/asset-passes" element={<AssetPassesPage />} />,
  <Route path="/employee-passes" element={<EmployeePassesPage />} />,
];

export default routes; 