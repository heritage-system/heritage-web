// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage'; 
import VRToursPage from './pages/VRToursPage/VRPage';
import DiscoveryPage from './pages/DiscoveryPage/DiscoveryPage';
import CommunityPage from './pages/CommunityPage/CommunityPage';
import Login from './pages/AuthPage/Login';
import MainLayout from './components/HomePage/MainLayout';
import Register from './pages/AuthPage/Register';
import QuizzPage from './pages/QuizzPage/QuizzPage';
import ForgotPassword from './pages/AuthPage/ForgotPassword';
import ResetPassword from './pages/AuthPage/ResetPassword'; 
import ChangePassword from './pages/AuthPage/ChangePassword';
import ChatBoxAI from './components/Chatbox/ChatBoxAI';
import HeritageDetailPage from "./pages/HeritagePage/HeritageDetailPage";
import QuizDetailView from './components/Quizz/QuizDetailView';
import { Toaster } from 'react-hot-toast';
import ViewProfile from './pages/AuthPage/ViewProfile';
import CallbackGoogle from './pages/oauth2/callback/google/page';
import AdminPage from './pages/AdminPage/AdminPage';
import HeritageDetailManagement from './components/Admin/HeritageDetailManagement';
import ReportManagement from './components/Admin/ReportManagement';
import ReportDetailManagement from './components/Admin/ReportDetailManagement';
import ContributionFormPage from './pages/ContributionPage/ContributionFormPage';
import ContributionSearchResponse from './pages/ContributionPage/ContributionPage';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="VRToursPage" element={<MainLayout><VRToursPage /></MainLayout>} />
        <Route path="DiscoveryPage" element={<MainLayout><DiscoveryPage /></MainLayout>} />
        <Route path="CommunityPage" element={<MainLayout><CommunityPage /></MainLayout>} />
        <Route path="/QuizzPage" element={<MainLayout><QuizzPage /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
        <Route path="/reset-password" element={<MainLayout><ResetPassword /></MainLayout>} />
        <Route path="/change-password" element={<MainLayout><ChangePassword /></MainLayout>} />
        <Route path="/heritagedetail/:id" element={<MainLayout><HeritageDetailPage /></MainLayout>} />
        <Route path="/quizdetailview" element={<MainLayout><QuizDetailView /></MainLayout>} />
        <Route path="/view-profile" element={<MainLayout><ViewProfile /></MainLayout>} />
        <Route path="/contribution-form" element={<MainLayout><ContributionFormPage /></MainLayout>} />
        <Route path="/oauth2/callback/google" element={<CallbackGoogle />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/heritage/:id" element={<HeritageDetailManagement />} />
        <Route path="/heritage/:id" element={<HeritageDetailPage />} />
        <Route path="/admin/reports" element={<ReportManagement />} />
        <Route path="/reports/:id" element={<ReportDetailManagement />} />
        <Route path="/contributions" element={<MainLayout><ContributionSearchResponse /></MainLayout>} />


      </Routes>

      {/* <ChatBoxAI /> */}

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            fontSize: '14px',
            borderRadius: '8px',
          },
        }}
      />
    </Router>
  );
};

export default App;
