import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Feedback from './pages/Feedback';
import Admin from './pages/Admin';
import Expenditures from './pages/Expenditures';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminRoute from './auth/AdminRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <Layout>
              <Dashboard />
            </Layout>
          } 
        />
        <Route 
          path="/feedback" 
          element={
            <Layout>
              <Feedback />
            </Layout>
          } 
        />
        <Route 
          path="/expenditures" 
          element={
            <Layout>
              <Expenditures />
            </Layout>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <Layout>
              <Admin />
            </Layout>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;