import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './router/PrivateRoute';
import { AdminRoute } from './router/PrivateRoute';
import Layout from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import QuoteDetailPage from './pages/QuoteDetailPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/quotes/:id" element={<QuoteDetailPage />} />
              <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Admin routes */}
              <Route path="/admin/users" element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              } />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
    );
}

export default App; 