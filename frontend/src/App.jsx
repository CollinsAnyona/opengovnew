import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Feedback from './pages/Feedback';
import Admin from './pages/Admin';
import Moderation from './pages/Moderation';
import FeedbackManagement from './pages/FeedbackManagement';
import SuperAdmin from './pages/SuperAdmin';
import UserManagement from './pages/UserManagement';
import Expenditures from './pages/Expenditures';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import AIAssistant from './pages/AIAssistant';
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/feedback" 
          element={
            <ProtectedRoute>
              <Layout>
                <Feedback />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expenditures" 
          element={
            <ProtectedRoute>
              <Layout>
                <Expenditures />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/forum" 
          element={
            <ProtectedRoute>
              <Layout>
                <Forum />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/forum/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <ForumPost />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-assistant" 
          element={
            <ProtectedRoute>
              <Layout>
                <AIAssistant />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <Layout>
                <Admin />
              </Layout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/super-admin" 
          element={
            <AdminRoute>
              <Layout>
                <SuperAdmin />
              </Layout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/user-management" 
          element={
            <AdminRoute>
              <Layout>
                <UserManagement />
              </Layout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/moderation" 
          element={
            <AdminRoute>
              <Layout>
                <Moderation />
              </Layout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/feedback-management" 
          element={
            <AdminRoute>
              <Layout>
                <FeedbackManagement />
              </Layout>
            </AdminRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;