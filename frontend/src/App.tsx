import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/clients/ClientList';
import ClientDetail from './pages/clients/ClientDetail';
import ClientForm from './pages/clients/ClientForm';
import CarList from './pages/cars/CarList';
import CarDetail from './pages/cars/CarDetail';
import CarForm from './pages/cars/CarForm';
import RentalList from './pages/rentals/RentalList';
import RentalDetail from './pages/rentals/RentalDetail';
import RentalForm from './pages/rentals/RentalForm';
import CarReturnForm from './pages/carReturns/CarReturnForm';
import IncidentList from './pages/incidents/IncidentList';
import IncidentForm from './pages/incidents/IncidentForm';
import MaintenanceList from './pages/maintenances/MaintenanceList';
import MaintenanceForm from './pages/maintenances/MaintenanceForm';
import RepairList from './pages/repairs/RepairList';
import RepairForm from './pages/repairs/RepairForm';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';
import BlacklistPage from './pages/blacklist/BlacklistPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="blacklist" element={<BlacklistPage />} />

                <Route path="clients" element={<ClientList />} />
                <Route path="clients/new" element={<ClientForm />} />
                <Route path="clients/:id" element={<ClientDetail />} />
                <Route path="clients/:id/edit" element={<ClientForm />} />

                <Route path="cars" element={<CarList />} />
                <Route path="cars/new" element={<CarForm />} />
                <Route path="cars/:id" element={<CarDetail />} />
                <Route path="cars/:id/edit" element={<CarForm />} />

                <Route path="rentals" element={<RentalList />} />
                <Route path="rentals/new" element={<RentalForm />} />
                <Route path="rentals/:id" element={<RentalDetail />} />

                <Route path="car-returns/new" element={<CarReturnForm />} />

                <Route path="incidents" element={<IncidentList />} />
                <Route path="incidents/new" element={<IncidentForm />} />

                <Route path="maintenances" element={<MaintenanceList />} />
                <Route path="maintenances/new" element={<MaintenanceForm />} />

                <Route path="repairs" element={<RepairList />} />
                <Route path="repairs/new" element={<RepairForm />} />
                <Route path="repairs/:id/edit" element={<RepairForm />} />

                <Route path="employees" element={<EmployeeList />} />
                <Route path="employees/new" element={<EmployeeForm />} />
                <Route path="employees/:id/edit" element={<EmployeeForm />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
